"use client";

import { useState, useEffect, useRef } from "react";
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
  BatteryCharging,
  ChevronDown,
  ArrowRight,
  Banknote,
  Sun,
  Moon,
} from "lucide-react";

type VehicleType = "car" | "suv" | "pickup" | "hybrid" | "truck" | "electric";
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

const VEHICLE_OPTIONS: {
  value: VehicleType;
  icon: React.ElementType;
  label: string;
  sub: string;
}[] = [
  { value: "car",      icon: Car,             label: "Car",      sub: "Sedan / Hatchback" },
  { value: "suv",      icon: Car,             label: "SUV",      sub: "4WD / Crossover"   },
  { value: "pickup",   icon: Truck,           label: "Pickup",   sub: "Single / Double cab"},
  { value: "hybrid",   icon: Zap,             label: "Hybrid",   sub: "Petrol + Electric"  },
  { value: "truck",    icon: Truck,           label: "Truck",    sub: "Commercial"          },
  { value: "electric", icon: BatteryCharging, label: "Electric", sub: "Full EV"             },
];

function fmtCommas(v: string): string {
  return v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function stripCommas(v: string): string {
  return v.replace(/,/g, "");
}
function fmt(n: number, dp = 0): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

function useAnimatedNumber(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef  = useRef<number>(0);
  const fromRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    fromRef.current  = value;
    startRef.current = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startRef.current) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

export default function JamaicaImportCalculator() {
  /* ── Theme ── */
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const prefersDark = document.documentElement.classList.contains("dark");
    setIsDark(prefersDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  /* ── Form state ── */
  const [fobPrice,       setFobPrice]       = useState("6000");
  const [shipping,       setShipping]       = useState("800");
  const [insurance,      setInsurance]      = useState("100");
  const [vehicleType,    setVehicleType]    = useState<VehicleType>("car");
  const [fuelType,       setFuelType]       = useState<FuelType>("gasoline");
  const [engineSize,     setEngineSize]     = useState("1986");
  const [isUsed,         setIsUsed]         = useState(true);
  const [isTaxiOperator, setIsTaxiOperator] = useState(false);

  /* ── Display state ── */
  const [result,          setResult]         = useState<CalculationResult | null>(null);
  const [exchangeRate,    setExchangeRate]   = useState(154);
  const [isLoadingRate,   setIsLoadingRate]  = useState(false);
  const [rateLastUpdated, setRateLastUpdated]= useState("");
  const [showJMD,         setShowJMD]        = useState(false);
  const [breakdownOpen,   setBreakdownOpen]  = useState(false);

  /* ── Formatted inputs ── */
  const [fobFmt,  setFobFmt]  = useState("6,000");
  const [shipFmt, setShipFmt] = useState("800");
  const [insFmt,  setInsFmt]  = useState("100");
  const [engFmt,  setEngFmt]  = useState("1,986");

  const animatedTotal     = useAnimatedNumber(result?.totalCost ?? 0);
  const animatedAggregate = useAnimatedNumber(getRates().aggregate, 700);

  function getYear() { return new Date().getFullYear(); }

  function getRates(): VehicleRates {
    const cc = parseInt(engineSize) || 0;
    if (vehicleType === "electric") return { aggregate: 15, importDuty: 0, scta: 0, gct: 15 };
    if (vehicleType === "hybrid")   return { aggregate: 39, importDuty: 20, scta: 0, gct: 15 };
    if (vehicleType === "truck")    return { aggregate: 33, importDuty: 10, scta: 5, gct: 15 };
    if (vehicleType === "pickup") {
      if (fuelType === "gasoline") {
        if (cc < 1850)  return { aggregate: 39, importDuty: 20, scta: 0,  gct: 15 };
        if (cc <= 2200) return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
        return                 { aggregate: 94, importDuty: 20, scta: 40, gct: 15 };
      } else {
        if (cc < 1850)  return { aggregate: 39, importDuty: 20, scta: 0,  gct: 15 };
        if (cc <= 2200) return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
        return                 { aggregate: 80, importDuty: 20, scta: 30, gct: 15 };
      }
    }
    if (vehicleType === "suv") {
      if (fuelType === "gasoline") {
        if (cc <= 1000) return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
        if (cc <= 2000) return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
        return                 { aggregate: 80, importDuty: 20, scta: 30, gct: 15 };
      } else {
        if (cc <= 2000) return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
        return                 { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
      }
    }
    // Regular car
    if (fuelType === "gasoline") {
      if (cc <= 1000) return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
      if (cc <= 2000) return { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
      return                 { aggregate: 80, importDuty: 20, scta: 30, gct: 15 };
    } else {
      if (cc <= 1000) return { aggregate: 39, importDuty: 20, scta: 0,  gct: 15 };
      if (cc <= 2200) return { aggregate: 52, importDuty: 20, scta: 10, gct: 15 };
      return                 { aggregate: 66, importDuty: 20, scta: 20, gct: 15 };
    }
  }

  function calculateCost(): CalculationResult {
    const fob     = parseFloat(fobPrice)  || 0;
    const freight = parseFloat(shipping)  || 0;
    const ins     = parseFloat(insurance) || 0;
    const cif     = fob + freight + ins;
    const rates   = getRates();
    const dutiesAndTaxes     = cif * (rates.aggregate / 100);
    const caf                = isUsed ? 430 : 410;
    const environmentalLevy  = cif * 0.005;
    const stampDuty          = cif > 35 ? 0.65 : 0;
    const standardCompliance = cif * 0.003;
    const tradeBoardFees     = 48;
    const brokerFees         = 300;
    const portCharges        = 200;
    const taxiLicenseFee     = isTaxiOperator ? 97 : 0;
    const totalFees =
      caf + environmentalLevy + stampDuty + standardCompliance +
      tradeBoardFees + brokerFees + portCharges + taxiLicenseFee;
    return {
      cif, dutiesAndTaxes, caf, environmentalLevy, stampDuty,
      standardCompliance, tradeBoardFees, brokerFees, portCharges,
      taxiLicenseFee, totalCost: cif + dutiesAndTaxes + totalFees,
      breakdown: {
        purchaseAndShipping: cif,
        governmentFees: caf + environmentalLevy + stampDuty + standardCompliance + tradeBoardFees + taxiLicenseFee,
        clearingCosts: brokerFees + portCharges,
      },
    };
  }

  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const res  = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      if (data.rates?.JMD) {
        setExchangeRate(data.rates.JMD);
        setRateLastUpdated(
          new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        );
      }
    } catch { /* keep default */ }
    finally { setIsLoadingRate(false); }
  };

  useEffect(() => { fetchExchangeRate(); }, []);
  useEffect(() => {
    setResult(calculateCost());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fobPrice, shipping, insurance, vehicleType, fuelType, engineSize, isUsed, isTaxiOperator]);

  const rates      = getRates();
  const totalFees  = result ? result.breakdown.governmentFees + result.breakdown.clearingCosts : 0;
  const maxSegment = result ? Math.max(result.cif, result.dutiesAndTaxes, totalFees, 1) : 1;

  const display = (usd: number) =>
    showJMD ? `J$${fmt(usd * exchangeRate)}` : `$${fmt(usd)}`;

  const rateColor =
    rates.aggregate <= 20 ? "text-emerald-600 dark:text-emerald-400" :
    rates.aggregate <= 39 ? "text-green-600 dark:text-green-400" :
    rates.aggregate <= 52 ? "text-amber-600 dark:text-yellow-400" :
    rates.aggregate <= 66 ? "text-orange-600 dark:text-amber-400" :
                            "text-red-600 dark:text-red-400";

  const rateBg =
    rates.aggregate <= 20 ? "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/5" :
    rates.aggregate <= 39 ? "from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/5" :
    rates.aggregate <= 52 ? "from-amber-500/10 to-amber-500/5 dark:from-yellow-500/20 dark:to-yellow-500/5" :
    rates.aggregate <= 66 ? "from-orange-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-amber-500/5" :
                            "from-red-500/10 to-red-500/5 dark:from-red-500/20 dark:to-red-500/5";

  /* ── Shared class helpers ── */
  const labelCls   = "block text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2.5";
  const hintCls    = "text-[10px] text-slate-400 dark:text-slate-600";
  const cardIconBg = "flex items-center justify-center w-7 h-7 rounded-lg shrink-0";

  const activeBtnCls = (condition: boolean, color: "blue" | "violet" | "amber" = "blue") => {
    const palettes = {
      blue:   "bg-blue-500/15 dark:bg-blue-500/15 border border-blue-500/50 text-blue-700 dark:text-blue-400",
      violet: "bg-violet-500/15 dark:bg-violet-500/15 border border-violet-500/50 text-violet-700 dark:text-violet-400",
      amber:  "bg-amber-500/15 dark:bg-amber-500/15 border border-amber-500/50 text-amber-700 dark:text-amber-400",
    };
    return condition
      ? `${palettes[color]} cursor-pointer`
      : "btn-ghost cursor-pointer";
  };

  return (
    <div className="min-h-screen page-bg">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 header-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
              <Ship className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none block">
                Jamaica Auto Import
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-500 leading-none mt-0.5 block">
                Cost Calculator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* JMD toggle */}
            <button
              onClick={() => setShowJMD(v => !v)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                showJMD
                  ? "bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              {showJMD ? "JMD" : "USD"}
            </button>

            {/* Exchange rate */}
            <button
              onClick={fetchExchangeRate}
              disabled={isLoadingRate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg btn-ghost disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isLoadingRate ? "animate-spin-slow" : ""}`}
                strokeWidth={2}
              />
              <div className="hidden sm:block text-left">
                <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 tabular">
                  1 USD = {exchangeRate.toFixed(2)} JMD
                </div>
                {rateLastUpdated && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-600">{rateLastUpdated}</div>
                )}
              </div>
              <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 sm:hidden tabular">
                {exchangeRate.toFixed(0)}
              </div>
            </button>

            {/* Year badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 pulse-dot block" />
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{getYear()}</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(v => !v)}
              className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center cursor-pointer"
              title={!mounted ? "Toggle theme" : isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark light theme"
              aria-pressed={isDark}
            >
              {mounted ? (
                isDark
                  ? <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
                  : <Moon className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse block" />
            Real-time USD → JMD · {getYear()} Customs Rates
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            Calculate your{" "}
            <span className="gradient-text">import costs</span>
            <br />before you buy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Accurate Jamaica Customs Agency rates for cars, SUVs, pickups, hybrids, trucks, and EVs.
            All fees included — no surprises at the port.
          </p>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ── LEFT: FORM ── */}
          <div className="space-y-5">

            {/* Vehicle Type */}
            <section className="surface rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className={`${cardIconBg} bg-blue-100 dark:bg-blue-500/15`}>
                  <Car className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Vehicle Type</h2>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {VEHICLE_OPTIONS.map(({ value, icon: Icon, label, sub }) => {
                  const active = vehicleType === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setVehicleType(value)}
                      className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                        active
                          ? "bg-blue-500/15 dark:bg-blue-500/15 border border-blue-500/50 shadow-sm"
                          : "btn-ghost"
                      }`}
                    >
                      {active && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-500/8 to-transparent pointer-events-none" />
                      )}
                      <Icon
                        className={`w-5 h-5 transition-colors duration-200 ${
                          active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        }`}
                        strokeWidth={1.75}
                      />
                      <span className={`text-xs font-semibold leading-none transition-colors duration-200 ${
                        active ? "text-blue-700 dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                      }`}>
                        {label}
                      </span>
                      <span className={`text-[9px] leading-none text-center transition-colors duration-200 ${
                        active ? "text-blue-600/60 dark:text-blue-400/70" : "text-slate-400 dark:text-slate-600"
                      }`}>
                        {sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Configuration */}
            <section className="surface rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className={`${cardIconBg} bg-violet-100 dark:bg-violet-500/15`}>
                  <Gauge className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
                </div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Configuration</h2>
              </div>

              {/* Fuel type */}
              {vehicleType !== "hybrid" && vehicleType !== "electric" && (
                <div>
                  <label className={labelCls}>Fuel Type</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(["gasoline", "diesel"] as FuelType[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setFuelType(f)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeBtnCls(fuelType === f, "violet")}`}
                      >
                        <Fuel className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Engine size OR EV banner */}
              {vehicleType !== "electric" ? (
                <div>
                  <label className={labelCls}>Engine Size (CC)</label>
                  <div className="relative">
                    <Gauge className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600 pointer-events-none" strokeWidth={1.75} />
                    <input
                      type="text"
                      value={engFmt}
                      onChange={e => { const f = fmtCommas(e.target.value); setEngFmt(f); setEngineSize(stripCommas(f)); }}
                      placeholder="1,986"
                      className="field w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">EV Import Concession Active</p>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 leading-relaxed">
                        0% import duty · 0% SCTA · 15% GCT only — Jamaica&apos;s EV incentive programme
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Condition */}
              <div>
                <label className={labelCls}>Condition</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[{ v: true, label: "Used", icon: Car }, { v: false, label: "Brand New", icon: Sparkles }].map(({ v, label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => setIsUsed(v)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeBtnCls(isUsed === v, "violet")}`}
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Taxi operator */}
              {(vehicleType === "car" || vehicleType === "suv") && isUsed && (
                <div>
                  <label className={labelCls}>Registered Taxi Operator?</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[{ v: false, label: "No" }, { v: true, label: "Yes (up to 10 yr)" }].map(({ v, label }) => (
                      <button
                        key={label}
                        onClick={() => setIsTaxiOperator(v)}
                        className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeBtnCls(isTaxiOperator === v, "amber")}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {isTaxiOperator && (
                    <p className="mt-2.5 text-xs text-amber-600 dark:text-amber-400/70 leading-relaxed">
                      Full duties still apply. +~$97 USD (~J$15,000) for route taxi licence fee.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Pricing */}
            <section className="surface rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className={`${cardIconBg} bg-emerald-100 dark:bg-emerald-500/15`}>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Pricing Details</h2>
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-600">All values in USD</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "FOB Price", hint: "Purchase price, free on board", placeholder: "6,000", value: fobFmt, onChange: (v: string) => { const f = fmtCommas(v); setFobFmt(f); setFobPrice(stripCommas(f)); } },
                  { label: "Shipping / Freight", hint: "Cost to ship to Jamaica", placeholder: "800", value: shipFmt, onChange: (v: string) => { const f = fmtCommas(v); setShipFmt(f); setShipping(stripCommas(f)); } },
                  { label: "Insurance", hint: "Marine / cargo insurance", placeholder: "100", value: insFmt, onChange: (v: string) => { const f = fmtCommas(v); setInsFmt(f); setInsurance(stripCommas(f)); } },
                ].map(({ label, hint, placeholder, value, onChange }) => (
                  <div key={label}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
                      <span className={hintCls}>{hint}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-semibold pointer-events-none">$</span>
                      <input
                        type="text"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="field w-full pl-7 pr-4 py-3 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                ))}

                {result && (
                  <div className="flex items-center justify-between pt-3 mt-1 border-t divider">
                    <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                      <Info className="w-3 h-3" />
                      CIF Value (taxable base)
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white tabular">{display(result.cif)}</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── RIGHT: RESULTS (sticky) ── */}
          <div className="lg:sticky lg:top-20 space-y-5">

            {/* Tax Rate Card */}
            <div className={`surface rounded-2xl p-5 bg-gradient-to-br ${rateBg}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Duty & Tax Rate</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                  {vehicleType}{vehicleType !== "electric" && vehicleType !== "hybrid" ? ` · ${fuelType}` : ""}
                </span>
              </div>

              <div className="flex items-end gap-2 mb-5">
                <span className={`text-6xl font-bold tabular leading-none ${rateColor}`}>
                  {Math.round(animatedAggregate)}
                </span>
                <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500 mb-1">%</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 ml-1">aggregate</span>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Import Duty", value: rates.importDuty },
                  { label: "SCTA",        value: rates.scta },
                  { label: "GCT",         value: rates.gct },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-500">{label}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 dark:bg-white/20 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min((value / 40) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white tabular w-8 text-right">{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Cost Card */}
            {result && (
              <div className="surface rounded-2xl overflow-hidden glow-emerald">
                <div className="p-5 border-b divider">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Landed Cost</span>
                    <button
                      onClick={() => setShowJMD(v => !v)}
                      className="ml-auto text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 cursor-pointer flex items-center gap-1"
                    >
                      <Banknote className="w-3 h-3" />
                      {showJMD ? "Show USD" : "Show JMD"}
                    </button>
                  </div>

                  <div className="text-center py-2">
                    <div className="text-5xl font-bold text-slate-900 dark:text-white tabular leading-none mb-1">
                      {showJMD ? "J$" : "$"}{fmt(showJMD ? animatedTotal * exchangeRate : animatedTotal)}
                    </div>
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                      {showJMD ? "Jamaican Dollars" : "US Dollars"}
                    </div>
                    {!showJMD && (
                      <div className="text-sm text-slate-400 dark:text-slate-600 mt-1 tabular">
                        ≈ J${fmt(animatedTotal * exchangeRate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Segment bars */}
                <div className="p-5 space-y-3">
                  {[
                    { label: "Vehicle + Shipping", value: result.cif,            color: "bg-blue-500"   },
                    { label: "Duties & Taxes",     value: result.dutiesAndTaxes, color: "bg-amber-500"  },
                    { label: "Fees & Clearing",    value: totalFees,             color: "bg-violet-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-white tabular">{display(value)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${(value / maxSegment) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand */}
                <button
                  onClick={() => setBreakdownOpen(v => !v)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 border-t divider text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  {breakdownOpen ? "Hide" : "View"} detailed breakdown
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${breakdownOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── DETAILED BREAKDOWN ── */}
        {result && breakdownOpen && (
          <div className="mt-5 surface rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center gap-3 px-6 py-4 border-b divider">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Full Cost Breakdown</h2>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-600">All in {showJMD ? "JMD" : "USD"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/60 dark:divide-white/[0.06]">
              {/* Purchase & Shipping */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
                  <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Purchase & Shipping</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: "FOB Price",  value: parseFloat(fobPrice)  || 0 },
                    { label: "Freight",    value: parseFloat(shipping)  || 0 },
                    { label: "Insurance", value: parseFloat(insurance) || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-500">{label}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 tabular">{display(value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2.5 border-t divider">
                    <span className="font-semibold text-slate-800 dark:text-white text-xs">CIF Total</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular">{display(result.cif)}</span>
                  </div>
                </div>
              </div>

              {/* Government Fees */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
                  <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Government Fees</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: `Duties & Taxes (${rates.aggregate}%)`, value: result.dutiesAndTaxes },
                    { label: `CAF (${isUsed ? "Used" : "New"})`, value: result.caf },
                    { label: "Environmental Levy (0.5%)", value: result.environmentalLevy },
                    { label: "Std. Compliance (0.3%)",   value: result.standardCompliance },
                    { label: "Trade Board Fee",           value: result.tradeBoardFees },
                    ...(result.taxiLicenseFee ? [{ label: "Taxi Licence", value: result.taxiLicenseFee }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-500">{label}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 tabular">{display(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clearing Costs */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Anchor className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" strokeWidth={1.75} />
                  <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Clearing Costs</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: "Customs Broker", value: result.brokerFees },
                    { label: "Port Charges",   value: result.portCharges },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-500">{label}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 tabular">{display(value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2.5 border-t divider">
                    <span className="font-semibold text-slate-800 dark:text-white text-xs">Clearing Total</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular">{display(result.breakdown.clearingCosts)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grand total bar */}
            <div className="px-6 py-5 border-t divider bg-emerald-50/80 dark:bg-gradient-to-r dark:from-emerald-900/20 dark:to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-slate-800 dark:text-white">Grand Total (Landed Cost)</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tabular">{display(result.totalCost)}</div>
                {!showJMD && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 tabular mt-0.5">≈ J${fmt(result.totalCost * exchangeRate)}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TIPS & NOTES ── */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Money-saving tips */}
          <div className="surface rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b divider">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Money-Saving Tips</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { icon: BatteryCharging, title: "Go Electric",    tip: "Best rate — just 15% GCT (0% import duty & SCTA)",                   iconCls: "text-emerald-600 dark:text-emerald-400", bgCls: "bg-emerald-100 dark:bg-emerald-500/10" },
                { icon: Zap,             title: "Go Hybrid",      tip: "39% aggregate vs up to 80% for large petrol cars",                    iconCls: "text-yellow-600 dark:text-yellow-400",  bgCls: "bg-yellow-100 dark:bg-yellow-500/10"  },
                { icon: Gauge,           title: "Small Engine",   tip: "Sub-1000cc gets the lowest duty tier for petrol cars",                iconCls: "text-blue-600 dark:text-blue-400",     bgCls: "bg-blue-100 dark:bg-blue-500/10"      },
                { icon: Fuel,            title: "Choose Diesel",  tip: "Diesel rates are consistently lower than equivalent petrol",          iconCls: "text-violet-600 dark:text-violet-400", bgCls: "bg-violet-100 dark:bg-violet-500/10"  },
                { icon: Ship,            title: "Compare Freight",tip: "Shipping is part of CIF — lower freight = lower tax base",            iconCls: "text-cyan-600 dark:text-cyan-400",     bgCls: "bg-cyan-100 dark:bg-cyan-500/10"      },
                { icon: FileCheck,       title: "Check Age Rules",tip: "Max 6 yrs for cars/SUVs; 10 yrs for registered taxi operators",       iconCls: "text-amber-600 dark:text-amber-400",   bgCls: "bg-amber-100 dark:bg-amber-500/10"    },
              ].map(({ icon: Icon, title, tip, iconCls, bgCls }) => (
                <div key={title} className="group flex gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-200">
                  <div className={`w-7 h-7 rounded-lg ${bgCls} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-3.5 h-3.5 ${iconCls}`} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white mb-0.5">{title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="surface rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b divider">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Important Notes</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                "Cars & SUVs: maximum 6 years old (10 years for registered taxi operators)",
                "Maximum 2 vehicles imported per individual every 3 years",
                "Right-hand drive vehicles are permitted",
                "PSI (pre-shipment inspection) certificate required for all used vehicles",
                "Electric vehicles qualify for 0% import duty & SCTA — only 15% GCT on CIF applies",
                "Estimates only — always verify final costs with a licensed customs broker",
              ].map((text, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                  <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-600 mt-1 shrink-0" strokeWidth={2} />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t divider py-8 mt-4 bg-white/60 dark:bg-[rgba(10,18,40,0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-600">
              <Shield className="w-3.5 h-3.5 text-amber-500/70" strokeWidth={1.75} />
              <span>Estimates only · Always verify with a licensed customs broker · Based on {getYear()} JCA rates</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-600">
              Built by{" "}
              <a
                href="https://www.devjasonclarke.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
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
