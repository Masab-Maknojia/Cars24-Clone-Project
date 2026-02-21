import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; 
import {
  Calendar, Clock, MapPin, Car, Check, User, Settings, Fuel, Gauge, 
  Mail, Phone, Landmark, CreditCard, DollarSign, ExternalLink, Shield
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getBookingbyuser } from "@/lib/Bookingapi";

const PurchasedCarsPage = () => {
  const router = useRouter(); 
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchasedCars, setpurchasedCars] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchpurchasedCars = async () => {
      if (!user) return; 
      
      try {
        const car = await getBookingbyuser(user?.id);
        if (car && Array.isArray(car) && car.length > 0) {
          setpurchasedCars(car);
        } else {
          setpurchasedCars([]);
        }
      } catch (error) {
        console.error(error);
        setpurchasedCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchpurchasedCars();
  }, [user, router.asPath]); 

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  if (!purchasedCars || purchasedCars.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Bookings Yet</h2>
          <p className="text-gray-600 mb-8">You haven't purchased any cars yet. Browse our collection and find your dream car today!</p>
          <Link href="/buy-car" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
            Browse Cars
          </Link>
        </div>
      </div>
    );
  }
  
  const formatPrice = (price: string | number) => {
    if (!price) return "₹ 0";
    return "₹ " + parseInt(price.toString()).toLocaleString("en-IN");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:py-0 print:px-0 text-black">
      <div className="mb-8 text-center print:hidden">
        <h1 className="text-3xl font-bold text-gray-800">
          Car Booking Confirmation
        </h1>
        <p className="text-gray-600">Thank you for your purchase!</p>
      </div>
      
      {purchasedCars.map((data: any, idx: number) => {
        // SAFE FALLBACKS: Prevents the page from going blank if a car is missing data
        const safeCar = data.car || {};
        const safeBooking = data.booking || {};
        const carTitle = safeCar.title || safeCar.Title || "Vehicle Details Unavailable";
        const carImage = safeCar.images && safeCar.images.length > 0 ? safeCar.images[0] : "https://via.placeholder.com/800x600?text=No+Image+Available";
        const carPrice = safeCar.price !== undefined ? safeCar.price : (safeCar.Price || 0);
        const carEmi = safeCar.emi || safeCar.Emi;
        const specs = safeCar.specs || {};

        return (
        <div key={idx} className="max-w-5xl mx-auto bg-gray-50 rounded-lg overflow-hidden shadow-xl mb-8 border border-gray-200">
          <div className="bg-blue-900 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <Check className="w-6 h-6 mr-2 text-green-400" />
                  <h1 className="text-2xl font-bold">Booking Confirmed</h1>
                </div>
                <p className="text-blue-200 mb-4">
                  Booking ID: {safeBooking.id ? safeBooking.id.slice(-8).toUpperCase() : "PENDING"}
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-300" />
                    <span>{safeBooking.preferredDate || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-300" />
                    <span>{safeBooking.preferredTime || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center">
                <Car className="w-12 h-12 text-blue-300" />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Car Image safely loaded */}
                <div className="md:w-2/5 h-64 overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={carImage}
                    alt={carTitle}
                    className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <div className="md:w-3/5 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {carTitle}
                    </h2>
                    <p className="text-gray-600 mb-4">{safeCar.location || "Location N/A"}</p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700">Price</p>
                        <p className="text-xl font-bold text-blue-900">
                          {formatPrice(carPrice)}
                        </p>
                      </div>
                      {carEmi && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                          <p className="text-sm text-amber-700">EMI</p>
                          <p className="text-xl font-bold text-amber-900">
                            {formatPrice(carEmi)} / month
                          </p>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Specifications
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{specs.year || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{specs.km || "0"} km</span>
                      </div>
                      <div className="flex items-center">
                        <Fuel className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{specs.fuel || "Petrol"}</span>
                      </div>
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{specs.transmission || "Manual"}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{specs.owner || "1st Owner"}</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{specs.insurance || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex justify-end">
                     <Link 
                       href={`/buy-car/${safeCar.id || safeBooking.carId || ''}?view=booked`}
                       className="bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors"
                     >
                       View Full Car Details <ExternalLink className="w-4 h-4" />
                     </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Customer Details
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500"><User className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-gray-800 font-medium">{safeBooking.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500"><Phone className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-medium">{safeBooking.phone || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500"><Mail className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800 font-medium">{safeBooking.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 flex-shrink-0 text-gray-500"><MapPin className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-800 font-medium">{safeBooking.address || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Details
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Car Price</span>
                    <span className="font-semibold">{formatPrice(carPrice)}</span>
                  </div>

                  {safeBooking.downPayment && (
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600">Amount to Pay Today (Down Payment)</span>
                      <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {formatPrice(safeBooking.downPayment)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">Total Cost</span>
                      <span className="text-xl font-bold text-blue-900">{formatPrice(carPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="text-gray-800 font-medium text-sm">{safeBooking.paymentMethod || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <Landmark className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Financing</p>
                      <p className="text-gray-800 font-medium">{safeBooking.loanStatus || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 p-4 text-center text-gray-500 text-sm border-t border-gray-200">
            <p>Thank you for your purchase! For any queries, please contact our customer support.</p>
          </div>
        </div>
        );
      })}

      <div className="mt-8 text-center text-gray-500 text-sm print:hidden">
        <p>© 2026 Premium Auto Sales. All rights reserved.</p>
      </div>
    </div>
  );
};

export default PurchasedCarsPage;