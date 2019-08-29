using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

using Func;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Func
{
    public class SmartThingsServiceProvider : IPowerServiceProvider
    {
        private readonly HttpClient _client;
        private readonly SmartThingsApiConfiguration _config;
        private readonly ILogger<SmartThingsServiceProvider> _log;

        public SmartThingsServiceProvider(HttpClient client, IOptions<SmartThingsApiConfiguration> config, ILogger<SmartThingsServiceProvider> logger)
        {
            _client = client;
            _config = config.Value;
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", config.Value.ApiKey);
            _log = logger;
            logger.LogDebug($"starting up st api provider, endpoint: {_config.SmartThingsRootApiUrl}, key {_config.ApiKey}");
        }

        public async Task<IEnumerable<Device>> GetDevicesWithCapabilitiesAsync(params string[] capabilities)
        {
            var cap = string.Concat(capabilities.Select(x => $"capability={x}&")).TrimEnd('&');
            var data = await MakeRequestAsync<IList<Device>>($"devices?{cap}", x =>
            {
                return JsonConvert.DeserializeObject<List<Device>>(x.items.ToString());
            });

            var stuff = data.Select(async x =>
            {
                x.State = await GetDeviceStateAsync(x.Id);
                _log.LogDebug($"{x.Id}: {x.Label}, {x.State.PowerMeterInW}W, {x.State.EnergyMeterInkWh}kWh");
                return x;
            });

            return await Task.WhenAll(stuff);
        }

        private async Task<DeviceState> GetDeviceStateAsync(string deviceId)
        {
            var uri = $"devices/{deviceId}/status";
            var data = await MakeRequestAsync<DeviceState>(uri, x =>
            {
                var power = x.components.main.powerMeter.power.value;
                var energy = x.components.main.energyMeter.energy.value;
                return new DeviceState() { PowerMeterInW = power, EnergyMeterInkWh = energy };
            });

            return data;
        }

        private async Task<T> MakeRequestAsync<T>(string uriPath, Func<dynamic, T> work)
        {
            var uri = $"{_config.SmartThingsRootApiUrl}{uriPath}";
            //Console.WriteLine($"requesting {uri}");
            var response = await _client.GetAsync(uri);
            if (!response.IsSuccessStatusCode)
            {
                dynamic errorData = JsonConvert.DeserializeObject(await response.Content.ReadAsStringAsync());
                Console.WriteLine($"{errorData.error}");
            }
            dynamic stuff = JsonConvert.DeserializeObject(await response.Content.ReadAsStringAsync());
            return work(stuff);
        }
    }
}