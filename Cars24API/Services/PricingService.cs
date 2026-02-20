using Cars24API.Models;
using System;

namespace Cars24API.Services;

public class PricingService
{
    public int CalculateRecommendedPrice(Car car)
    {
        if (car == null || car.Price <= 0) return 0;

        decimal multiplier = 1.0m;
        string location = car.Location?.ToLower() ?? "";
        string bodyType = car.BodyType?.ToLower() ?? "";
        
        int currentMonth = DateTime.Now.Month; 

        bool isMonsoon = currentMonth >= 6 && currentMonth <= 9; // June to Sept
        bool isHillyOrRainy = location.Contains("mumbai") || location.Contains("pune") || location.Contains("shimla");
        bool isMetro = location.Contains("delhi") || location.Contains("bangalore") || location.Contains("mumbai") || location.Contains("chennai");


        if ((bodyType.Contains("suv") || bodyType.Contains("off-road")) && (isMonsoon || isHillyOrRainy))
        {
            multiplier += 0.05m;
        }

        if (bodyType.Contains("hatchback") && isMetro)
        {
            multiplier -= 0.03m;
        }

        decimal recommendedPrice = car.Price * multiplier;
        
        return (int)(Math.Round(recommendedPrice / 500.0m) * 500m);
    }
}