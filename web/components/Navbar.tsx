'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="bg-industrial-900 text-white border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <Link href="/" onClick={closeMenu}>
                            <BrandLogo />
                        </Link>
                        <span className="hidden sm:inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/70 uppercase tracking-widest border border-white/5">
                            Texas Beta
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">Blog</Link>
                        <Link href="/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
                        <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>
                        <Link
                            href="#newsletter"
                            className="bg-safety-500 hover:bg-safety-600 text-industrial-900 font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                            Free Newsletter
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-slate-300 hover:text-white focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? (
                                // X Icon
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                // Hamburger Icon
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-industrial-900 border-t border-white/10">
                    <div className="px-4 pt-2 pb-4 space-y-1 sm:px-3 flex flex-col">
                        <Link
                            href="/blog"
                            onClick={closeMenu}
                            className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
                        >
                            Blog
                        </Link>
                        <Link
                            href="/about"
                            onClick={closeMenu}
                            className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            onClick={closeMenu}
                            className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
                        >
                            Contact
                        </Link>
                        <Link
                            href="#newsletter"
                            onClick={closeMenu}
                            className="block px-3 py-3 mt-2 rounded-md text-base font-bold text-industrial-900 bg-safety-500 hover:bg-safety-600 text-center"
                        >
                            Free Newsletter
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
