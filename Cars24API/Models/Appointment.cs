using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24API.Models;

public class Appointment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public string CarId { get; set; } = string.Empty;

    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
}