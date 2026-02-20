using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Cars24API.Models;

[BsonIgnoreExtraElements]
public class Car
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserId { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }

    public decimal Price { get; set; }
    public decimal Emi { get; set; } 

    public int KmDriven { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    
    public List<string> Features { get; set; } = new();
    public List<string> Highlights { get; set; } = new();

    public string BodyType { get; set; } = string.Empty;
    public decimal RecommendedPrice { get; set; }

    public string Status { get; set; } = "Available"; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string Title { get; set; } = string.Empty;
    public CarSpecs? Specs { get; set; }
}

public class CarSpecs 
{
    public string Km { get; set; } = string.Empty;
    public string Fuel { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public int Year { get; set; }
}