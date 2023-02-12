using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarsInKitchen.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        [HttpGet("getVehicleList")]
        public async Task<IActionResult> GetVehicleList()
        {
            return Ok();
        }
    }
}
