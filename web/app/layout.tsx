import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import BrandLogo from '@/components/BrandLogo';
import Navbar from '@/components/Navbar';
import { CURRENT_YEAR, SEO_YEAR } from '@/utils/date';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F172A',
};

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://tradepathusa.com'),
    title: 'TradePathUSA | Texas Trade School ROI Engine',
    description: `Stop guessing. Start earning. Verify verified ${SEO_YEAR} trade school tuition vs salary data in Texas. Avoid debt and find high-ROI programs for Welding, HVAC, Electrician.`,
    verification: {
      google: 'wfZGhN4QWS2AX9H0MTLkSoQRAdaK8TgjMaOXi8nDaz0',
      yandex: '327c1e753260492e',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-industrial-100 text-industrial-900 antialiased font-sans`}>
        {/* NAV */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-industrial-900 text-slate-200 py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
              <div className="md:col-span-2">
                <p className="mb-4 text-lg font-semibold text-slate-200 tracking-tight">TradePathUSA.com &copy; {CURRENT_YEAR}</p>
                <p className="text-sm opacity-60 max-w-md leading-relaxed mx-auto md:mx-0">
                  Data sourced directly from the U.S. Department of Education (CollegeScorecard) & Bureau of Labor Statistics (OEWS).
                  <br />TradePath is an independent resource and is not a government entity. Salaries are estimations for educational purposes.
                </p>
              </div>

              <div>
                <h3 className="text-slate-200 font-bold mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="hover:text-safety-500 transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-safety-500 transition-colors">Contact</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-slate-200 font-bold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="hover:text-safety-500 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-safety-500 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
        <Analytics />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-3JLRJVD1GK"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3JLRJVD1GK');
            `,
          }}
        />
      </body>
    </html>
  );
}
