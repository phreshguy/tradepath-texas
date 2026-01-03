"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const trades = [
    "Welding Technology",
    "HVAC/R Technician",
    "Electrician & Power Systems",
    "Plumbing & Pipefitting",
    "Automotive Service Tech",
    "Diesel & Heavy Equipment",
    "Carpentry & Construction",
    "CNC Machining & Fabrication",
    "Dental Assistant",
    "Medical Clinical Assistant",
    "Nursing (LPN-RN)",
    "Cybersecurity & Network Tech",
    "Cosmetology & Barbering",
];

export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [trade, setTrade] = useState("");
    const [city, setCity] = useState("");

    useEffect(() => {
        setTrade(searchParams.get("trade") || "");
        setCity(searchParams.get("q") || searchParams.get("city") || "");
    }, [searchParams]);

    const handleSearch = () => {
        const cityValue = city.trim();
        const params = new URLSearchParams();

        if (cityValue) params.set("q", cityValue);
        if (trade && trade !== "") params.set("trade", trade);

        // Routing logic: Always send to global search
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

    return (
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 sm:p-5 max-w-4xl mx-auto border border-slate-100 relative z-30">
            <div className="flex flex-col md:flex-row gap-4">

                {/* Trade Selector */}
                <div className="flex-1 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-safety-600 transition-colors pointer-events-none z-10">
                        {/* Wrench Icon (lucide-style) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                    </div>
                    <select
                        value={trade}
                        onChange={(e) => setTrade(e.target.value)}
                        className="w-full h-14 pl-12 pr-10 text-industrial-900 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-safety-500 focus:border-transparent focus:bg-white transition-all font-bold cursor-pointer"
                    >
                        <option value="">All Trades</option>
                        {trades.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>

                {/* City/Keyword Input */}
                <div className="flex-[1.2] relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-safety-600 transition-colors pointer-events-none z-10">
                        {/* Search Icon (lucide-style) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="City, school, or keyword..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full h-14 pl-12 pr-4 text-industrial-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-safety-500 focus:border-transparent focus:bg-white transition-all font-bold placeholder:text-slate-400"
                    />
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleSearch}
                    className="h-14 bg-safety-500 text-industrial-900 font-extrabold px-8 rounded-xl hover:bg-safety-600 transition-all shadow-lg hover:shadow-safety-500/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap min-w-[180px]"
                >
                    <span className="uppercase tracking-[1px] text-sm">Find Training</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
            </div>

            {/* Quick Filter Labels (Bonus for CX) */}
            <div className="mt-4 flex flex-wrap gap-2 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Popular:</span>
                {["Welding", "HVAC", "CDL", "Electrician"].map((tag) => (
                    <button
                        key={tag}
                        onClick={() => {
                            setCity(tag);
                            handleSearch();
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-safety-600 transition-colors uppercase tracking-wider"
                    >
                        #{tag}
                    </button>
                ))}
            </div>
        </div>
    );
}
