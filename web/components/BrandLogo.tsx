import React from 'react';

export default function BrandLogo() {
    return (
        <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative w-8 h-8 flex items-center justify-center bg-primary rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                {/* Gear Icon Background */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-navy-900 opacity-90"
                >
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    <circle cx="12" cy="12" r="7" />
                </svg>
                {/* Upward Arrow Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white drop-shadow-md">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-white transition-colors">
                TRADE<span className="text-primary font-bold">PATH</span>
            </span>
        </div>
    );
}
