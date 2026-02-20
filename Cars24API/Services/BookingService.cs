using MongoDB.Driver;
using Cars24API.Models;

namespace Cars24API.Services;

public class BookingService
{
    private readonly IMongoCollection<Booking> _bookingsCollection;

    public BookingService(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("Cars24DB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
        _bookingsCollection = database.GetCollection<Booking>("Bookings");
    }

    public async Task<List<Booking>> GetAsync() =>
        await _bookingsCollection.Find(_ => true).ToListAsync();

    public async Task<Booking?> GetAsync(string id) =>
        await _bookingsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Booking newBooking) =>
        await _bookingsCollection.InsertOneAsync(newBooking);

    public async Task UpdateAsync(string id, Booking updatedBooking) =>
        await _bookingsCollection.ReplaceOneAsync(x => x.Id == id, updatedBooking);

    public async Task RemoveAsync(string id) =>
        await _bookingsCollection.DeleteOneAsync(x => x.Id == id);
}