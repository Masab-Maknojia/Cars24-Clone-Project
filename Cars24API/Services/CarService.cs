using MongoDB.Driver;
using MongoDB.Bson;
using Cars24API.Models;

namespace Cars24API.Services;

public class CarService
{
    private readonly IMongoCollection<Car> _carsCollection;
    private readonly UserService _userService;
    private readonly NotificationService _notificationService;
    private readonly PricingService _pricingService; 

    public CarService(IConfiguration config, UserService userService, NotificationService notificationService, PricingService pricingService)
    {
        var client = new MongoClient(config.GetConnectionString("Cars24DB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);

        _carsCollection = database.GetCollection<Car>("Cars");
        _userService = userService;
        _notificationService = notificationService;
        _pricingService = pricingService;
    }

    public async Task<List<Car>> GetAllAsync() 
    {
        var cars = await _carsCollection.Find(_ => true).ToListAsync();
        foreach (var car in cars)
        {
            car.RecommendedPrice = _pricingService.CalculateRecommendedPrice(car);
        }
        return cars;
    }

    public async Task<Car?> GetByIdAsync(string id)
    {
        var car = await _carsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (car != null)
        {
            car.RecommendedPrice = _pricingService.CalculateRecommendedPrice(car);
        }
        return car;
    }

    public async Task CreateAsync(Car newCar)
    {
        newCar.RecommendedPrice = _pricingService.CalculateRecommendedPrice(newCar);

        await _carsCollection.InsertOneAsync(newCar);

        try 
        {
            if (!string.IsNullOrEmpty(newCar.UserId))
            {
                var seller = await _userService.GetByIdAsync(newCar.UserId);

                if (seller != null && !string.IsNullOrEmpty(seller.FcmToken))
                {
                    await _notificationService.SendNotificationAsync(
                        seller.FcmToken,
                        "Car Listed Successfully! 🚗",
                        $"Your {newCar.Year} {newCar.Brand} {newCar.Model} is now live on Cars24 Clone."
                    );
                    Console.WriteLine($"[DEBUG] Listing Notification sent to {seller.Email}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DEBUG] Failed to send listing notification: {ex.Message}");
        }
    }

    public async Task UpdateAsync(string id, Car updatedCar)
    {
        updatedCar.RecommendedPrice = _pricingService.CalculateRecommendedPrice(updatedCar);
        
        await _carsCollection.ReplaceOneAsync(x => x.Id == id, updatedCar);
    }

    public async Task RemoveAsync(string id) =>
        await _carsCollection.DeleteOneAsync(x => x.Id == id);

    public async Task<List<Car>> SearchAsync(string? query, string? fuelType, string? transmission, string? bodyType, int? minPrice, int? maxPrice, int? minYear, int? maxKm, string? city)
    {
        var builder = Builders<Car>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrEmpty(fuelType))
            filter &= builder.Eq(x => x.FuelType, fuelType);
        
        if (!string.IsNullOrEmpty(transmission))
            filter &= builder.Eq(x => x.Transmission, transmission);

        if (!string.IsNullOrEmpty(bodyType))
            filter &= builder.Eq(x => x.BodyType, bodyType);

        if (minPrice.HasValue)
            filter &= builder.Gte(x => x.Price, minPrice.Value);

        if (maxPrice.HasValue)
            filter &= builder.Lte(x => x.Price, maxPrice.Value);

        if (minYear.HasValue)
            filter &= builder.Gte(x => x.Year, minYear.Value);

        if (maxKm.HasValue)
            filter &= builder.Lte(x => x.KmDriven, maxKm.Value);

        if (!string.IsNullOrEmpty(city))
        {
            filter &= builder.Regex(x => x.Location, new BsonRegularExpression(city, "i"));
        }

        var cars = await _carsCollection.Find(filter).ToListAsync();

        foreach (var car in cars)
        {
            car.RecommendedPrice = _pricingService.CalculateRecommendedPrice(car);
        }

        if (string.IsNullOrWhiteSpace(query))
        {
            return cars;
        }

        var queryLower = query.ToLower().Trim();
        var scoredCars = new List<(Car Car, int Score)>();

        foreach (var car in cars)
        {
            int score = 0;
            string brand = car.Brand?.ToLower() ?? "";
            string model = car.Model?.ToLower() ?? "";
            string title = car.Title?.ToLower() ?? "";
            string location = car.Location?.ToLower() ?? "";

            if (brand == queryLower || model == queryLower) score += 50;
            if (title.Contains(queryLower)) score += 30;
            if (location.Contains(queryLower)) score += 20;

            if (brand.Contains(queryLower)) score += 10;
            if (model.Contains(queryLower)) score += 10;

            if (score == 0)
            {
                if (IsFuzzyMatch(queryLower, brand)) score += 5;
                else if (IsFuzzyMatch(queryLower, model)) score += 5;
            }

            if (score > 0)
            {
                scoredCars.Add((car, score));
            }
        }

        return scoredCars.OrderByDescending(x => x.Score).Select(x => x.Car).ToList();
    }

    public async Task<List<string>> GetSuggestionsAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<string>();

        var queryLower = query.ToLower();
        var cars = await _carsCollection.Find(_ => true).ToListAsync();

        var suggestions = cars
            .SelectMany(c => new[] { c.Brand, c.Model })
            .Where(s => !string.IsNullOrEmpty(s))
            .Distinct()
            .Where(s => s.ToLower().Contains(queryLower) || IsFuzzyMatch(queryLower, s.ToLower()))
            .Take(5)
            .ToList();

        return suggestions;
    }

    public List<ServiceCenter> GetServiceCenters(string city)
    {
        var centers = new List<ServiceCenter>();
        var cityLower = city?.ToLower().Trim() ?? "";

        if (cityLower.Contains("delhi") || cityLower.Contains("ncr") || cityLower.Contains("noida") || cityLower.Contains("gurgaon"))
        {
            centers.Add(new ServiceCenter("Cars24 Hub - Okhla", "Okhla Industrial Estate Phase 2, New Delhi", 28.5272, 77.2660));
            centers.Add(new ServiceCenter("Cars24 Workshop - Dwarka", "Sector 12, Dwarka, New Delhi", 28.5921, 77.0460));
            centers.Add(new ServiceCenter("Cars24 Yard - Rohini", "Sector 16, Rohini, New Delhi", 28.7366, 77.1132));
            centers.Add(new ServiceCenter("Cars24 Hub - Vasant Kunj", "Nelson Mandela Marg, Vasant Kunj", 28.5424, 77.1558));
            centers.Add(new ServiceCenter("Cars24 Center - Lajpat Nagar", "Ring Road, Lajpat Nagar, New Delhi", 28.5677, 77.2433));
        }
        else if (cityLower.Contains("mumbai") || cityLower.Contains("thane"))
        {
            centers.Add(new ServiceCenter("Cars24 Hub - Andheri", "Andheri East, Mumbai", 19.1136, 72.8697));
            centers.Add(new ServiceCenter("Cars24 Workshop - Navi Mumbai", "Sector 17, Vashi, Navi Mumbai", 19.0771, 72.9986));
            centers.Add(new ServiceCenter("Cars24 Yard - Thane", "Ghodbunder Road, Thane West", 19.2618, 72.9634));
            centers.Add(new ServiceCenter("Cars24 Hub - Borivali", "Link Road, Borivali West, Mumbai", 19.2307, 72.8567));
            centers.Add(new ServiceCenter("Cars24 Premium - Lower Parel", "Senapati Bapat Marg, Lower Parel", 18.9953, 72.8300));
        }
        else if (cityLower.Contains("bangalore") || cityLower.Contains("bengaluru"))
        {
            centers.Add(new ServiceCenter("Cars24 Hub - Koramangala", "80 Feet Road, Koramangala, Bangalore", 12.9352, 77.6245));
            centers.Add(new ServiceCenter("Cars24 Workshop - Whitefield", "ITPL Main Road, Whitefield, Bangalore", 12.9698, 77.7500));
            centers.Add(new ServiceCenter("Cars24 Yard - Electronic City", "Phase 1, Electronic City, Bangalore", 12.8452, 77.6602));
            centers.Add(new ServiceCenter("Cars24 Hub - Indiranagar", "100 Feet Road, Indiranagar, Bangalore", 12.9719, 77.6412));
            centers.Add(new ServiceCenter("Cars24 Center - Yelahanka", "Bellary Road, Yelahanka, Bangalore", 13.1007, 77.5963));
        }
        else if (cityLower.Contains("chennai"))
        {
            centers.Add(new ServiceCenter("Cars24 Hub - Velachery", "Velachery Main Road, Chennai", 12.9815, 80.2180));
            centers.Add(new ServiceCenter("Cars24 Workshop - OMR", "Sholinganallur, OMR, Chennai", 12.9010, 80.2279));
            centers.Add(new ServiceCenter("Cars24 Yard - Anna Nagar", "2nd Avenue, Anna Nagar, Chennai", 13.0850, 80.2101));
            centers.Add(new ServiceCenter("Cars24 Hub - Guindy", "GST Road, Guindy, Chennai", 13.0067, 80.2206));
            centers.Add(new ServiceCenter("Cars24 Center - Adyar", "LB Road, Adyar, Chennai", 13.0012, 80.2565));
        }
        else if (cityLower.Contains("hyderabad"))
        {
            centers.Add(new ServiceCenter("Cars24 Hub - HITEC City", "Madhapur, HITEC City, Hyderabad", 17.4483, 78.3915));
            centers.Add(new ServiceCenter("Cars24 Workshop - Banjara Hills", "Road No. 12, Banjara Hills, Hyderabad", 17.4156, 78.4396));
            centers.Add(new ServiceCenter("Cars24 Yard - Kukatpally", "KPHB Colony, Kukatpally, Hyderabad", 17.4849, 78.3890));
            centers.Add(new ServiceCenter("Cars24 Hub - Secunderabad", "SD Road, Secunderabad", 17.4399, 78.4983));
            centers.Add(new ServiceCenter("Cars24 Center - Gachibowli", "Old Mumbai Hwy, Gachibowli, Hyderabad", 17.4401, 78.3489));
        }
        else if (cityLower.Contains("pune"))
        {
            centers.Add(new ServiceCenter("Cars24 Hub - Hinjewadi", "Phase 1, Hinjewadi, Pune", 18.5913, 73.7389));
            centers.Add(new ServiceCenter("Cars24 Workshop - Viman Nagar", "Pune Nagar Road, Viman Nagar, Pune", 18.5679, 73.9143));
            centers.Add(new ServiceCenter("Cars24 Yard - Kothrud", "Karve Road, Kothrud, Pune", 18.5074, 73.8077));
            centers.Add(new ServiceCenter("Cars24 Hub - Hadapsar", "Magarpatta City Road, Hadapsar, Pune", 18.5089, 73.9259));
            centers.Add(new ServiceCenter("Cars24 Center - Wakad", "Datta Mandir Road, Wakad, Pune", 18.5987, 73.7688));
        }
        else if (cityLower.Contains("kolkata"))
        {
            centers.Add(new ServiceCenter("Cars24 Hub - Salt Lake", "Sector V, Salt Lake City, Kolkata", 22.5726, 88.4338));
            centers.Add(new ServiceCenter("Cars24 Workshop - New Town", "Action Area I, New Town, Kolkata", 22.5804, 88.4646));
            centers.Add(new ServiceCenter("Cars24 Yard - Park Street", "Park Street area, Kolkata", 22.5555, 88.3524));
            centers.Add(new ServiceCenter("Cars24 Hub - Ballygunge", "Ballygunge Circular Road, Kolkata", 22.5280, 88.3659));
            centers.Add(new ServiceCenter("Cars24 Center - Howrah", "Andul Road, Howrah", 22.5803, 88.3223));
        }
        else 
        {
            centers.Add(new ServiceCenter("Cars24 Authorized Center", $"{city} Main Road", 20.5937, 78.9629));
            centers.Add(new ServiceCenter("Cars24 Workshop", $"Industrial Area, {city}", 20.5937, 78.9629));
        }

        return centers;
    }

    private bool IsFuzzyMatch(string source, string target)
    {
        if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target)) return false;
        int distance = ComputeLevenshteinDistance(source, target);
        return distance <= 2;
    }

    private int ComputeLevenshteinDistance(string s, string t)
    {
        int n = s.Length;
        int m = t.Length;
        int[,] d = new int[n + 1, m + 1];

        if (n == 0) return m;
        if (m == 0) return n;

        for (int i = 0; i <= n; d[i, 0] = i++) { }
        for (int j = 0; j <= m; d[0, j] = j++) { }

        for (int i = 1; i <= n; i++)
        {
            for (int j = 1; j <= m; j++)
            {
                int cost = (t[j - 1] == s[i - 1]) ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost);
            }
        }
        return d[n, m];
    }
}

public class ServiceCenter
{
    public string Name { get; set; }
    public string Address { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public ServiceCenter(string name, string address, double lat, double lng)
    {
        Name = name;
        Address = address;
        Latitude = lat;
        Longitude = lng;
    }
}