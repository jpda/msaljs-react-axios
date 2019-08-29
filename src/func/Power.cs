using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using Func;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Func
{
    public class Power
    {
        private IPowerServiceProvider _provider;
        //private ILogger<Power> _log;

        public Power(IPowerServiceProvider provider)//, ILogger<Power> log)
        {
            _provider = provider;
            //_log = log;
        }

        [FunctionName("power")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req)
        {
            var devices = await _provider.GetDevicesWithCapabilitiesAsync("powerMeter", "energyMeter");
            return new OkObjectResult(devices);
        }
    }
}