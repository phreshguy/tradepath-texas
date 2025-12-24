import type { Metadata } from 'next';
import { SEO_YEAR } from '@/utils/date';
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

// Dictionary mapping specific slugs to Database Categories
const categoryMap: Record<string, string> = {
    // Mechanic Family
    'mechanic': 'Mechanic/Repair Tech',
    'hvac': 'Mechanic/Repair Tech',
    'auto-body': 'Mechanic/Repair Tech',

    // Construction Family
    'construction': 'Construction Trade',
    'electrician': 'Construction Trade',
    'plumbing': 'Construction Trade',

    // Production Family
    'precision': 'Precision Production',
    'welding': 'Precision Production',
    'machinist': 'Precision Production',
};

// Helper to format the slug for display (e.g. "hvac" -> "HVAC", "welding" -> "Welding")
function formatTradeTitle(slug: string): string {
    const s = slug.toLowerCase();
    if (s === 'hvac') return 'HVAC';
    if (s === 'hvacr') return 'HVAC-R';
    return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city, trade: tradeSlug } = await params;

    // Validate trade exists in our map, even if we use the specific slug for the title
    if (!categoryMap[tradeSlug.toLowerCase()]) return { title: 'Not Found' };

    const displayTrade = formatTradeTitle(decodeURIComponent(tradeSlug));
    const decodedCity = decodeURIComponent(city);

    // Format city for display (Capitalize first letters)
    const cityTitle = decodedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const baseTitle = `${cityTitle} ${displayTrade} Schools: ${SEO_YEAR} Cost & Salary`;
    const seoTitle = baseTitle.length > 50 ? baseTitle : `${baseTitle} | TradePath`;

    return {
        title: seoTitle,
        description: `Compare verified outcomes for ${displayTrade} programs in ${cityTitle}. Avg salary: $55k+. Govt Verified Data.`,
    };
}

export default async function Page({ params }: Props) {
    const { city, trade: tradeSlug } = await params;
    const cleanSlug = tradeSlug.toLowerCase();
    const mappedCategory = categoryMap[cleanSlug];

    // If slug isn't in our valid list, 404
    if (!mappedCategory) {
        notFound();
    }

    const decodedCity = decodeURIComponent(city);
    const cityTitle = decodedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const displayTrade = formatTradeTitle(decodeURIComponent(tradeSlug));

    const supabase = createClient();

    console.log('Searching for:', { city: decodedCity, slug: cleanSlug, category: mappedCategory });

    // STRATEGY: 
    // 1. Try to find specific keyword match first (e.g. "HVAC").
    // 2. If no specific results, fallback to the broad category (e.g. "Mechanic").

    // Step 1: Specific Query (e.g. Category="Mechanic" AND ProgramName ILIKE "%hvac%")
    let query = supabase
        .from('verified_roi_listings')
        .select('*')
        .ilike('city', `%${decodedCity}%`)
        .ilike('program_name', mappedCategory ? `%${mappedCategory}%` : '') // Ensure we stay in the category family
        .order('calculated_roi', { ascending: false });

    // Add specific keyword filter if the slug is NOT the category base name
    // (e.g. if slug is 'hvac', add filter. If slug is 'mechanic', don't add filter as mappedCategory handles it)
    const isSpecificSearch = cleanSlug !== 'mechanic' && cleanSlug !== 'construction' && cleanSlug !== 'precision';

    if (isSpecificSearch) {
        query = query.ilike('program_name', `%${cleanSlug}%`);
    }

    const { data: specificListings } = await query;
    let listings = specificListings || [];
    let isFallback = false;

    // Step 2: Fallback (Broad Category)
    // If specific search yielded 0 results, query just the category
    if (listings.length === 0 && isSpecificSearch) {
        console.log('Specific search empty, falling back to broad category');
        const { data: broadListings } = await supabase
            .from('verified_roi_listings')
            .select('*')
            .ilike('city', `%${decodedCity}%`)
            .ilike('program_name', mappedCategory ? `%${mappedCategory}%` : '')
            .order('calculated_roi', { ascending: false });

        if (broadListings && broadListings.length > 0) {
            listings = broadListings;
            isFallback = true;
        }
    }

    const hasListings = listings && listings.length > 0;

    return (
        <div className="min-h-screen bg-industrial-100">
            {/* HERO HEADER SECTION (Matches Homepage) */}
            <section className="bg-industrial-900 text-white pt-24 pb-32 px-4 relative overflow-hidden">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
                    {/* BREADCRUMB */}
                    <div className="mb-4 text-sm font-medium text-slate-400">
                        <Link href="/" className="hover:text-white transition-colors">Search</Link>
                        <span className="mx-2">/</span>
                        <span className="text-safety-500">{cityTitle}</span>
                        <span className="mx-2">/</span>
                        <span className="text-white">{displayTrade}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        Top Rated <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-500 to-yellow-200">{displayTrade}</span> Schools <br /> in {cityTitle}, TX
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                        Verified government data on salaries, tuition, and ROI for {displayTrade} careers in the {cityTitle} area.
                    </p>
                </div>
            </section>

            {/* CONTENT GRID CONTAINER */}
            <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-24">

                {/* Fallback Notice */}
                {isFallback && (
                    <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow-lg p-6 mb-8 flex items-start gap-4 mx-auto max-w-3xl md:mx-0">
                        <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                            <span className="text-amber-600 font-bold text-xl">ℹ️</span>
                        </div>
                        <div>
                            <h3 className="text-amber-900 font-bold text-lg mb-1">Widen Search Active</h3>
                            <p className="text-amber-800/80 text-sm leading-relaxed">
                                We couldn't find specific "{displayTrade}" programs in {cityTitle} right now.
                                Showing top rated <strong>{mappedCategory}</strong> schools in the area instead.
                            </p>
                        </div>
                    </div>
                )}

                {!hasListings && !isFallback ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-industrial-900 mb-2">No programs found in {cityTitle} specifically.</h3>
                        <p className="text-slate-500 mb-6">These programs might be just outside the city limits or in verifying status.</p>
                        <Link href="/" className="inline-block bg-safety-500 text-industrial-900 font-bold px-8 py-3 rounded-xl hover:bg-white border border-transparent hover:border-industrial-200 transition-all">
                            Search Nearby Cities
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((school: any, i: number) => (
                            /* Card Start */
                            <div key={i} className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-full overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                {/* Card Header */}
                                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. 1st Year ROI</span>
                                    <span className="text-success-500 font-black text-lg">+${school.calculated_roi?.toLocaleString()}</span>
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
                                            {school.tuition_cost > 0 ? (
                                                <span className="text-sm font-medium text-slate-600">${school.tuition_cost.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-xs italic text-slate-400">Contact for Pricing</span>
                                            )}
                                        </div>
                                        <div className="border-t border-dashed border-slate-200"></div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Proj. Salary</span>
                                                <a href={school.salary_source_url} target="_blank" className="text-[10px] text-blue-500 underline hover:text-blue-700">Verify Data</a>
                                            </div>
                                            <span className="text-2xl font-black text-industrial-900">${school.projected_salary?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Button */}
                                <div className="p-4 bg-slate-50/50">
                                    <a href={formatUrl(school.website) || '#'} target="_blank" className="block w-full text-center bg-industrial-900 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-safety-500 hover:text-industrial-900 transition-all shadow-sm hover:shadow-md">
                                        Visit School
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
