using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Client;
using System.Net.Http;

using Func;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Func
{
    public class OboWhoApi
    {
        private const string ApiUrl = "https://aad-func.azurewebsites.net/api/who";
        private readonly IConfidentialClientApplication _aadApp;
        private readonly ILogger<OboWhoApi> _log;
        private readonly HttpClient _httpClient;
        public OboWhoApi(IConfidentialClientApplication app, HttpClient client, ILoggerFactory logFactory)
        {
            _log = logFactory.CreateLogger<OboWhoApi>();
            _aadApp = app;
            _httpClient = client;
        }

        [FunctionName("who-api")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req, ILogger log)
        {
            var accessTokenForThis = req.Headers["Authorization"].ToString().Split(" ")[1];
            
            log.LogInformation("Got access token from header, using that in assertion");
            log.LogInformation(accessTokenForThis);
            var tokenRequest = _aadApp.AcquireTokenOnBehalfOf(new[] { "https://aad-func.azurewebsites.net/user_impersonation" }, new UserAssertion(accessTokenForThis));
            var token = await tokenRequest.ExecuteAsync();
            log.LogInformation($"Got new access token obo: {token.AccessToken}");
            
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token.AccessToken);
            var ping = await _httpClient.GetAsync(ApiUrl);

            if (ping.IsSuccessStatusCode)
            {
                return new OkObjectResult(new { data = await ping.Content.ReadAsStringAsync() });
            }
            return new BadRequestObjectResult(new { data = ping.StatusCode, message = ping.ReasonPhrase });
        }
    }
}