"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const trades = [
    { label: "All Trades", value: "" },
    { label: "Welding Technology", value: "Welding Technology" },
    { label: "HVAC/R Technician", value: "HVAC/R Technician" },
    { label: "Electrician & Power Systems", value: "Electrician & Power Systems" },
    { label: "Plumbing & Pipefitting", value: "Plumbing & Pipefitting" },
    { label: "Automotive Service Tech", value: "Automotive Service Tech" },
    { label: "Diesel & Heavy Equipment", value: "Diesel & Heavy Equipment" },
    { label: "Carpentry & Construction", value: "Carpentry & Construction" },
    { label: "CNC Machining & Fabrication", value: "CNC Machining & Fabrication" },
];

export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [trade, setTrade] = useState("");
    const [city, setCity] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTrade(searchParams.get("trade") || "");
        setCity(searchParams.get("q") || searchParams.get("city") || "");
    }, [searchParams]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = () => {
        const cityValue = city.trim();
        const params = new URLSearchParams();

        if (cityValue) params.set("q", cityValue);
        if (trade && trade !== "") params.set("trade", trade);

        if (params.toString()) {
            router.push(`/search?${params.toString()}`);
        } else {
            router.push("/");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const selectedTradeLabel = trades.find(t => t.value === trade)?.label || "All Trades";

    return (
        <div className="bg-white p-2 rounded-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-2 shadow-2xl border border-slate-200/60 transition-all duration-300">

            {/* Input 1: Custom Trade Dropdown */}
            <div className="relative md:w-2/5" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full h-full px-5 py-4 text-left flex justify-between items-center bg-slate-50 hover:bg-white border border-transparent focus:border-industrial-900 rounded-xl transition-all duration-200 group"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Category</span>
                        <span className="text-industrial-900 font-bold truncate leading-none">
                            {selectedTradeLabel}
                        </span>
                    </div>
                    <svg
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-safety-600' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {trades.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setTrade(item.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-6 py-3 text-left hover:bg-industrial-50 flex items-center gap-3 transition-colors ${trade === item.value ? 'bg-industrial-50 text-safety-600 font-bold' : 'text-industrial-700 font-medium'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${trade === item.value ? 'bg-safety-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'bg-slate-200'}`}></span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Input 2: City Input */}
            <div className="flex-grow md:w-3/5">
                <div className="relative h-full flex items-center">
                    <div className="w-full h-full px-5 py-4 bg-slate-50 border border-transparent focus-within:border-industrial-900 focus-within:bg-white rounded-xl transition-all duration-200 flex flex-col justify-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Location or Keywords</span>
                        <input
                            type="text"
                            placeholder="e.g. Dallas, Welding, UTI..."
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent text-industrial-900 font-bold outline-none w-full placeholder:text-slate-300 leading-tight"
                        />
                    </div>
                </div>
            </div>

            {/* Action: Search Button */}
            <button
                onClick={handleSearch}
                className="bg-industrial-900 text-white font-black px-10 py-4 rounded-xl hover:bg-safety-500 hover:text-industrial-900 transition-all duration-300 shadow-xl shadow-industrial-900/10 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
                <span className="uppercase tracking-widest text-sm">Find Programs</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
        </div>
    );
}
