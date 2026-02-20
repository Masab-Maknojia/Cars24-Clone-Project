import React from "react";
import Link from "next/link";
import { 
  Wrench, 
  Wind, 
  Droplet, 
  Settings, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  CalendarCheck
} from "lucide-react";

const ServicesPage = () => {
  const popularServices = [
    {
      title: "Periodic Maintenance",
      description: "Comprehensive oil change, filter replacement, and multi-point inspection.",
      icon: <Settings className="w-8 h-8" />,
      price: "Starts at ₹ 2,499",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "AC Service & Repair",
      description: "Gas top-up, cooling coil cleaning, and leak tests for optimal cooling.",
      icon: <Wind className="w-8 h-8" />,
      price: "Starts at ₹ 1,599",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      title: "Denting & Painting",
      description: "Premium DuPont paint, color matching, and scratch removal.",
      icon: <Droplet className="w-8 h-8" />,
      price: "Starts at ₹ 1,999/panel",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Wheel Care",
      description: "Laser alignment, wheel balancing, and tyre rotation.",
      icon: <Wrench className="w-8 h-8" />,
      price: "Starts at ₹ 799",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black pb-16">
      
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-blue-200 mb-4 justify-center flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> &gt; Car Services
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Expert Car Service & Repairs</h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Get high-quality, transparent, and hassle-free car servicing at authorized Cars24 service hubs. Free pickup and drop included!
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg">
            Book a Service Now
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 -mt-8">
        
        {/* Popular Services Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Popular Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${service.bgColor} ${service.color}`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">{service.description}</p>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <span className="font-bold text-gray-900">{service.price}</span>
                  <button className="text-blue-600 text-sm font-bold hover:underline">Add +</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works & Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* How It Works */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Book Online</h4>
                  <p className="text-gray-600 text-sm">Select your car, choose the service, and pick a convenient time slot.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">Free Pickup <MapPin className="w-4 h-4 text-orange-500" /></h4>
                  <p className="text-gray-600 text-sm">Our verified executive will pick up your car from your home or office.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Expert Servicing</h4>
                  <p className="text-gray-600 text-sm">Track your car's service progress live. We only use 100% genuine OEM parts.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Delivery & Payment</h4>
                  <p className="text-gray-600 text-sm">Pay online after the service is done and your car is dropped back safely.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gray-900 text-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-8 text-white">The Cars24 Advantage</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-start">
                <ShieldCheck className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold mb-1">Genuine Parts</h4>
                <p className="text-sm text-gray-400">100% genuine OEM & OES spare parts with warranty.</p>
              </div>
              <div className="flex flex-col items-start">
                <Clock className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold mb-1">On-Time Delivery</h4>
                <p className="text-sm text-gray-400">Strict adherence to estimated delivery times.</p>
              </div>
              <div className="flex flex-col items-start">
                <CheckCircle2 className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold mb-1">Upfront Pricing</h4>
                <p className="text-sm text-gray-400">Clear estimates before work begins. No hidden charges.</p>
              </div>
              <div className="flex flex-col items-start">
                <CalendarCheck className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold mb-1">Service Warranty</h4>
                <p className="text-sm text-gray-400">1-month or 1000kms warranty on all our services.</p>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default ServicesPage;