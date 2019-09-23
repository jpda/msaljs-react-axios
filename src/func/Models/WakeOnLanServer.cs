using System.Collections.Generic;
using System.Threading.Tasks;

namespace Func
{
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