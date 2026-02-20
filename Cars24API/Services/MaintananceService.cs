using MongoDB.Driver;
using Cars24API.Models;

namespace Cars24API.Services;

public class MaintenanceService
{
    private readonly IMongoCollection<MaintenanceRecord> _maintenanceCollection;
    private readonly CarService _carService; 

    public MaintenanceService(IConfiguration config, CarService carService)
    {
        var client = new MongoClient(config.GetConnectionString("Cars24DB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);

        _maintenanceCollection = database.GetCollection<MaintenanceRecord>("MaintenanceRecords");
        _carService = carService;
    }

    public async Task<List<MaintenanceRecord>> GetByCarIdAsync(string carId) =>
        await _maintenanceCollection.Find(x => x.CarId == carId).ToListAsync();

    public async Task CreateRoutineForCarAsync(string carId)
    {
        var car = await _carService.GetByIdAsync(carId);
        if (car == null) return;

        int carAge = DateTime.UtcNow.Year - car.Year; 

        if (carAge > 5 || car.KmDriven > 50000)
        {
            string carName = $"{car.Year} {car.Brand} {car.Model}";

            var routine = new MaintenanceRecord
            {
                CarId = carId,
                ServiceType = "Major Service",
                Description = $"Recommended major service for {carName} due to age/mileage.",
                Cost = 5000,
                Date = DateTime.UtcNow.AddDays(7),
                Status = "Scheduled"
            };

            await _maintenanceCollection.InsertOneAsync(routine);
        }
    }
    
    public async Task CreateAsync(MaintenanceRecord record) =>
        await _maintenanceCollection.InsertOneAsync(record);
}