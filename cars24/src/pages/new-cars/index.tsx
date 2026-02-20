import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Star, Shield, Zap, TrendingUp, Car } from "lucide-react";

const NewCarsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const topBrands = [
    { name: "Maruti Suzuki", count: "15 Models" },
    { name: "Hyundai", count: "12 Models" },
    { name: "Tata", count: "10 Models" },
    { name: "Mahindra", count: "9 Models" },
    { name: "Toyota", count: "8 Models" },
    { name: "Kia", count: "6 Models" },
  ];

  const trendingCars = [
    {
      id: 1,
      name: "Tata Nexon",
      priceRange: "₹ 8.15 - 15.60 Lakh",
      mileage: "17.01 - 24.08 kmpl",
      image: "/api/placeholder/400/250",
      tag: "Best Seller"
    },
    {
      id: 2,
      name: "Mahindra XUV700",
      priceRange: "₹ 13.99 - 26.99 Lakh",
      mileage: "13.0 - 16.5 kmpl",
      image: "/api/placeholder/400/250",
      tag: "Highly Rated"
    },
    {
      id: 3,
      name: "Hyundai Creta",
      priceRange: "₹ 11.00 - 20.15 Lakh",
      mileage: "17.4 - 21.8 kmpl",
      image: "/api/placeholder/400/250",
      tag: "Trending"
    },
    {
      id: 4,
      name: "Toyota Innova Crysta",
      priceRange: "₹ 19.99 - 26.30 Lakh",
      mileage: "10.5 - 14.2 kmpl",
      image: "/api/placeholder/400/250",
      tag: "Family Choice"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black pb-16">
      
      {/* Hero Search Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect New Car</h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Explore the latest cars, compare prices, and get the best offers from authorized dealers near you.
          </p>
          
          <div className="max-w-3xl mx-auto relative">
            <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Type a brand or car model (e.g. 'Tata Safari')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-14 pr-4 py-4 rounded-xl text-gray-900 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-none"
            />
            <button className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        
        {/* Explore Top Brands */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Explore Top Brands</h2>
            <Link href="#" className="text-blue-600 font-semibold hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topBrands.map((brand, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50 transition-colors">
                  <Car className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">{brand.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{brand.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trending New Cars */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500" /> Trending New Cars
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCars.map((car) => (
              <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center shadow-sm">
                    <Star className="w-3 h-3 text-orange-500 fill-orange-500 mr-1" /> {car.tag}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{car.name}</h3>
                  <p className="text-xl font-bold text-blue-600 mb-3">{car.priceRange}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <Zap className="w-4 h-4 mr-1 text-gray-400" /> Mileage: {car.mileage}
                  </div>
                  
                  <button className="w-full py-2.5 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors">
                    View Offers
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Buy New Cars With Us? */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Buy New Cars With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Authorized Dealers</h3>
              <p className="text-gray-600 text-sm">We connect you strictly with authorized brand dealerships to ensure 100% genuine deliveries and warranty.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Exclusive Offers</h3>
              <p className="text-gray-600 text-sm">Get access to corporate discounts, exchange bonuses, and exclusive festive offers not found elsewhere.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Test Drive at Home</h3>
              <p className="text-gray-600 text-sm">Book a test drive online and we will bring the brand new car right to your doorstep for you to experience.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default NewCarsPage;