using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections.Generic;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;

namespace Func
{
    public static class Wol
    {
        [FunctionName("wol")]
        public static IActionResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req, ILogger log)
        {
            var servers = new List<WakeOnLanServer>() {
                new WakeOnLanServer("server01", "40:16:7e:6a:1f:f6"),
                new WakeOnLanServer("jpda-x8930", "D8:9E:F3:98:1B:08")
            };
            return new OkObjectResult(servers);
        }
    }

    public class WakeOnLanServer
    {
        public string Key { get; set; }
        public string Value { get; set; }

        public WakeOnLanServer(string key, string value)
        {
            Key = key;
            Value = value;
        }
    }
}