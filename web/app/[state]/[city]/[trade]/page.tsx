import type { Metadata } from 'next';
import { SEO_YEAR } from '@/utils/date';
import { notFound } from 'next/navigation';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';

type Props = {
    params: Promise<{
        state: string;
        city: string;
        trade: string;
    }>;
};

// Dictionary mapping specific slugs to Database Categories
const categoryMap: Record<string, string> = {
    'welding-technology': 'Welding Technology',
    'hvac-r-technician': 'HVAC/R Technician',
    'electrician-power-systems': 'Electrician & Power Systems',
    'plumbing-pipefitting': 'Plumbing & Pipefitting',
    'automotive-service-tech': 'Automotive Service Tech',
    'diesel-heavy-equipment': 'Diesel & Heavy Equipment',
    'carpentry-construction': 'Carpentry & Construction',
    'cnc-machining-fabrication': 'CNC Machining & Fabrication',
    // Fallbacks for old slugs if they exist in legacy index
    'welding': 'Welding Technology',
    'hvac': 'HVAC/R Technician',
    'mechanic': 'Automotive Service Tech',
    'construction': 'Carpentry & Construction',
    'electrician': 'Electrician & Power Systems',
};

function formatTradeTitle(slug: string): string {
    const s = slug.toLowerCase();
    if (s === 'hvac') return 'HVAC';
    if (s === 'hvac-r-technician') return 'HVAC/R';
    return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { state, city, trade: tradeSlug } = await params;
    const cleanSlug = tradeSlug.toLowerCase();
    if (!categoryMap[cleanSlug]) return { title: 'Not Found' };

    const displayTrade = categoryMap[cleanSlug];
    const decodedCity = decodeURIComponent(city);
    const decodedState = decodeURIComponent(state).toUpperCase();
    const cityTitle = decodedCity.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const baseTitle = `Best ${displayTrade} Schools in ${cityTitle}, ${decodedState}`;
    const seoTitle = baseTitle.length > 50 ? baseTitle : `${baseTitle} | TradePath`;

    return {
        title: seoTitle,
        description: `Compare verified outcomes for ${displayTrade} programs in ${cityTitle}, ${decodedState}. Avg salary: $55k+. Govt Verified Data.`,
    };
}

export default async function Page({ params }: Props) {
    const { state, city, trade: tradeSlug } = await params;
    const cleanSlug = tradeSlug.toLowerCase();
    const mappedCategory = categoryMap[cleanSlug];
    const stateUpper = state.toUpperCase();

    if (!mappedCategory) notFound();

    const decodedCity = decodeURIComponent(city).replace(/-/g, ' ');
    const cityTitle = decodedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const displayTrade = mappedCategory;

    const supabase = createClient();

    // Step A: Fetch listings for specific City + State + Category
    const { data: cityListings } = await supabase
        .from('verified_roi_listings')
        .select('*')
        .ilike('state', stateUpper)
        .ilike('city', `%${decodedCity}%`)
        .eq('display_category', mappedCategory)
        .order('calculated_roi', { ascending: false });

    let listings = cityListings || [];
    let isFallback = false;

    // Step B (Fallback): If Step A returns 0 results, fetch State + Trade
    if (listings.length === 0) {
        const { data: stateListings } = await supabase
            .from('verified_roi_listings')
            .select('*')
            .ilike('state', stateUpper)
            .eq('display_category', mappedCategory)
            .order('calculated_roi', { ascending: false })
            .limit(10);

        if (stateListings && stateListings.length > 0) {
            listings = stateListings;
            isFallback = true;
        }
    }

    const hasListings = listings && listings.length > 0;

    return (
        <div className="min-h-screen bg-industrial-100">
            <section className="bg-industrial-900 text-white pt-24 pb-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
                    <div className="mb-4 text-sm font-medium text-slate-400">
                        <Link href="/" className="hover:text-white transition-colors">Search</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/${state.toLowerCase()}`} className="text-safety-500 hover:text-white transition-colors">{stateUpper}</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/${state.toLowerCase()}/${city}`} className="text-safety-500 hover:text-white transition-colors">{cityTitle}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-white">{displayTrade}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        Top Rated <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-500 to-yellow-200">{displayTrade}</span> Schools <br /> in {cityTitle}, {stateUpper}
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                        Verified government data on salaries, tuition, and ROI for {displayTrade} careers.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-24">
                {isFallback && (
                    <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow-lg p-6 mb-8 flex items-start gap-4 mx-auto max-w-3xl md:mx-0 transition-all animate-in fade-in slide-in-from-top-4">
                        <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                            <span className="text-amber-600 font-bold text-xl">ℹ️</span>
                        </div>
                        <div>
                            <h3 className="text-amber-900 font-bold text-lg mb-1">State-Wide Results</h3>
                            <p className="text-amber-800/80 text-sm leading-relaxed">
                                No verified {displayTrade} programs found in {cityTitle} specifically.
                                Showing the top verified programs across <strong>{stateUpper}</strong>.
                            </p>
                        </div>
                    </div>
                )}

                {!hasListings ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-industrial-900 mb-2">No programs found in {stateUpper}.</h3>
                        <p className="text-slate-500 mb-6">Our national database is still being updated. Check nearby states or try another search.</p>
                        <Link href="/" className="inline-block bg-safety-500 text-industrial-900 font-bold px-8 py-3 rounded-xl hover:bg-white border border-transparent hover:border-industrial-200 transition-all">
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((school: any, i: number) => (
                            <ListingCard key={i} school={school} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
