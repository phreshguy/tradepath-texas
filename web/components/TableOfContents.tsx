"use client";
import { useState } from 'react';

export default function TableOfContents({ headings }: { headings: string[] }) {
    const [isOpen, setIsOpen] = useState(true); // Default open

    // Helper to create valid #IDs like 'residential-wireman'
    const toSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (headings.length === 0) return null;

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 transition text-left"
            >
                <span className="text-xs font-bold uppercase tracking-widest text-industrial-900">
                    Quick Navigation
                </span>
                <span className={`transform transition-transform text-slate-500 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <ul className="p-4 space-y-2 text-sm">
                    {headings.map((head, i) => (
                        <li key={i}>
                            <a
                                href={`#${toSlug(head)}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector(`#${toSlug(head)}`)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="block text-slate-600 hover:text-safety-600 hover:bg-white hover:pl-2 rounded p-1 transition-all border-l-2 border-transparent hover:border-safety-500 truncate"
                            >
                                {head}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
