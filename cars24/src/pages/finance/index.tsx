import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calculator, 
  Clock, 
  Percent, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  FileText 
} from "lucide-react";

const FinancePage = () => {
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenure, setTenure] = useState<number>(60); // In months
  
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  useEffect(() => {
    const calculateEMI = () => {
      const p = loanAmount;
      const r = interestRate / 12 / 100;
      const n = tenure;

      if (r === 0) {
        setEmi(Math.round(p / n));
        setTotalInterest(0);
        setTotalPayment(p);
        return;
      }

      // Standard EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
      const emiVal = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const roundedEmi = Math.round(emiVal);
      
      setEmi(roundedEmi);
      setTotalPayment(roundedEmi * n);
      setTotalInterest((roundedEmi * n) - p);
    };

    calculateEMI();
  }, [loanAmount, interestRate, tenure]);

  return (
    <div className="min-h-screen bg-gray-50 text-black pb-16">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-sm text-blue-200 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> &gt; Car Finance
          </div>
          <h1 className="text-4xl font-bold mb-4">Used Car Loan & Finance</h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            Get instant approval, zero hidden charges, and the lowest interest rates in the market. 
            Drive your dream car home today with Cars24 Finance.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: EMI Calculator Input */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">EMI Calculator</h2>
            </div>

            <div className="space-y-8">
              {/* Loan Amount Slider */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-medium text-gray-700">Loan Amount</label>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹ {loanAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <input 
                  type="range" 
                  min="50000" 
                  max="5000000" 
                  step="10000"
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>₹ 50,000</span>
                  <span>₹ 50 Lakhs</span>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-400" /> Interest Rate (p.a.)
                  </label>
                  <div className="text-2xl font-bold text-gray-900">
                    {interestRate}%
                  </div>
                </div>
                <input 
                  type="range" 
                  min="7" 
                  max="20" 
                  step="0.1"
                  value={interestRate} 
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>7%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" /> Loan Tenure (Months)
                  </label>
                  <div className="text-2xl font-bold text-gray-900">
                    {tenure} Months <span className="text-sm text-gray-500 font-normal">({(tenure/12).toFixed(1)} Years)</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="84" 
                  step="6"
                  value={tenure} 
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>12m</span>
                  <span>84m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: EMI Result Summary */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Payment Summary</h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Your Monthly EMI</p>
                <div className="text-4xl font-bold text-blue-600">
                  ₹ {emi.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Principal Amount</span>
                  <span className="font-semibold text-gray-900">₹ {loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Interest Payable</span>
                  <span className="font-semibold text-gray-900">₹ {totalInterest.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-px bg-gray-100 my-2"></div>
                <div className="flex justify-between items-center text-base">
                  <span className="font-bold text-gray-900">Total Payment</span>
                  <span className="font-bold text-gray-900">₹ {totalPayment.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-colors shadow-md">
              Apply for Loan Now
            </button>
          </div>
        </div>

        {/* Features/Benefits Section */}
        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Finance with Cars24?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Instant Approval</h4>
              <p className="text-sm text-gray-600">Get your loan approved in minutes with minimal documentation.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Lowest Interest Rates</h4>
              <p className="text-sm text-gray-600">Partnered with top banks to bring you competitive starting rates.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">100% Paperless</h4>
              <p className="text-sm text-gray-600">Completely digital journey from application to disbursement.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Zero Foreclosure</h4>
              <p className="text-sm text-gray-600">Pay off your loan early without any hidden penalty charges.</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancePage;