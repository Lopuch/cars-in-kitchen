namespace CarsInKitchen.Api.Models
{
    public class Vehicle
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
        public required double Energy { get; set; }
        public required string Password { get; set; }
    }
}
