using System;
using System.Net.Http;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Func
{
    public class Startup : FunctionsStartup
    {
        public Startup() { }

        public override void Configure(IFunctionsHostBuilder builder)
        {
            var config = new ConfigurationBuilder().SetBasePath(Environment.CurrentDirectory).AddJsonFile("local.settings.json", optional: true).AddEnvironmentVariables().Build();

            builder.Services.AddLogging();
            builder.Services.AddSingleton(new HttpClient());

            builder.Services.Configure<SmartThingsApiConfiguration>(config.GetSection("SmartThingsApiConfiguration"));
            builder.Services.AddSingleton<IPowerServiceProvider, SmartThingsServiceProvider>();

        }
    }
}