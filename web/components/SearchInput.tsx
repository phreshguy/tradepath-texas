"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [trade, setTrade] = useState("");
    const [city, setCity] = useState("");

    useEffect(() => {
        setTrade(searchParams.get("trade") || "");
        setCity(searchParams.get("city") || "");
        // If on /search page, might want to populate city from q if city is empty
        if (!city && searchParams.get("q")) {
            setCity(searchParams.get("q") || "");
        }
    }, [searchParams]);

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

    return (
        <div className="bg-white p-3 rounded-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2 shadow-2xl shadow-black/50 transform hover:-translate-y-1 transition-all duration-300 border border-slate-200">

            {/* Input 1: Trade Dropdown */}
            <div className="flex-grow md:w-1/3">
                <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    className="w-full h-full px-4 py-3 text-industrial-900 outline-none rounded-xl bg-industrial-50 border border-transparent focus:border-industrial-900 focus:bg-white transition-all font-medium appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
                >
                    <option value="">All Trades</option>
                    <option value="Welding Technology">Welding Technology</option>
                    <option value="HVAC/R Technician">HVAC/R Technician</option>
                    <option value="Electrician & Power Systems">Electrician & Power Systems</option>
                    <option value="Plumbing & Pipefitting">Plumbing & Pipefitting</option>
                    <option value="Automotive Service Tech">Automotive Service Tech</option>
                    <option value="Diesel & Heavy Equipment">Diesel & Heavy Equipment</option>
                    <option value="Carpentry & Construction">Carpentry & Construction</option>
                    <option value="CNC Machining & Fabrication">CNC Machining & Fabrication</option>
                </select>
            </div>

            {/* Input 2: City Input */}
            <div className="flex-grow md:w-1/3">
                <input
                    type="text"
                    placeholder="Search schools or cities..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full px-4 py-3 text-industrial-900 outline-none rounded-xl bg-industrial-50 border border-transparent focus:border-industrial-900 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                />
            </div>

            {/* Action: Search Button */}
            <button
                onClick={handleSearch}
                className="bg-safety-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-safety-600 transition-colors shadow-lg w-full md:w-auto mt-2 md:mt-0 active:scale-95"
            >
                Search
            </button>
        </div>
    );
}
