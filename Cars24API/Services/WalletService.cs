using Cars24API.Models;
using MongoDB.Driver;

namespace Cars24API.Services;

public class WalletService
{
    private readonly IMongoCollection<User> _users;

    public WalletService(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("Cars24DB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
        _users = database.GetCollection<User>("Users");
    }

    public string GenerateReferralCode()
    {
        return "REF-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper() + 
               new Random().Next(100, 999).ToString();
    }

    public async Task CreditWalletAsync(string userId, decimal amount, string description)
    {
        if (amount <= 0) return;

        var transaction = new WalletTransaction
        {
            Amount = amount,
            Type = "Credit",
            Description = description,
            Date = DateTime.UtcNow
        };

        var filter = Builders<User>.Filter.Eq(x => x.Id, userId);
        var update = Builders<User>.Update
            .Inc(x => x.WalletBalance, amount)
            .Push(x => x.WalletHistory, transaction);

        await _users.UpdateOneAsync(filter, update);
    }

    public async Task<bool> DebitWalletAsync(string userId, decimal amount, string description)
    {
        var user = await _users.Find(x => x.Id == userId).FirstOrDefaultAsync();
        if (user == null || user.WalletBalance < amount) return false;

        var transaction = new WalletTransaction
        {
            Amount = amount,
            Type = "Debit",
            Description = description,
            Date = DateTime.UtcNow
        };

        var filter = Builders<User>.Filter.Eq(x => x.Id, userId);
        var update = Builders<User>.Update
            .Inc(x => x.WalletBalance, -amount)
            .Push(x => x.WalletHistory, transaction);

        await _users.UpdateOneAsync(filter, update);
        return true;
    }

    public async Task AwardReferralBonusAsync(string newUserId)
    {
        var newUser = await _users.Find(x => x.Id == newUserId).FirstOrDefaultAsync();
        
        if (newUser == null || string.IsNullOrEmpty(newUser.ReferredBy)) return;

        var referrer = await _users.Find(x => x.ReferralCode == newUser.ReferredBy).FirstOrDefaultAsync();
        
        if (referrer != null)
        {
            decimal bonusAmount = 500;
            await CreditWalletAsync(referrer.Id, bonusAmount, $"Referral Bonus for inviting {newUser.FullName}");
            await CreditWalletAsync(newUser.Id, bonusAmount, $"Welcome Bonus for using referral code {referrer.ReferralCode}");
        }
    }

    public async Task<User?> GetUserWalletAsync(string userId)
    {
        var user = await _users.Find(x => x.Id == userId).FirstOrDefaultAsync();
        
        if (user != null && string.IsNullOrEmpty(user.ReferralCode))
        {
            string newCode = GenerateReferralCode();
            
            var update = Builders<User>.Update.Set(x => x.ReferralCode, newCode);
            await _users.UpdateOneAsync(x => x.Id == userId, update);

            user.ReferralCode = newCode;
        }

        return user;
    }
}