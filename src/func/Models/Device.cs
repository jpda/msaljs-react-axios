using Newtonsoft.Json;

namespace Func
{
    public class Device
    {
        [JsonProperty("deviceId")]
        public string Id { get; set; }
        public string Label { get; set; }
        public string Name { get; set; }
        public DeviceState State { get; set; }
    }
}