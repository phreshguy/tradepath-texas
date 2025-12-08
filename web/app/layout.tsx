import type { Metadata } from 'next';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://tradepath-texas-1u6d.vercel.app'),
  title: 'TradePath | Texas Trade School ROI Engine',
  description: 'Stop guessing. Start earning. Verify trade school salaries with government data.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased font-sans`}>
        {/* NAV */}
        <nav className="bg-navy-900 text-white border-b border-white/10 sticky top-0 z-50 h-16">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter">
                TRADE<span className="text-primary">PATH</span>
              </span>
              <span className="hidden sm:inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/70 uppercase tracking-widest border border-white/5">
                Texas Beta
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-secondary">
              <span className="text-xs opacity-50 text-slate-400">Not a government agency</span>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-navy-900 text-secondary py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
              <div className="md:col-span-2">
                <p className="mb-4 text-lg font-semibold text-slate-200 tracking-tight">TradePath.com &copy; 2025</p>
                <p className="text-sm opacity-60 max-w-md leading-relaxed mx-auto md:mx-0">
                  Data sourced directly from the U.S. Department of Education (CollegeScorecard) & Bureau of Labor Statistics (OEWS).
                  <br />TradePath is an independent resource and is not a government entity. Salaries are estimations for educational purposes.
                </p>
              </div>

              <div>
                <h3 className="text-slate-200 font-bold mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-slate-200 font-bold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
