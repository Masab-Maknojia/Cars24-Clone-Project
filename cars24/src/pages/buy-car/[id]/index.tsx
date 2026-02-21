import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getcarByid } from "@/lib/Carapi"; 
import { Heart, Share2, MapPin, Calendar, Fuel, Gauge, User, Wrench, CheckCircle2, Star, TrendingUp, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext"; // <--- Added Location Context!
import { toast } from "sonner";

const CarDetailsPage = () => {
  const router = useRouter();
  const { id, view } = router.query;
  const isBookedView = view === "booked";

  const { user } = useAuth();
  const { city } = useLocation(); // <--- Pulled the user's actively selected city!
  
  const [carDetails, setCarDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchCarDetails = async () => {
        try {
          const data = await getcarByid(id as string);
          setCarDetails(data);
        } catch (error) {
          console.error("Failed to fetch car details", error);
          toast.error("Failed to load car details");
        } finally {
          setLoading(false);
        }
      };
      fetchCarDetails();
    }
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!carDetails) return <div className="flex justify-center items-center h-screen">Car not found</div>;

  const displayTitle = carDetails.title || carDetails.Title || `${carDetails.year} ${carDetails.brand} ${carDetails.model}`;
  
  const rawPrice = carDetails.price !== undefined ? carDetails.price : (carDetails.Price !== undefined ? carDetails.Price : 0);
  const price = typeof rawPrice === 'number' 
      ? rawPrice 
      : Number(rawPrice?.toString().replace(/,/g, '') || 0);

  const kmValRaw = carDetails.specs?.km || carDetails.kmDriven || carDetails.KmDriven || "0";
  const actualKm = parseInt(kmValRaw.toString().replace(/[^0-9]/g, ''), 10) || 0;
  const km = `${actualKm.toLocaleString('en-IN')} km`;

  const yearRaw = carDetails.specs?.year || carDetails.year || carDetails.Year || new Date().getFullYear();
  const actualYear = parseInt(yearRaw.toString().replace(/[^0-9]/g, ''), 10) || new Date().getFullYear();
  const age = new Date().getFullYear() - actualYear;
  const year = actualYear.toString();

  const fuel = carDetails.specs?.fuel || carDetails.fuelType || carDetails.FuelType || "Petrol";
  const transmission = carDetails.specs?.transmission || carDetails.transmission || carDetails.Transmission || "Manual";
  const owner = carDetails.specs?.owner || carDetails.owner || "1st Owner"; 
  const insurance = carDetails.specs?.insurance || carDetails.insurance || "Comprehensive";
  
  const mainImage = carDetails.images && carDetails.images.length > 0 
    ? carDetails.images[0] 
    : "/api/placeholder/800/600";

  const displayEMI = carDetails.emi 
    ? Number(carDetails.emi).toLocaleString('en-IN') 
    : Math.round(price / 60).toLocaleString('en-IN');


  // ------------------------------------------------------------------
  // DYNAMIC PRICING ENGINE (Uses User's Selected Location & Season!)
  // ------------------------------------------------------------------
  const calculateDynamicPrice = (basePrice: number, userCity: string, car: any) => {
    let multiplier = 1.0;
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const isMonsoon = currentMonth >= 6 && currentMonth <= 9;
    
    // Fallback to car location if user hasn't selected a city yet
    const locationLower = (userCity || car.location || car.Location || "").toLowerCase();
    const bodyType = (car.bodyType || car.BodyType || car.variant || car.Variant || displayTitle).toLowerCase();
    
    const isHillyOrRainy = locationLower.includes("mumbai") || locationLower.includes("pune") || locationLower.includes("shimla") || locationLower.includes("dehradun");
    const isMetro = locationLower.includes("delhi") || locationLower.includes("bangalore") || locationLower.includes("mumbai") || locationLower.includes("chennai") || locationLower.includes("hyderabad");
    
    // SUVs and Off-road vehicles increase during monsoon or in hilly/rainy regions
    if ((bodyType.includes("suv") || bodyType.includes("off-road") || bodyType.includes("jeep")) && (isMonsoon || isHillyOrRainy)) {
        multiplier += 0.05;
    }
    
    // Small hatchbacks drop in value in metro areas (traffic preference / fuel spikes)
    if (bodyType.includes("hatchback") && isMetro) {
        multiplier -= 0.03;
    }
    
    // Convertibles drop in winter, rise in summer
    if (bodyType.includes("convertible")) {
        if (currentMonth >= 11 || currentMonth <= 2) multiplier -= 0.04;
        else if (currentMonth >= 3 && currentMonth <= 5) multiplier += 0.03;
    }

    // Safety net: If no strict rules matched, apply a baseline regional fluctuation 
    // so the Recommended Price is NEVER perfectly flat compared to the base price!
    if (multiplier === 1.0) {
        if (isMetro) multiplier += 0.015; // +1.5% premium in big cities
        else multiplier -= 0.01;          // -1.0% drop in rural areas
    }

    const calculatedPrice = basePrice * multiplier;
    return Math.round(calculatedPrice / 500) * 500; // Round to nearest 500 for clean UI
  };

  const recPrice = calculateDynamicPrice(price, city, carDetails);
  // ------------------------------------------------------------------


  const getMaintenanceEstimate = (car: any) => {
    const brand = (car.brand || car.Brand || "").toLowerCase();

    let baseCost = 800;
    let multiplier = 1.0;
    
    if (["bmw", "mercedes", "mercedes-benz", "audi", "jaguar", "land rover", "porsche"].includes(brand)) {
        multiplier = 3.5;
    } else if (["honda", "toyota", "vw", "volkswagen", "skoda", "jeep"].includes(brand)) {
        multiplier = 1.5;
    }

    let extraCost = 0;

    const fuelLower = fuel.toLowerCase();
    if (fuelLower.includes("diesel")) extraCost += 200;
    if (fuelLower.includes("cng")) extraCost += 300;
    if (fuelLower.includes("electric")) extraCost -= 300;

    const ownerStr = owner.toLowerCase();
    if (ownerStr.includes("2nd")) extraCost += 100;
    if (ownerStr.includes("3rd")) extraCost += 200;
    if (ownerStr.includes("4th") || ownerStr.includes("more")) extraCost += 350;

    const insStr = insurance.toLowerCase();
    if (insStr.includes("comprehensive")) extraCost -= 100;
    if (insStr.includes("expired")) extraCost += 300;

    const highlights = (car.highlights || []).join(" ").toLowerCase();
    const featuresCount = (car.features || []).length;

    if (highlights.includes("recently serviced")) extraCost -= 250;
    if (highlights.includes("all service records")) extraCost -= 150;
    
    extraCost += (featuresCount * 10); 

    const kmFactor = Math.floor(actualKm / 10000) * 150;
    const ageFactor = age * 100;
    
    let totalMonthlyCost = Math.round((baseCost * multiplier) + kmFactor + ageFactor + extraCost);
    if (totalMonthlyCost < 500) totalMonthlyCost = 500;

    const nextService = 10000 - (actualKm % 10000);

    let status = "Low Maintenance Expected";
    let color = "text-green-600";
    let bgColor = "bg-green-50";
    let borderColor = "border-green-100";

    if (totalMonthlyCost > 4000) {
        status = "High Maintenance Expected";
        color = "text-red-600";
        bgColor = "bg-red-50";
        borderColor = "border-red-100";
    } else if (totalMonthlyCost > 2000) {
        status = "Moderate Maintenance Expected";
        color = "text-orange-600";
        bgColor = "bg-orange-50";
        borderColor = "border-orange-100";
    }

    return { 
      status, color, bgColor, borderColor, 
      nextService: nextService === 0 ? 10000 : nextService, 
      monthlyCost: totalMonthlyCost 
    };
  };

  const est = getMaintenanceEstimate(carDetails);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8">
        <div className="text-sm breadcrumbs mb-4 text-gray-500">
          <Link href="/">Home</Link> &gt; <Link href="/buy-car">Buy Car</Link> &gt; {displayTitle}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
              <img
                src={mainImage}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayTitle}</h1>
            
            <div className="flex items-center text-gray-500 mb-6">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-3">
                {fuel}
              </span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {transmission}
              </span>
              <div className="flex items-center ml-auto">
                <MapPin className="w-4 h-4 mr-1" />
                {carDetails.location || "Available"}
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-2">
              ₹ {price.toLocaleString('en-IN')}
            </div>

            {/* Recommended Price Display (Now perfectly dynamic!) */}
            {recPrice !== price && (
               <div className="mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 w-fit px-3 py-2 rounded-md border border-emerald-100">
                 <TrendingUp className="w-4 h-4" />
                 <span className="font-semibold">Recommended Market Price: ₹ {recPrice.toLocaleString('en-IN')}</span>
                 <div className="group relative ml-1">
                    <Info className="w-4 h-4 text-emerald-500 cursor-pointer" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-64 rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:block z-50">
                      This price is dynamically adjusted by our pricing engine based on your selected region ({city || "Default"}) and seasonal trends.
                    </div>
                 </div>
               </div>
            )}
            
            <p className="text-gray-500 text-sm mb-8">
              EMI starts at ₹ {displayEMI}/mo
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="font-semibold">{year}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center">
                <Gauge className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Kilometers</p>
                  <p className="font-semibold">{km}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center">
                <Fuel className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Fuel Type</p>
                  <p className="font-semibold">{fuel}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Owner</p>
                  <p className="font-semibold">{owner}</p>
                </div>
              </div>
            </div>

            <div className={`${est.bgColor} border ${est.borderColor} p-4 rounded-lg flex justify-between items-center mb-8`}>
                <div>
                    <h3 className={`${est.color} font-bold flex items-center gap-2`}>
                      {est.status}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Wrench className="w-3 h-3" /> Next major service due in {est.nextService.toLocaleString('en-IN')} km
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Est. Monthly Maintenance</p>
                    <p className="text-xl font-bold text-gray-900">₹ {est.monthlyCost.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {!isBookedView ? (
              <div className="space-y-4">
                <Link 
                  href={`/bookappointment/${id}`}
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Buy Car
                </Link>
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                <div className="w-full bg-green-50 border border-green-200 text-green-700 text-center py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Car Successfully Booked
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
           <h2 className="text-xl font-bold mb-4">Car Overview</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              <div className="flex justify-between border-b py-2">
                 <span className="text-gray-500">Registration Year</span>
                 <span className="font-medium">{year}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                 <span className="text-gray-500">Insurance</span>
                 <span className="font-medium">{insurance}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                 <span className="text-gray-500">Fuel Type</span>
                 <span className="font-medium">{fuel}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                 <span className="text-gray-500">Seats</span>
                 <span className="font-medium">5 Seats</span>
              </div>
              <div className="flex justify-between border-b py-2">
                 <span className="text-gray-500">Kms Driven</span>
                 <span className="font-medium">{km}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                 <span className="text-gray-500">RTO</span>
                 <span className="font-medium">{carDetails.location || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                 <span className="text-gray-500">Ownership</span>
                 <span className="font-medium">{owner}</span>
              </div>
           </div>
        </div>

        {(carDetails.features?.length > 0 || carDetails.highlights?.length > 0) && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            {carDetails.highlights?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Highlights
                </h2>
                <div className="flex flex-wrap gap-3">
                  {carDetails.highlights.map((item: string, i: number) => (
                     <span key={i} className="px-3 py-1 bg-yellow-50 text-yellow-800 text-sm font-medium rounded-full border border-yellow-100">
                       {item}
                     </span>
                  ))}
                </div>
              </div>
            )}

            {carDetails.features?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {carDetails.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CarDetailsPage;