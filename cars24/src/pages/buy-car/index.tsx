import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getAllCars, searchCars, getSuggestions, getServiceCenters } from "@/lib/Carapi"; 
import { ChevronDown, Heart, Search, Sliders, X, MapPin, Wrench } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "@/context/LocationContext";

const BuyCarPage = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { city } = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000000]); 
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [minYear, setMinYear] = useState(2010);
  const [maxKm, setMaxKm] = useState(200000);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [serviceCenters, setServiceCenters] = useState<any[]>([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 1) {
        try {
            const data = await getSuggestions(searchTerm);
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (e) { console.error(e); }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);


  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const params = {
            q: searchTerm,
            minPrice: priceRange[0],
            maxPrice: priceRange[1] < 500000000 ? priceRange[1] : undefined,
            fuel: fuelType || undefined,
            transmission: transmission || undefined,
            bodyType: bodyType || undefined,
            minYear: minYear,
            maxKm: maxKm,
            city: city || undefined
        };

        const data = await searchCars(params);
        setCars(data);
      } catch (error) {
        console.error("Failed to load cars", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [searchTerm, priceRange, fuelType, transmission, bodyType, minYear, maxKm, city]);

  useEffect(() => {
    const fetchCenters = async () => {
      if (city) {
        try {
          const data = await getServiceCenters(city);
          setServiceCenters(data);
        } catch (error) {
          console.error("Failed to load service centers", error);
        }
      } else {
        setServiceCenters([]);
      }
    };
    fetchCenters();
  }, [city]);


  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const finalDisplayCars = cars.filter(car => {
      if (selectedBrands.length === 0) return true;
      const carBrand = car.brand || car.Brand || (car.title || "").split(" ")[0] || ""; 
      return selectedBrands.some(b => carBrand.toLowerCase().includes(b.toLowerCase()));
  });


  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-4">Filters</h2>
            
            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Price Range</h3>
              <Slider
                defaultValue={[0, 500000000]}
                max={500000000}
                step={10000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Brand</h3>
              <div className="space-y-2">
                {["Maruti", "Hyundai", "Honda", "Tata", "Toyota"].map((brand) => (
                  <label key={brand} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Filters Section */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                    <h3 className="font-semibold mb-2 text-sm">Fuel Type</h3>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                    >
                        <option value="">Any Fuel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="CNG">CNG</option>
                        <option value="Electric">Electric</option>
                    </select>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-sm">Transmission</h3>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                    >
                        <option value="">Any Transmission</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                    </select>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-sm">Body Type</h3>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                        value={bodyType}
                        onChange={(e) => setBodyType(e.target.value)}
                    >
                        <option value="">Any Body Type</option>
                        <option value="SUV">SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Convertible">Convertible</option>
                    </select>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-sm">Min Year: {minYear}</h3>
                    <input 
                        type="range"
                        min="2000"
                        max="2026"
                        value={minYear}
                        onChange={(e) => setMinYear(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                 <div>
                    <h3 className="font-semibold mb-2 text-sm">Max KM: {maxKm.toLocaleString()}</h3>
                    <input 
                        type="range"
                        min="0"
                        max="300000"
                        step="5000"
                        value={maxKm}
                        onChange={(e) => setMaxKm(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            {/*Nearby Service Centers Section */}
            {city && serviceCenters.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-800">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  Service Centers in {city}
                </h3>
                <div className="space-y-3">
                  {serviceCenters.map((center, index) => (
                    <div key={index} className="bg-orange-50 p-3 rounded-md border border-orange-100 text-xs">
                      <p className="font-semibold text-gray-900">{center.name}</p>
                      <p className="text-gray-600 mt-1 flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {center.address}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">
              {/* Update Title to reflect City */}
              {city ? `Used Cars in ${city}` : "Used Cars"} {loading ? "..." : `(${finalDisplayCars.length})`}
            </h1>
             
             {/* Search Input with Auto-Suggestions */}
             <div className="relative w-full md:w-auto" ref={wrapperRef}>
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search (e.g. 'Honda City')..."
                  className="pl-10 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if(e.target.value === "") setShowSuggestions(false);
                  }}
                  onFocus={() => { if(searchTerm.length > 1) setShowSuggestions(true); }}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 w-full md:w-64 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {suggestions.map((s, i) => (
                            <li 
                                key={i} 
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                onClick={() => {
                                    setSearchTerm(s);
                                    setShowSuggestions(false);
                                }}
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
              </div>

          </div>

          {/* Fallback if no cars match */}
          {finalDisplayCars.length === 0 && !loading && (
             <div className="text-center py-10 text-gray-500">
                <p>No cars found matching your filters in {city || "your area"}.</p>
                <button 
                  onClick={() => {
                      setPriceRange([0, 500000000]); 
                      setSearchTerm(""); 
                      setSelectedBrands([]);
                      setFuelType("");
                      setTransmission("");
                  }}
                  className="text-blue-600 underline mt-2"
                >
                  Clear all filters
                </button>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {finalDisplayCars.map((car) => {
              const displayTitle = car.title || car.Title || `${car.year} ${car.brand} ${car.model}`.trim() || "Unknown Car";
              
              const rawPrice = car.price ?? car.Price ?? 0;
              const price = typeof rawPrice === 'number' 
                 ? rawPrice 
                 : Number(rawPrice.toString().replace(/,/g, '') || 0);

              const emiVal = (car.emi && car.emi > 0) ? car.emi : Math.round(price / 60);
              const displayEMI = emiVal.toLocaleString('en-IN');

              const imageSrc = (car.images && car.images.length > 0) ? car.images[0] : "/api/placeholder/400/300";

              const km = car.kmDriven || car.specs?.km || 0;
              const transmission = car.transmission || car.specs?.transmission || "Manual";
              const fuel = car.fuelType || car.specs?.fuel || "Petrol";

              return (
                <div key={car.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
                  <div className="relative h-48 bg-gray-200">
                    <img src={imageSrc} alt={displayTitle} className="w-full h-full object-cover" />
                    <button className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                      {displayTitle}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-3">
                      <span>{typeof km === 'number' ? km.toLocaleString() : km} km</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{transmission}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{fuel}</span>
                    </div>

                    <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">EMI from</p>
                        <p className="font-semibold text-gray-900">₹{displayEMI}/m</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Price</p>
                        <p className="text-xl font-bold text-blue-600">
                          ₹{price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <Link 
                      href={`/buy-car/${car.id}`}
                      className="mt-4 block w-full py-2 bg-gray-900 text-white text-center rounded hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyCarPage;