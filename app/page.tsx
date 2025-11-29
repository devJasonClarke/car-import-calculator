"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  Ship,
  DollarSign,
  FileText,
  Info,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Car,
  Truck,
  Zap,
  Fuel,
  Gauge,
  Package,
  Shield,
  FileCheck,
  Building2,
  Anchor,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// Type definitions
type VehicleType = "car" | "suv" | "pickup" | "hybrid" | "truck";
type FuelType = "gasoline" | "diesel";

interface VehicleRates {
  aggregate: number;
  importDuty: number;
  scta: number;
  gct: number;
}

interface CalculationResult {
  cif: number;
  dutiesAndTaxes: number;
  caf: number;
  environmentalLevy: number;
  stampDuty: number;
  standardCompliance: number;
  tradeBoardFees: number;
  brokerFees: number;
  portCharges: number;
  taxiLicenseFee: number;
  totalCost: number;
  breakdown: {
    purchaseAndShipping: number;
    governmentFees: number;
    clearingCosts: number;
  };
}

export default function JamaicaImportCalculator() {
  // State management
  const [fobPrice, setFobPrice] = useState<string>("6000");
  const [shipping, setShipping] = useState<string>("800");
  const [insurance, setInsurance] = useState<string>("100");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [fuelType, setFuelType] = useState<FuelType>("gasoline");
  const [engineSize, setEngineSize] = useState<string>("1986");
  const [isUsed, setIsUsed] = useState<boolean>(true);
  const [isTaxiOperator, setIsTaxiOperator] = useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(154); // Default JMD to USD rate
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false);
  const [rateLastUpdated, setRateLastUpdated] = useState<string>("");

  // Counter animation states
  const [displayedTotal, setDisplayedTotal] = useState<number>(0);
  const [displayedAggregateRate, setDisplayedAggregateRate] =
    useState<number>(0);

  // Formatted input values for display
  const [fobPriceFormatted, setFobPriceFormatted] = useState<string>("6,000");
  const [shippingFormatted, setShippingFormatted] = useState<string>("800");
  const [insuranceFormatted, setInsuranceFormatted] = useState<string>("100");
  const [engineSizeFormatted, setEngineSizeFormatted] =
    useState<string>("1,986");

  function getYear() {
    return new Date().getFullYear();
  }

  // Format number with commas
  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, "");
    // Format with commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Remove commas for calculation
  const removeCommas = (value: string): string => {
    return value.replace(/,/g, "");
  };

  // Handle FOB price change
  const handleFobPriceChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setFobPriceFormatted(formatted);
    setFobPrice(removeCommas(formatted));
  };

  // Handle shipping change
  const handleShippingChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setShippingFormatted(formatted);
    setShipping(removeCommas(formatted));
  };

  // Handle insurance change
  const handleInsuranceChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setInsuranceFormatted(formatted);
    setInsurance(removeCommas(formatted));
  };

  // Handle engine size change
  const handleEngineSizeChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setEngineSizeFormatted(formatted);
    setEngineSize(removeCommas(formatted));
  };

  // Counter animation function
  const animateValue = (
    start: number,
    end: number,
    duration: number,
    setValue: (value: number) => void
  ) => {
    const startTime = performance.now();
    const difference = end - start;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + difference * easeOutQuart;

      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Fetch exchange rate from API
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      // Using exchangerate-api.com free tier
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();

      if (data.rates && data.rates.JMD) {
        setExchangeRate(data.rates.JMD);
        const now = new Date();
        setRateLastUpdated(
          now.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // Keep using default rate if fetch fails
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Fetch exchange rate on component mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Calculate rates based on vehicle type, fuel, and engine size
  const getRates = (): VehicleRates => {
    const cc = parseInt(engineSize) || 0;

    if (vehicleType === "hybrid") {
      return { aggregate: 39, importDuty: 20, scta: 0, gct: 15 };
    }

    if (vehicleType === "truck") {
      return { aggregate: 33, importDuty: 10, scta: 5, gct: 15 };
    }

    if (vehicleType === "pickup") {
      if (fuelType === "gasoline") {
        if (cc < 1850)
          return { aggregate: 39, importDuty: 20, scta: 0, gct: 15 };
        if (cc <= 2200)
          return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
        return { aggregate: 94, importDuty: 20, scta: 40, gct: 15 };
      } else {
        if (cc < 1850)
          return { aggregate: 39, importDuty: 20, scta: 0, gct: 15 };
        if (cc <= 2200)
          return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
        return { aggregate: 80, importDuty: 20, scta: 30, gct: 15 };
      }
    }

    if (vehicleType === "suv") {
      if (fuelType === "gasoline") {
        if (cc <= 1000)
          return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
        if (cc <= 2000)
          return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
        return { aggregate: 80, importDuty: 20, scta: 30, gct: 15 };
      } else {
        if (cc <= 1000)
          return { aggregate: 39, importDuty: 20, scta: 0, gct: 15 };
        if (cc <= 2000)
          return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
        if (cc <= 2200)
          return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
        if (cc <= 3500)
          return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
        return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
      }
    }

    // Regular car
    if (fuelType === "gasoline") {
      if (cc <= 1000)
        return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
      if (cc <= 2000)
        return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
      if (cc <= 3500)
        return { aggregate: 80, importDuty: 20, scta: 30, gct: 15 };
      return { aggregate: 80, importDuty: 20, scta: 30, gct: 15 };
    } else {
      if (cc <= 1000)
        return { aggregate: 39, importDuty: 20, scta: 0, gct: 15 };
      if (cc <= 2000)
        return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
      if (cc <= 2200)
        return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
      if (cc <= 3500)
        return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
      return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
    }
  };

  // Calculate total import cost
  const calculateCost = (): CalculationResult => {
    const fob = parseFloat(fobPrice) || 0;
    const freight = parseFloat(shipping) || 0;
    const ins = parseFloat(insurance) || 0;

    const cif = fob + freight + ins;
    const rates = getRates();
    const dutiesAndTaxes = cif * (rates.aggregate / 100);

    // Government fees (converted from JMD to USD at approx 154 JMD = 1 USD)
    const caf = isUsed ? 430 : 410;
    const environmentalLevy = cif * 0.005;
    const stampDuty = cif > 35 ? 0.65 : 0;
    const standardCompliance = cif * 0.003;
    const tradeBoardFees = 48;
    const brokerFees = 300;
    const portCharges = 200;
    const taxiLicenseFee = isTaxiOperator ? 97 : 0; // ~15,000 JMD annual taxi license

    const totalFees =
      caf +
      environmentalLevy +
      stampDuty +
      standardCompliance +
      tradeBoardFees +
      brokerFees +
      portCharges +
      taxiLicenseFee;
    const totalCost = cif + dutiesAndTaxes + totalFees;

    return {
      cif,
      dutiesAndTaxes,
      caf,
      environmentalLevy,
      stampDuty,
      standardCompliance,
      tradeBoardFees,
      brokerFees,
      portCharges,
      taxiLicenseFee,
      totalCost,
      breakdown: {
        purchaseAndShipping: cif,
        governmentFees:
          caf +
          environmentalLevy +
          stampDuty +
          standardCompliance +
          tradeBoardFees +
          taxiLicenseFee,
        clearingCosts: brokerFees + portCharges,
      },
    };
  };

  // Auto-calculate on input change
  useEffect(() => {
    const calc = calculateCost();
    setResult(calc);
  }, [
    fobPrice,
    shipping,
    insurance,
    vehicleType,
    fuelType,
    engineSize,
    isUsed,
    isTaxiOperator,
  ]);

  // Animate total cost when result changes
  useEffect(() => {
    if (result) {
      animateValue(displayedTotal, result.totalCost, 1000, setDisplayedTotal);
    }
  }, [result?.totalCost]);

  // Animate aggregate rate when rates change
  useEffect(() => {
    const rates = getRates();
    animateValue(
      displayedAggregateRate,
      rates.aggregate,
      800,
      setDisplayedAggregateRate
    );
  }, [vehicleType, fuelType, engineSize]);

  const rates = getRates();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e3a8a10_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a10_1px,transparent_1px)] bg-size-[4rem_4rem] pointer-events-none"></div>

      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-blue-900/50 bg-slate-950/80 backdrop-blur-xl animate-in fade-in slide-in-from-top duration-700">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-700"></div>
                <div className="relative bg-linear-to-br from-blue-600 to-indigo-600 p-3 rounded-xl transform group-hover:scale-110 transition-transform duration-300">
                  <Ship className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <h1 className="text-3xl font-bold text-white">
                  Jamaica Auto Import Calculator
                </h1>
                <p className="text-sm text-blue-300 mt-1">
                  Calculate your complete vehicle import costs
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={fetchExchangeRate}
                disabled={isLoadingRate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-950/50 rounded-lg border border-blue-800/30 hover:bg-blue-900/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
                title="Refresh exchange rate"
              >
                <RefreshCw
                  className={`w-4 h-4 text-blue-300 transition-transform duration-700 ${
                    isLoadingRate ? "animate-spin" : "hover:rotate-180"
                  }`}
                  strokeWidth={1.5}
                />
                <div className="text-left">
                  <div className="text-xs text-blue-400 font-medium">
                    1 USD = {exchangeRate.toFixed(2)} JMD
                  </div>
                  {rateLastUpdated && (
                    <div className="text-[10px] text-slate-500">
                      Updated: {rateLastUpdated}
                    </div>
                  )}
                </div>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/50 rounded-lg border border-blue-800/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm font-medium text-blue-200">
                  2025 Rates
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Details Card */}
            <div
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-700 animate-in fade-in slide-in-from-left"
              style={{ animationDelay: "100ms" }}
            >
              <div className="bg-linear-to-r from-blue-900/50 to-indigo-900/50 px-6 py-4 border-b border-blue-800/50">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-blue-300" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-white">
                    Vehicle Details
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Vehicle Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-3">
                    Vehicle Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { value: "car", icon: Car, label: "Car" },
                      { value: "suv", icon: Car, label: "SUV" },
                      { value: "pickup", icon: Truck, label: "Pickup" },
                      { value: "hybrid", icon: Zap, label: "Hybrid" },
                      { value: "truck", icon: Truck, label: "Truck" },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setVehicleType(value as VehicleType)}
                        className={`relative p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer ${
                          vehicleType === value
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50 hover:border-blue-500/50"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mx-auto mb-1.5 transition-transform duration-300 ${
                            vehicleType === value ? "scale-110" : ""
                          }`}
                          strokeWidth={1.5}
                        />
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel Type */}
                {vehicleType !== "hybrid" && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-3">
                      Fuel Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "gasoline", icon: Fuel, label: "Gasoline" },
                        { value: "diesel", icon: Fuel, label: "Diesel" },
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => setFuelType(value as FuelType)}
                          className={`p-3.5 rounded-xl font-medium capitalize transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 cursor-pointer ${
                            fuelType === value
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                              : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50 hover:border-blue-500/50"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 transition-transform duration-300 ${
                              fuelType === value ? "rotate-12" : ""
                            }`}
                            strokeWidth={1.5}
                          />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engine Size */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-3">
                    Engine Size (CC)
                  </label>
                  <div className="relative group">
                    <Gauge
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300"
                      strokeWidth={1.5}
                    />
                    <input
                      type="text"
                      value={engineSizeFormatted}
                      onChange={(e) => handleEngineSizeChange(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800 transition-all duration-300"
                      placeholder="1,986"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-3">
                    Condition
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: true, label: "Used", icon: Car },
                      { value: false, label: "New", icon: Sparkles },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => setIsUsed(value)}
                        className={`p-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 cursor-pointer ${
                          isUsed === value
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50 hover:border-blue-500/50"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 transition-all duration-300 ${
                            isUsed === value ? "scale-110 rotate-6" : ""
                          }`}
                          strokeWidth={1.5}
                        />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taxi Operator Option */}
                {(vehicleType === "car" || vehicleType === "suv") && isUsed && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Importing as Registered Taxi Operator?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "No", value: false, icon: Car },
                        {
                          label: "Yes (up to 10 years)",
                          value: true,
                          icon: Car,
                        },
                      ].map(({ label, value, icon: Icon }) => (
                        <button
                          key={label}
                          onClick={() => setIsTaxiOperator(value)}
                          className={`p-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 cursor-pointer ${
                            isTaxiOperator === value
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                              : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50 hover:border-blue-500/50"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 transition-all duration-300 ${
                              isTaxiOperator === value
                                ? "scale-110 rotate-6"
                                : ""
                            }`}
                            strokeWidth={1.5}
                          />
                          {label}
                        </button>
                      ))}
                    </div>
                    {isTaxiOperator && (
                      <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                        <p className="text-xs text-blue-300">
                          <strong>Note:</strong> Taxi operator license required.
                          Full duties and taxes still apply. Additional cost:
                          ~$15,000 JMD (~$97 USD) for route taxi license.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Card */}
            <div
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-700 animate-in fade-in slide-in-from-left"
              style={{ animationDelay: "200ms" }}
            >
              <div className="bg-linear-to-r from-blue-900/50 to-indigo-900/50 px-6 py-4 border-b border-blue-800/50">
                <div className="flex items-center gap-3">
                  <DollarSign
                    className="w-5 h-5 text-blue-300"
                    strokeWidth={1.5}
                  />
                  <h2 className="text-lg font-semibold text-white">
                    Pricing Details
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* FOB Price */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    FOB Price (USD)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                      $
                    </span>
                    <input
                      type="text"
                      value={fobPriceFormatted}
                      onChange={(e) => handleFobPriceChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800 transition-all duration-300"
                      placeholder="6,000"
                    />
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Shipping Cost (USD)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                      $
                    </span>
                    <input
                      type="text"
                      value={shippingFormatted}
                      onChange={(e) => handleShippingChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800 transition-all duration-300"
                      placeholder="800"
                    />
                  </div>
                </div>

                {/* Insurance */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Insurance (USD)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                      $
                    </span>
                    <input
                      type="text"
                      value={insuranceFormatted}
                      onChange={(e) => handleInsuranceChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800 transition-all duration-300"
                      placeholder="90"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tax Rate Info */}
            <div
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-700 animate-in fade-in slide-in-from-right "
              style={{ animationDelay: "100ms" }}
            >
              <div className="px-6 py-4 border-b border-blue-800/50 bg-linear-to-r from-amber-900/30 to-orange-900/30">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                  <h3 className="text-base font-semibold text-amber-100">
                    Tax Rates
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-slate-400">
                    Aggregate Rate
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white tabular-nums">
                      {Math.round(displayedAggregateRate)}
                    </span>
                    <span className="text-xl font-semibold text-slate-400">
                      %
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-800 pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Import Duty</span>
                    <span className="font-semibold text-white">
                      {rates.importDuty}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">SCTA</span>
                    <span className="font-semibold text-white">
                      {rates.scta}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">GCT</span>
                    <span className="font-semibold text-white">
                      {rates.gct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Cost Result */}
            {result && (
              <div
                className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/20 transition-all  animate-in fade-in slide-in-from-right duration-700"
                style={{ animationDelay: "200ms" }}
              >
                <div className="px-6 py-4 border-b border-blue-800/50 bg-linear-to-r from-emerald-900/30 to-teal-900/30">
                  <div className="flex items-center gap-3">
                    <Calculator
                      className="w-5 h-5 text-emerald-400"
                      strokeWidth={1.5}
                    />
                    <h3 className="text-base font-semibold text-emerald-100">
                      Total Cost
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Estimated Total
                    </div>
                    <div className="space-y-2">
                      <div className="transform transition-all duration-700 hover:scale-105">
                        <div
                          className="text-5xl font-bold text-white mb-1 animate-in fade-in slide-in-from-bottom duration-700 tabular-nums"
                          style={{ animationDelay: "250ms" }}
                        >
                          $
                          {displayedTotal.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div
                          className="text-sm font-medium text-emerald-400 animate-in fade-in duration-700"
                          style={{ animationDelay: "350ms" }}
                        >
                          USD
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800 transform transition-all duration-700 hover:scale-105">
                        <div
                          className="text-3xl font-bold text-slate-300 animate-in fade-in slide-in-from-bottom duration-700 tabular-nums"
                          style={{ animationDelay: "450ms" }}
                        >
                          J$
                          {(displayedTotal * exchangeRate).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }
                          )}
                        </div>
                        <div
                          className="text-xs font-medium text-slate-500 animate-in fade-in duration-700"
                          style={{ animationDelay: "550ms" }}
                        >
                          JMD (approx)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Breakdown */}
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">CIF Value</span>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          $
                          {result.cif.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          J$
                          {(result.cif * exchangeRate).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Duties & Taxes</span>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          $
                          {result.dutiesAndTaxes.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          J$
                          {(
                            result.dutiesAndTaxes * exchangeRate
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">All Fees</span>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          $
                          {(
                            result.breakdown.governmentFees +
                            result.breakdown.clearingCosts
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          J$
                          {(
                            (result.breakdown.governmentFees +
                              result.breakdown.clearingCosts) *
                            exchangeRate
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        {result && (
          <div
            id="detailed-breakdown"
            className="mt-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-700 animate-in fade-in slide-in-from-bottom"
            style={{ animationDelay: "300ms" }}
          >
            <div className="bg-linear-to-r from-blue-900/50 to-indigo-900/50 px-6 py-4 border-b border-blue-800/50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-300" strokeWidth={1.5} />
                <h2 className="text-lg font-semibold text-white">
                  Detailed Breakdown
                </h2>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Purchase & Shipping */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package
                    className="w-4 h-4 text-blue-400"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Purchase & Shipping
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">FOB Price</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${parseFloat(fobPrice).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(parseFloat(fobPrice) * exchangeRate).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Shipping</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${parseFloat(shipping).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(parseFloat(shipping) * exchangeRate).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Insurance</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${parseFloat(insurance).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(parseFloat(insurance) * exchangeRate).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    <span className="font-semibold text-white">CIF Total</span>
                    <div className="text-right">
                      <div className="font-bold text-white">
                        ${result.cif.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(result.cif * exchangeRate).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Government Fees */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2
                    className="w-4 h-4 text-blue-400"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Government Fees
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">
                      Duties & Taxes ({rates.aggregate}%)
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        $
                        {result.dutiesAndTaxes.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(result.dutiesAndTaxes * exchangeRate).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">CAF</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${result.caf.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(result.caf * exchangeRate).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Env. Levy</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        $
                        {result.environmentalLevy.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(
                          result.environmentalLevy * exchangeRate
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Std. Compliance</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        $
                        {result.standardCompliance.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(
                          result.standardCompliance * exchangeRate
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Trade Board</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${result.tradeBoardFees.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(result.tradeBoardFees * exchangeRate).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                        )}
                      </div>
                    </div>
                  </div>
                  {result.taxiLicenseFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Taxi License</span>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${result.taxiLicenseFee.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          J$
                          {(
                            result.taxiLicenseFee * exchangeRate
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Clearing Costs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Anchor className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Clearing Costs
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Broker Fees</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${result.brokerFees.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(result.brokerFees * exchangeRate).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Port Charges</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${result.portCharges.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(result.portCharges * exchangeRate).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    <span className="font-semibold text-white">
                      Clearing Total
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-white">
                        ${result.breakdown.clearingCosts.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        J$
                        {(
                          result.breakdown.clearingCosts * exchangeRate
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grand Total */}
            <div className="bg-linear-to-r from-emerald-900/30 to-teal-900/30 px-6 py-5 border-t border-blue-800/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-lg font-semibold text-white">
                  Grand Total
                </span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white tabular-nums">
                    $
                    {displayedTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    USD
                  </div>
                  <div className="text-lg font-semibold text-slate-300 mt-1 tabular-nums">
                    J$
                    {(displayedTotal * exchangeRate).toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    JMD
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Important Notes - shown after detailed breakdown */}
        {result && (
          <div
            className="mt-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-700 animate-in fade-in slide-in-from-bottom "
            style={{ animationDelay: "400ms" }}
          >
            <div className="px-6 py-4 border-b border-blue-800/50 bg-linear-to-r from-red-900/30 to-rose-900/30">
              <div className="flex items-center gap-3">
                <AlertCircle
                  className="w-5 h-5 text-red-400"
                  strokeWidth={1.5}
                />
                <h3 className="text-base font-semibold text-red-100">
                  Important Notes
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex gap-3 items-start">
                <CheckCircle
                  className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <p className="text-slate-300">
                  Cars & SUVs: Maximum 6 years old (or 10 years for registered
                  taxi operators)
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle
                  className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <p className="text-slate-300">
                  2 vehicles every 3 years per individual
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle
                  className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <p className="text-slate-300">
                  Right-hand drive vehicles allowed
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle
                  className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <p className="text-slate-300">
                  PSI certificate required for used vehicles
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle
                  className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <p className="text-slate-300">
                  Taxi operators: Route taxi license ~$15,000 JMD/year required
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Money Saving Tips */}
        <div
          className="mt-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 transition-all  animate-in fade-in slide-in-from-bottom duration-700"
          style={{ animationDelay: "500ms" }}
        >
          <div className="bg-linear-to-r from-blue-900/50 to-indigo-900/50 px-6 py-4 border-b border-blue-800/50">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-300" strokeWidth={1.5} />
              <h2 className="text-lg font-semibold text-white">
                Money-Saving Tips
              </h2>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Zap,
                title: "Go Hybrid",
                tip: "Hybrid vehicles have lower aggregate rates (39% vs 66%)",
              },
              {
                icon: Gauge,
                title: "Small Engine",
                tip: "Vehicles ≤1000cc get the lowest tax rates",
              },
              {
                icon: Fuel,
                title: "Diesel Power",
                tip: "Diesel vehicles have lower rates than gasoline",
              },
              {
                icon: Ship,
                title: "Compare Shipping",
                tip: "Get quotes from multiple shipping companies",
              },
              {
                icon: FileCheck,
                title: "Check Age",
                tip: "Ensure vehicle meets age restrictions (6 years max)",
              },
              {
                icon: Calculator,
                title: "Total Cost",
                tip: "Always calculate total landed cost, not just purchase price",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/50 hover:border-blue-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors duration-300">
                    <item.icon
                      className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform duration-300"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-semibold text-white text-sm pt-1.5">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed ml-11">
                  {item.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative border-t border-blue-900/50 bg-slate-950/80 backdrop-blur-xl py-6 mt-12 animate-in fade-in slide-in-from-bottom duration-700"
        style={{ animationDelay: "700ms" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              <p className="text-sm font-medium text-amber-400">
                Close Estimates - Final Costs May Vary
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Based on {getYear()} Jamaica Customs Agency regulations • Always
              verify with licensed customs broker
            </p>
          </div>
          <div className="text-center pt-4 border-t border-blue-900/50">
            <p className="text-xs text-slate-400">
              Developed by{" "}
              <a
                href="https://www.devjasonclarke.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                Dev Jason Clarke
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
