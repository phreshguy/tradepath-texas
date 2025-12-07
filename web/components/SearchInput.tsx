"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchInput({ placeholder }: { placeholder: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setSearchTerm(searchParams.get("q") || "");
    }, [searchParams]);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.push(`/?q=${encodeURIComponent(searchTerm.trim())}`);
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
        <div className="bg-white p-2 rounded-2xl max-w-lg mx-auto flex flex-col md:flex-row shadow-2xl shadow-black/50 transform hover:-translate-y-1 transition-all duration-300">
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow px-6 py-3 md:py-0 text-navy-900 outline-none rounded-xl md:rounded-l-xl font-medium text-lg placeholder:text-slate-400"
            />
            <button
                onClick={handleSearch}
                className="bg-primary text-navy-900 font-bold px-8 py-3 rounded-xl hover:bg-amber-600 transition-colors shadow-lg w-full md:w-auto mt-2 md:mt-0"
            >
                Search
            </button>
        </div>
    );
}
