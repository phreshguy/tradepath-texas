'use client';

import Link from 'next/link';

interface ListingCardProps {
    school: {
        school_name: string;
        program_name: string;
        city: string;
        state: string;
        calculated_roi: number;
        tuition_in_state: number;
        projected_salary: number;
        salary_source_url: string;
        website: string;
        soc_code?: string;
    };
}

const formatUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://${url}`;
};

export default function ListingCard({ school }: ListingCardProps) {
    const govDataUrl = school.soc_code
        ? `https://www.onetonline.org/link/summary/${school.soc_code}`
        : "https://www.bls.gov/ooh/";

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-full overflow-hidden group hover:shadow-2xl transition-all duration-300">
            {/* Card Header */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. 1st Year ROI</span>
                <span className="text-success-500 font-black text-lg">
                    +${school.calculated_roi?.toLocaleString()}
                </span>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-grow">
                <h3 className="text-lg font-bold text-industrial-900 mb-1 leading-tight group-hover:text-safety-600 transition-colors line-clamp-2">
                    {school.school_name}
                </h3>
                <div className="text-sm text-slate-500 mb-6 flex items-center">
                    <span className="mr-1 opacity-50">📍</span>
                    {school.city}, {school.state}
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-slate-400 uppercase">Program</span>
                        <span className="text-sm font-bold text-industrial-800 text-right">{school.program_name}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-slate-400 uppercase">Tuition</span>
                        {school.tuition_in_state > 0 ? (
                            <span className="text-sm font-medium text-slate-600">${school.tuition_in_state.toLocaleString()}</span>
                        ) : (
                            <span className="text-xs italic text-slate-400">Contact for Pricing</span>
                        )}
                    </div>
                    <div className="border-t border-dashed border-slate-200"></div>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Proj. Salary</span>
                            <a
                                href={govDataUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 underline hover:text-blue-700"
                            >
                                Verify Gov Data
                            </a>
                        </div>
                        <span className="text-2xl font-black text-industrial-900">
                            ${school.projected_salary?.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Card Button */}
            <div className="p-4 bg-slate-50/50">
                <a
                    href={formatUrl(school.website) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-industrial-900 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-safety-500 hover:text-industrial-900 transition-all shadow-sm hover:shadow-md"
                >
                    Visit School
                </a>
            </div>
        </div>
    );
}
