using System.Collections.Generic;

namespace Func
{
    public class SmartThingsApiConfiguration
    {
        public string ApiKey { get; set; }
        public string SmartThingsRootApiUrl { get; set; }
    }

    public class OboApiConfiguration
    {
        public string EndpointUrl { get; set; }
        public List<string> Scopes { get; set; }
    }
}