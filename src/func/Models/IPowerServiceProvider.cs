using System.Collections.Generic;
using System.Threading.Tasks;

namespace Func
{
    public interface IPowerServiceProvider
    {
        Task<IEnumerable<Device>> GetDevicesWithCapabilitiesAsync(params string[] capabilities);
    }
}