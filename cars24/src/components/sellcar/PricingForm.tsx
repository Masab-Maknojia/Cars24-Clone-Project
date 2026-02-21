import { AlertCircle, CreditCard, DollarSign, Tag, TrendingUp, Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation } from "@/context/LocationContext";

type CarDetails = {
  id: string;
  title: string;
  images: string[];
  price: string;
  emi: string;
  location: string;
  bodyType?: string;
  specs: {
    year: number;
    km: string;
    fuel: string;
    transmission: string;
    owner: string;
    insurance: string;
  };
  features: string[];
  highlights: string[];
};

interface PricingFormprop {
  carDetails: CarDetails;
  updateCarDetails: (details: Partial<CarDetails>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  prevStep: () => void;
}

const PricingForm: React.FC<PricingFormprop> = ({
  carDetails,
  updateCarDetails,
  handleSubmit,
  prevStep,
}) => {
  const [isValid, setIsValid] = useState(false);
  const { city } = useLocation();

  useEffect(() => {
    setIsValid(!!carDetails.price);
  }, [carDetails.price]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    const formattedValue = value ? parseInt(value, 10).toLocaleString('en-IN') : "";
    updateCarDetails({ price: formattedValue });
  };

  const handleEmiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCarDetails({ emi: e.target.value });
  };

  const calculateDynamicPrice = (basePrice: number, userCity: string, car: any) => {
    if (!basePrice) return 0;
    
    let multiplier = 1.0;
    const currentMonth = new Date().getMonth() + 1;
    const isMonsoon = currentMonth >= 6 && currentMonth <= 9;
    
    const locationLower = (car.location || userCity || "").toLowerCase();
    const bodyType = (car.bodyType || car.title || "").toLowerCase();
    
    const isHillyOrRainy = locationLower.includes("mumbai") || locationLower.includes("pune") || locationLower.includes("shimla") || locationLower.includes("dehradun");
    const isMetro = locationLower.includes("delhi") || locationLower.includes("bangalore") || locationLower.includes("mumbai") || locationLower.includes("chennai") || locationLower.includes("hyderabad");
    
    if ((bodyType.includes("suv") || bodyType.includes("off-road") || bodyType.includes("jeep")) && (isMonsoon || isHillyOrRainy)) {
        multiplier += 0.05;
    }
    
    if (bodyType.includes("hatchback") && isMetro) {
        multiplier -= 0.03;
    }
    
    if (bodyType.includes("convertible")) {
        if (currentMonth >= 11 || currentMonth <= 2) multiplier -= 0.04;
        else if (currentMonth >= 3 && currentMonth <= 5) multiplier += 0.03;
    }

    if (multiplier === 1.0) {
        if (isMetro) multiplier += 0.015; 
        else multiplier -= 0.01;          
    }

    const calculatedPrice = basePrice * multiplier;
    return Math.round(calculatedPrice / 500) * 500; 
  };

  const rawPrice = carDetails.price ? parseInt(carDetails.price.replace(/[^\d]/g, ""), 10) : 0;
  const recPrice = calculateDynamicPrice(rawPrice, city, carDetails);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Pricing Information</h2>
        <p className="text-gray-600">Set your car's price and EMI details</p>
      </div>

      {/* Price Section */}
      <div className="space-y-5">
        <div>
          <label
            htmlFor="price"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <Tag className="h-4 w-4 mr-1 text-gray-500" /> Car Price (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">₹</span>
            </div>
            <input
              type="text"
              id="price"
              className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 5,00,000"
              value={carDetails.price}
              onChange={handlePriceChange}
              required
            />
          </div>
          <div className="mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
            <p className="text-sm text-blue-600">
              Setting the right price increases your chances of selling quickly
            </p>
          </div>

          {/* DYNAMIC MARKET ESTIMATE UI */}
          {recPrice > 0 && recPrice !== rawPrice && (
             <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 w-fit px-3 py-2 rounded-md border border-emerald-100">
               <TrendingUp className="w-4 h-4" />
               <span className="font-semibold">Est. Market Value: ₹ {recPrice.toLocaleString('en-IN')}</span>
               <div className="group relative ml-1 flex items-center">
                  <Info className="w-4 h-4 text-emerald-500 cursor-pointer" />
                  <div className="absolute left-0 top-full mt-1 hidden w-64 rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:block z-50">
                    This estimate is dynamically adjusted based on your car's profile, season, and regional market trends ({carDetails.location || city || "Default"}).
                  </div>
               </div>
             </div>
          )}
        </div>

        {/* EMI Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="emi"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <CreditCard className="h-4 w-4 mr-1 text-gray-500" /> EMI Starting
              From (₹)
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">₹</span>
            </div>
            <input
              type="text"
              id="emi"
              className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Monthly EMI amount"
              value={carDetails.emi}
              onChange={handleEmiChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-500">/mo</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            EMI is calculated based on current interest rates and a 5-year loan
            term
          </p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Listing Summary
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Car Title</span>
            <span className="text-sm font-medium">
              {carDetails.title || "Not provided"}
            </span>
          </div>

          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Location</span>
            <span className="text-sm font-medium">
              {carDetails.location || "Not provided"}
            </span>
          </div>

          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Year</span>
            <span className="text-sm font-medium">
              {carDetails.specs.year || "Not provided"}
            </span>
          </div>

          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Price</span>
            <span className="text-sm font-medium">
              {carDetails.price ? `₹ ${carDetails.price}` : "Not provided"}
            </span>
          </div>

          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">EMI from</span>
            <span className="text-sm font-medium">
              {carDetails.emi ? `₹ ${carDetails.emi}/month` : "Not provided"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Images</span>
            <span className="text-sm font-medium">
              {carDetails.images.length} uploaded
            </span>
          </div>
        </div>
      </div>
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
            isValid
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <DollarSign className="w-5 h-5" /> List My Car
        </button>
      </div>
    </form>
  );
};

export default PricingForm;