import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import Link from 'next/link';

// Reuse formatUrl helper
const formatUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://${url}`;
};

type Props = {
    params: Promise<{
        city: string;
        trade: string;
    }>;
};

// Slug mapping helper
function mapTradeSlug(slug: string): string | null {
    const s = slug.toLowerCase();
    if (s === 'mechanic') return 'Mechanic/Repair Tech';
    if (s === 'construction') return 'Construction Trade';
    if (s === 'precision' || s === 'welding') return 'Precision Production';
    return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city, trade: tradeSlug } = await params;
    const trade = mapTradeSlug(tradeSlug);
    const decodedCity = decodeURIComponent(city);

    // Format city for display (Capitalize first letters)
    const cityTitle = decodedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (!trade) return { title: 'Not Found' };

    return {
        title: `Top ${trade} Schools in ${cityTitle}, TX (Salary & Cost) | TradePath`,
        description: `Compare verified outcomes for ${trade} programs in ${cityTitle}. Avg salary: $55k+. Govt Verified Data.`,
    };
}

export default async function Page({ params }: Props) {
    const { city, trade: tradeSlug } = await params;
    const mappedTrade = mapTradeSlug(tradeSlug);
    const decodedCity = decodeURIComponent(city);
    const cityTitle = decodedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (!mappedTrade) {
        notFound();
    }

    const supabase = createClient();

    // Query: Filter by city (ilike for fuzzy matching handling) and strict mapped category
    const { data: listings } = await supabase
        .from('verified_roi_listings')
        .select('*')
        .ilike('city', decodedCity)
        .eq('display_category', mappedTrade)
        .order('calculated_roi', { ascending: false });

    const hasListings = listings && listings.length > 0;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Small Nav Strip for Context */}
            <div className="bg-navy-900 text-white/60 text-sm py-2 px-4 border-b border-white/10">
                <div className="max-w-7xl mx-auto">
                    <Link href="/" className="hover:text-white transition-colors">← Back to Search</Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-3xl md:text-5xl font-bold text-navy-900 mb-4">
                    Top Rated <span className="text-primary">{mappedTrade}</span> Schools in <span className="underline decoration-blue-200">{cityTitle}, TX</span>
                </h1>
                <p className="text-lg text-slate-600 mb-12 max-w-3xl">
                    Verified government data on salaries, tuition, and ROI for {mappedTrade.toLowerCase()} careers in {cityTitle}.
                </p>

                {!hasListings ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center">
                        <h3 className="text-xl font-bold text-navy-900 mb-2">No programs found in {cityTitle} specifically.</h3>
                        <p className="text-slate-500 mb-6">These programs might be just outside the city limits or in verifying status.</p>
                        <Link href="/" className="inline-block bg-primary text-navy-900 font-bold px-6 py-3 rounded-xl hover:bg-orange-600 hover:text-white transition-colors">
                            Search Nearby Cities
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((school: any, i: number) => (
                            <div key={i} className="bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col h-full overflow-hidden group hover:shadow-2xl hover:border-primary/30 transition-all duration-300">

                                {/* Card Top: ROI Badge */}
                                <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. 1st Year ROI</span>
                                    <span className="text-success font-black text-xl tracking-tight">
                                        +${school.calculated_roi?.toLocaleString()}
                                    </span>
                                </div>

                                {/* Card Content */}
                                <div className="p-6 flex-grow">
                                    {/* School Name */}
                                    <h3 className="text-lg font-bold text-navy-900 mb-2 leading-tight line-clamp-2">
                                        {school.school_name}
                                    </h3>

                                    {/* Details: Program Name */}
                                    <p className="text-primary text-sm font-bold mb-4">{school.program_name}</p>

                                    {/* Location with Fixed SVG Icon */}
                                    <div className="text-sm text-secondary mb-6 flex items-start gap-1.5">
                                        <svg width="16" height="16" className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{school.city}, {school.state}</span>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Tuition Detail */}
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-xs font-semibold text-slate-400 uppercase">Tuition</span>
                                            {school.tuition_cost > 0 ? (
                                                <span className="text-sm font-medium text-slate-600">${school.tuition_cost?.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-xs italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Contact School</span>
                                            )}
                                        </div>

                                        {/* Salary Block */}
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mt-2">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Projected Salary</span>
                                                    {/* Trust Link */}
                                                    <a href={school.salary_source_url || '#'} target="_blank" className="text-[10px] text-blue-500 font-medium hover:text-blue-700 flex items-center gap-1 group/link">
                                                        Verify Gov Data
                                                    </a>
                                                </div>
                                                <span className="text-2xl font-black text-navy-900 tracking-tight">
                                                    ${school.projected_salary?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Button */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100">
                                    <a
                                        href={formatUrl(school.website) || '#'}
                                        target="_blank"
                                        className="block w-full text-center bg-navy-900 text-white font-bold py-3 rounded-xl text-sm hover:text-primary transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                                    >
                                        Visit School
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
