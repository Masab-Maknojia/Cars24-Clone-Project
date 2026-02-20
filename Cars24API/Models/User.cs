using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24API.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string? FcmToken { get; set; }

    public List<string> BookingId { get; set; } = new List<string>();

    public NotificationPreferences Preferences { get; set; } = new NotificationPreferences();

    public string ReferralCode { get; set; } = string.Empty;
    public string ReferredBy { get; set; } = string.Empty;
    public decimal WalletBalance { get; set; } = 0;
    public List<WalletTransaction> WalletHistory { get; set; } = new(); 
}

public class NotificationPreferences
{
    public bool Appointments { get; set; } = true;
    public bool PriceDrops { get; set; } = true;
    public bool BidUpdates { get; set; } = true;
    public bool NewMessages { get; set; } = true;
}

public class WalletTransaction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public decimal Amount { get; set; }
    public string Type { get; set; } = "Credit";
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
}