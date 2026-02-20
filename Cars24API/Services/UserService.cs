using MongoDB.Driver;
using Cars24API.Models;

namespace Cars24API.Services;

public class UserService
{
    private readonly IMongoCollection<User> _usersCollection;

    public UserService(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("Cars24DB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
        _usersCollection = database.GetCollection<User>("Users");
    }

    public async Task<List<User>> GetAsync() =>
        await _usersCollection.Find(_ => true).ToListAsync();

    public async Task<User?> GetByIdAsync(string id) =>
        await _usersCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<User?> GetByEmailAsync(string email) =>
        await _usersCollection.Find(x => x.Email == email).FirstOrDefaultAsync();

    public async Task CreateAsync(User newUser) =>
        await _usersCollection.InsertOneAsync(newUser);

    public async Task UpdateAsync(string id, User updatedUser) =>
        await _usersCollection.ReplaceOneAsync(x => x.Id == id, updatedUser);

    public async Task RemoveAsync(string id) =>
        await _usersCollection.DeleteOneAsync(x => x.Id == id);

    public async Task UpdateFcmTokenAsync(string userId, string token)
    {
        var update = Builders<User>.Update.Set(u => u.FcmToken, token);
        await _usersCollection.UpdateOneAsync(x => x.Id == userId, update);
    }

    public async Task UpdatePreferencesAsync(string userId, NotificationPreferences prefs)
    {
        var update = Builders<User>.Update.Set(u => u.Preferences, prefs);
        await _usersCollection.UpdateOneAsync(x => x.Id == userId, update);
    }
}