using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24API.Models;

public class MaintenanceRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string CarId { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = "Scheduled";
}