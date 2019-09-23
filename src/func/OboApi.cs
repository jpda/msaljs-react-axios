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
using Microsoft.Extensions.Options;
using System.Collections.Generic;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Func
{
    public class OboWhoApi
    {
        private readonly string _apiUrl;
        private readonly List<string> _scopes;
        private readonly IConfidentialClientApplication _aadApp;
        private readonly ILogger<OboWhoApi> _log;
        private readonly HttpClient _httpClient;
        public OboWhoApi(IConfidentialClientApplication app, HttpClient client, ILogger<OboWhoApi> log, IOptions<OboApiConfiguration> opts)
        {
            _log = log;
            _aadApp = app;
            _httpClient = client;
            _apiUrl = opts.Value.EndpointUrl;
            _scopes = opts.Value.Scopes;
        }

        [FunctionName("who-api")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req, ILogger log)
        {
            var accessTokenForThis = req.Headers["Authorization"].ToString().Split(" ")[1];
            _log.LogTrace("Got access token from header, using that in assertion");
            _log.LogTrace(accessTokenForThis);
            var tokenRequest = _aadApp.AcquireTokenOnBehalfOf(_scopes, new UserAssertion(accessTokenForThis));
            var token = await tokenRequest.ExecuteAsync();
            _log.LogTrace($"Got new access token obo: {token.AccessToken}");

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token.AccessToken);
            var ping = await _httpClient.GetAsync(_apiUrl);

            if (ping.IsSuccessStatusCode)
            {
                return new OkObjectResult(new { data = await ping.Content.ReadAsStringAsync() });
            }
            return new BadRequestObjectResult(new { data = ping.StatusCode, message = ping.ReasonPhrase });
        }
    }
}