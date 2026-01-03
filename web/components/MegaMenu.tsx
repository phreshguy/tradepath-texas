'use client';

import Link from 'next/link';

const skilledTrades = [
    { label: 'Welding Technology', href: '/welding' },
    { label: 'HVAC/R Technician', href: '/hvac' },
    { label: 'Electrician & Power', href: '/electrician' },
    { label: 'Plumbing & Pipefitting', href: '/plumbing' },
    { label: 'Auto & Diesel Service', href: '/mechanic' }, // Combined for space
    { label: 'Carpentry & Const.', href: '/construction' },
    { label: 'CNC Machining & Fab', href: '/machining' },
    { label: 'Solar Energy Tech', href: '/solar-energy-technology' },
];

const healthcareTech = [
    { label: 'Nursing (LPN-RN)', href: '/nursing-lpn-rn' },
    { label: 'Dental Assistant', href: '/dental-assistant' },
    { label: 'Medical Assistant', href: '/medical-clinical-assistant' },
    { label: 'IT & Cyber Security', href: '/cybersecurity-network-tech' },
];

const serviceTransport = [
    { label: 'Aviation Maintenance', href: '/aviation-maintenance' },
    { label: 'Commercial Driving', href: '/commercial-driving-cdl' },
    { label: 'Culinary Arts', href: '/culinary-arts' },
    { label: 'Cosmetology', href: '/cosmetology-barbering' },
];

export default function MegaMenu() {
    return (
        <div className="absolute top-full left-0 w-[750px] bg-industrial-800 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-6 -mt-1 backdrop-blur-xl">
            <div className="grid grid-cols-3 gap-8">
                {/* Column 1: Skilled Trades */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-slate-700"></span>
                        Skilled Trades
                    </h3>
                    <div className="flex flex-col gap-1">
                        {skilledTrades.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm text-slate-300 hover:text-safety-500 transition-colors py-1.5 px-3 hover:bg-white/5 rounded-lg flex items-center justify-between group/link"
                            >
                                {item.label}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-safety-500"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Column 2: Med & Tech */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-slate-700"></span>
                        Med & Tech
                    </h3>
                    <div className="flex flex-col gap-1">
                        {healthcareTech.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm text-slate-300 hover:text-safety-500 transition-colors py-1.5 px-3 hover:bg-white/5 rounded-lg flex items-center justify-between group/link"
                            >
                                {item.label}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-safety-500"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Column 3: Service & Transport */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-slate-700"></span>
                        Service & Transport
                    </h3>
                    <div className="flex flex-col gap-1">
                        {serviceTransport.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm text-slate-300 hover:text-safety-500 transition-colors py-1.5 px-3 hover:bg-white/5 rounded-lg flex items-center justify-between group/link"
                            >
                                {item.label}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-safety-500"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">National ROI Database v1.3</p>
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-safety-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-safety-500 opacity-50 rounded-full"></div>
                    <div className="w-1 h-1 bg-safety-500 opacity-20 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
