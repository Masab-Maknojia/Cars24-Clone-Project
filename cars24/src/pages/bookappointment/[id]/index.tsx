import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { getcarByid, getServiceCenters } from "@/lib/Carapi"; 
import { createAppointment } from "@/lib/Appointmentapi";
import { getWalletDetails, debitWallet, triggerReferralBonus } from "@/lib/Walletapi"; 
import { sendLocalNotification } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Car, Info, MessageCircle, Wallet, CreditCard } from "lucide-react"; 
import ChatModal from "@/components/ChatModel"; 

const BookAppointmentPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [serviceCenters, setServiceCenters] = useState<any[]>([]);

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [useWallet, setUseWallet] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    paymentMethod: "", 
    notes: "",
  });

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const carData = await getcarByid(id as string);
          setCar(carData);

          const city = carData.location || carData.Location;
          if (city) {
              const centersData = await getServiceCenters(city);
              setServiceCenters(centersData);
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
          toast.error("Could not load details");
        }
      };
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (user?.id) {
        try {
          const data = await getWalletDetails(user.id);
          setWalletBalance(data.balance || 0);
        } catch (error) {
          console.error("Failed to load wallet", error);
        }
      }
    };
    fetchWallet();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const basePrice = car?.price || 0;
  const discountAmount = useWallet ? Math.min(walletBalance, basePrice) : 0;
  const finalPrice = basePrice - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to book an appointment");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await createAppointment(user.id, {
        userId: user.id,
        carId: id as string,
        ...formData,
        discountApplied: discountAmount,
        finalPrice: finalPrice,
        status: "Upcoming"
      });

      if (useWallet && discountAmount > 0) {
        await debitWallet(
            user.id, 
            discountAmount, 
            `Redeemed points for ${car.year} ${car.brand} ${car.model} purchase`
        );
      }

      try {
        await triggerReferralBonus(user.id);
      } catch (err) {
        console.error("Referral bonus check failed", err);
      }

      await sendLocalNotification(
        "Appointment Confirmed!", 
        `Your visit for ${formData.date} at ${formData.time} is booked.`
      );

      toast.success("Appointment booked successfully!");
      router.push("/appointments");
    } catch (error) {
      console.error(error);
      toast.error("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!car) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Schedule Inspection</h1>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col md:flex-row">
          {/* Car Info Section */}
          <div className="md:w-1/3 bg-blue-600 p-6 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">{car.year} {car.brand} {car.model}</h2>
              <p className="text-blue-100 mb-4">{car.variant}</p>
              <div className="space-y-3">
                <div className="flex items-center">
                   <Car className="w-5 h-5 mr-2" />
                   <span>{car.kmDriven?.toLocaleString('en-IN')} km</span>
                </div>
                 <div className="flex items-center">
                   <MapPin className="w-5 h-5 mr-2" />
                   <span>{car.location}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-sm text-blue-200">Price</p>
              <p className={`text-2xl font-bold ${useWallet && discountAmount > 0 ? 'line-through text-blue-300 text-lg' : ''}`}>
                ₹ {basePrice.toLocaleString('en-IN')}
              </p>
              
              {useWallet && discountAmount > 0 && (
                <div className="mt-2 bg-blue-700/50 p-3 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-green-300 font-medium flex items-center gap-1 mb-1">
                    <Wallet className="w-3 h-3" /> - ₹ {discountAmount.toLocaleString('en-IN')} (Wallet)
                  </p>
                  <p className="text-sm text-blue-200">Final Price</p>
                  <p className="text-3xl font-bold text-white">₹ {finalPrice.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form Section */}
          <div className="md:w-2/3 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      required
                      className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      name="time"
                      required
                      className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="location"
                    required
                    className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleChange}
                  >
                    <option value="">Select a center</option>
                    {serviceCenters.length > 0 ? (
                      serviceCenters.map((center, index) => (
                        <option key={index} value={center.name}>
                          {center.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No centers found in {car.location}</option>
                    )}
                    <option value="Home Inspection">Home Inspection (+ ₹500)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="paymentMethod"
                    required
                    className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleChange}
                  >
                    <option value="">Select a payment option</option>
                    <option value="Pay Online (Credit/Debit Card)">Pay Online (Credit/Debit Card)</option>
                    <option value="UPI / Net Banking">UPI / Net Banking</option>
                    <option value="Pay at Center (Cash/Card)">Pay at Center (Cash/Card)</option>
                    <option value="Car Loan / Finance">Car Loan / Finance</option>
                  </select>
                </div>
              </div>

              {walletBalance > 0 && (
                <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 flex items-center justify-between transition-colors hover:bg-orange-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Wallet className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Use Wallet Balance</h4>
                      <p className="text-xs font-medium text-gray-600">
                        Available: <span className="text-orange-600 font-bold">₹ {walletBalance.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={useWallet}
                      onChange={() => setUseWallet(!useWallet)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any specific requests?"
                  onChange={handleChange}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <p className="text-sm text-blue-800">
                  You will receive a confirmation notification immediately after booking.
                </p>
              </div>

              <div className="flex justify-end space-x-4 items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? "Booking..." : "Confirm Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {car && user && (
        <ChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          senderId={user.id}
          receiverId={car.userId || car.UserId || "admin"} 
          carName={`${car.year} ${car.brand} ${car.model}`}
        />
      )}
    </div>
  );
};

export default BookAppointmentPage;