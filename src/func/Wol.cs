using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Func;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Func
{
    public class Wol
    {
        private readonly ILogger<Wol> _log;
        public Wol(ILogger<Wol> log)
        {
            _log = log;
        }

        [FunctionName("wol")]
        public IActionResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req)
        {
            _log.LogTrace("Received request");
            var servers = new List<WakeOnLanServer>() {
                new WakeOnLanServer("server01", "40:16:7e:6a:1f:f6"),
                new WakeOnLanServer("jpda-x8930", "D8:9E:F3:98:1B:08")
            };
            return new OkObjectResult(servers);
        }
    }

    
}