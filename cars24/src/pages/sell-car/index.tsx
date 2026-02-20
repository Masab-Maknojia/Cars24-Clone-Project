import React, { useState } from "react";
import { Check, Car, Image, FileText, DollarSign } from "lucide-react";
import Carform from "@/components/sellcar/Carform";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { createCar } from "@/lib/Carapi";

type CarDetails = {
  id: string;
  title: string;
  brand?: string;
  model?: string;
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

const SellCarPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [carDetails, setCarDetails] = useState<any>({
    title: "",
    images: [],
    price: "",
    emi: "",
    location: "",
    bodyType: "", 
    specs: {
      year: new Date().getFullYear(),
      km: "",
      fuel: "",
      transmission: "",
      owner: "",
      insurance: "",
    },
    features: [],    
    highlights: [],  
  });

  const steps = [
    { id: 1, name: "Basic Details", icon: Car },
    { id: 2, name: "Images & Specs", icon: Image },
    { id: 3, name: "Features", icon: FileText },
    { id: 4, name: "Pricing", icon: DollarSign },
  ];

  const updateCarDetails = (updatedDetails: Partial<CarDetails>) => {
    setCarDetails((prev: any) => ({
      ...prev,
      ...updatedDetails,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    const titleParts = carDetails.title ? carDetails.title.split(" ") : ["Unknown", "Car"];
    const derivedBrand = titleParts[0] || "Generic";
    const derivedModel = titleParts.slice(1).join(" ") || "Model";

    const cleanPrice = carDetails.price ? parseInt(carDetails.price.toString().replace(/,/g, '')) : 0;
    const cleanKm = carDetails.specs.km ? parseInt(carDetails.specs.km.toString().replace(/,/g, '')) : 0;
    const cleanEMI = carDetails.emi ? parseInt(carDetails.emi.toString().replace(/,/g, '')) : 0;

    const formattedPayload = {
      ...carDetails,
      userId: user.id, 
      year: parseInt(carDetails.specs.year), 
      
      brand: derivedBrand, 
      model: derivedModel, 
      price: cleanPrice,    
      kmDriven: cleanKm,    
      emi: cleanEMI,        
      
      fuelType: carDetails.specs.fuel,
      transmission: carDetails.specs.transmission,
      
      bodyType: carDetails.bodyType,

      features: carDetails.features || [], 
      highlights: carDetails.highlights || [],

      specs: {
          ...carDetails.specs,
          km: cleanKm + " km" 
      }
    };

    try {
      console.log("Submitting Payload:", formattedPayload);
      const car = await createCar(formattedPayload);
      
      if (car?.id) {
        toast.success("Car listed Successfully!");
        router.push(`/bookappointment/${car.id}`); 
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to list car. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sell Your Car
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details below to get the best price for your car
          </p>
          <div className="w-full py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${
                  currentStep > step.id
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.id
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-300 text-gray-300"
                }
                transition-all duration-300`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        currentStep >= step.id
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                      } transition-all duration-300`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div>
            <Carform
              carDetails={carDetails}
              updateCarDetails={updateCarDetails}
              currentStep={currentStep}
              nextStep={nextStep}
              prevStep={prevStep}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellCarPage;