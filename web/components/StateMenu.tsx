'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const STATES = [
    { name: "Alabama", abbr: "al" }, { name: "Alaska", abbr: "ak" }, { name: "Arizona", abbr: "az" },
    { name: "Arkansas", abbr: "ar" }, { name: "California", abbr: "ca" }, { name: "Colorado", abbr: "co" },
    { name: "Connecticut", abbr: "ct" }, { name: "Delaware", abbr: "de" }, { name: "Florida", abbr: "fl" },
    { name: "Georgia", abbr: "ga" }, { name: "Hawaii", abbr: "hi" }, { name: "Idaho", abbr: "id" },
    { name: "Illinois", abbr: "il" }, { name: "Indiana", abbr: "in" }, { name: "Iowa", abbr: "ia" },
    { name: "Kansas", abbr: "ks" }, { name: "Kentucky", abbr: "ky" }, { name: "Louisiana", abbr: "la" },
    { name: "Maine", abbr: "me" }, { name: "Maryland", abbr: "md" }, { name: "Massachusetts", abbr: "ma" },
    { name: "Michigan", abbr: "mi" }, { name: "Minnesota", abbr: "mn" }, { name: "Mississippi", abbr: "ms" },
    { name: "Missouri", abbr: "mo" }, { name: "Montana", abbr: "mt" }, { name: "Nebraska", abbr: "ne" },
    { name: "Nevada", abbr: "nv" }, { name: "New Hampshire", abbr: "nh" }, { name: "New Jersey", abbr: "nj" },
    { name: "New Mexico", abbr: "nm" }, { name: "New York", abbr: "ny" }, { name: "North Carolina", abbr: "nc" },
    { name: "North Dakota", abbr: "nd" }, { name: "Ohio", abbr: "oh" }, { name: "Oklahoma", abbr: "ok" },
    { name: "Oregon", abbr: "or" }, { name: "Pennsylvania", abbr: "pa" }, { name: "Rhode Island", abbr: "ri" },
    { name: "South Carolina", abbr: "sc" }, { name: "South Dakota", abbr: "sd" }, { name: "Tennessee", abbr: "tn" },
    { name: "Texas", abbr: "tx" }, { name: "Utah", abbr: "ut" }, { name: "Vermont", abbr: "vt" },
    { name: "Virginia", abbr: "va" }, { name: "Washington", abbr: "wa" }, { name: "West Virginia", abbr: "wv" },
    { name: "Wisconsin", abbr: "wi" }, { name: "Wyoming", abbr: "wy" }
];

export default function StateMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            {/* Desktop Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors py-2 group"
            >
                <span>Select State</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-safety-500' : 'group-hover:text-safety-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Mega Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-screen max-w-4xl bg-industrial-900 border border-white/10 shadow-2xl rounded-2xl p-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="bg-safety-500 w-1.5 h-6 rounded-full"></span>
                            Browse Programs by State
                        </h3>
                        <p className="text-sm text-slate-400 font-light">Select a state to compare verified ROI</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-2 gap-x-4">
                        {STATES.map((state) => (
                            <Link
                                key={state.abbr}
                                href={`/${state.abbr}`}
                                onClick={() => setIsOpen(false)}
                                className="text-sm py-1.5 px-3 rounded-lg text-slate-400 hover:text-industrial-900 hover:bg-safety-500 transition-all font-medium flex items-center justify-between group"
                            >
                                <span>{state.name}</span>
                                <span className="text-[10px] opacity-0 group-hover:opacity-50 font-black uppercase">{state.abbr}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Separate component for Mobile Menu to avoid complex hydration/style issues
export function MobileStateList({ onClose }: { onClose: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border-t border-white/5 pt-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
                <span>Select State</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-safety-500' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="grid grid-cols-2 gap-1 px-3 py-2 bg-white/5 rounded-lg mt-1 mb-2 max-h-80 overflow-y-auto">
                    {STATES.map((state) => (
                        <Link
                            key={state.abbr}
                            href={`/${state.abbr}`}
                            onClick={onClose}
                            className="text-sm py-2 px-3 text-slate-400 hover:text-safety-500 transition-colors"
                        >
                            {state.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
