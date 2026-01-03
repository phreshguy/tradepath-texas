import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { SEO_YEAR } from '@/utils/date';
import { getStateName, STATE_MAP } from '@/utils/states';
import { slugify } from '@/utils/slugify';

type Props = {
    params: Promise<{ slug?: string[] }>;
};

const tradeData: Record<string, { title: string; keyword: string }> = {
    'welding': { title: 'Welding Technology', keyword: 'Welding' },
    'hvac': { title: 'HVAC/R Technician', keyword: 'HVAC' },
    'electrician': { title: 'Electrician & Power Systems', keyword: 'Electrician' },
    'plumbing': { title: 'Plumbing & Pipefitting', keyword: 'Plumbing' },
    'automotive': { title: 'Automotive Service Tech', keyword: 'Automotive' },
    'diesel': { title: 'Diesel & Heavy Equipment', keyword: 'Diesel' },
    'construction': { title: 'Carpentry & Construction', keyword: 'Construction' },
    'machining': { title: 'CNC Machining & Fabrication', keyword: 'CNC' },
    'mechanic': { title: 'Automotive Service Tech', keyword: 'Automotive' }, // User-requested mapping
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    if (!slug || slug.length === 0) return {};

    const s = slug[0].toLowerCase();

    // 1. Check if State Landing Page
    if (s.length === 2 && STATE_MAP[s]) {
        const stateName = getStateName(s);
        const stateUpper = s.toUpperCase();
        return {
            title: `Best Trade Schools in ${stateName} (${SEO_YEAR}) | TradePath`,
            description: `Compare verified outcomes for trade programs in ${stateName}. Find the highest ROI schools for welding, HVAC, plumbing, and more in ${stateUpper}.`,
        };
    }

    // 2. Check if Trade Hub Page
    const tradeInfo = tradeData[s];
    if (tradeInfo) {
        return {
            title: `Best ${tradeInfo.title} Schools in the USA: ${SEO_YEAR} Rankings | TradePath`,
            description: `National database of top-rated ${tradeInfo.title} programs. Compare ROI, starting salaries, and tuition across all 50 states.`,
        };
    }

    return { title: 'Not Found' };
}

export default async function CatchAllPage({ params }: Props) {
    const { slug } = await params;

    // Default: If no slug, this shouldn't normally be hit if app/page.tsx exists,
    // but we return notFound if it ever is.
    if (!slug || slug.length === 0) notFound();

    const s = slug[0].toLowerCase();
    const supabase = createClient();

    // --- LOGIC A: State Landing Page (/[state]) ---
    if (s.length === 2 && STATE_MAP[s]) {
        const stateUpper = s.toUpperCase();
        const stateName = getStateName(s);

        // Fetch top 50 in state
        const { data: listings } = await supabase
            .from('verified_roi_listings')
            .select('*')
            .ilike('state', stateUpper)
            .order('calculated_roi', { ascending: false })
            .limit(50);

        // Fetch distinct cities in this state for the browse section
        const { data: citiesData } = await supabase.rpc('get_seo_combinations');
        const stateCities = Array.from(new Set(
            (citiesData as any[] || [])
                .filter((item: any) => item.state.toLowerCase() === s)
                .map((item: any) => item.city as string)
        )).sort();

        return (
            <div className="min-h-screen bg-industrial-100 pb-24">
                <section className="bg-industrial-900 text-white pt-24 pb-32 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
                        <div className="mb-4 text-sm font-medium text-slate-400">
                            <Link href="/" className="hover:text-white transition-colors">National</Link>
                            <span className="mx-2">/</span>
                            <span className="text-safety-500">{stateName}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                            Top Trade Schools in <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-500 to-yellow-200">{stateName}</span>
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                            Comparing verified salary and tuition data for {stateName} programs. Sorted by Return on Investment.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
                    {!listings || listings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center max-w-2xl mx-auto">
                            <h3 className="text-xl font-bold text-industrial-900 mb-2">No verified programs found in {stateName} yet.</h3>
                            <Link href="/" className="inline-block bg-safety-500 text-industrial-900 font-bold px-8 py-3 rounded-xl hover:bg-white border border-transparent hover:border-industrial-200 transition-all mt-4">
                                Browse National Database
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

                {stateCities.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 mt-24 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-industrial-900 mb-8 uppercase tracking-widest">Browse by City</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {stateCities.map((city: string) => (
                                <Link key={city} href={`/${s}/${slugify(city)}`} className="bg-white hover:bg-safety-500 hover:text-industrial-900 text-industrial-700 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border border-slate-100">
                                    {city}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        );
    }

    // --- LOGIC B: Trade Hub Page (/[trade]) ---
    const tradeInfo = tradeData[s];
    if (tradeInfo) {
        const { data: listings } = await supabase
            .from('verified_roi_listings')
            .select('*')
            .ilike('program_name', `%${tradeInfo.keyword}%`)
            .order('calculated_roi', { ascending: false })
            .limit(200);

        if (!listings || listings.length === 0) notFound();

        const goldList = listings.slice(0, 10);
        const stateGroups = listings.reduce((acc: Record<string, any[]>, item) => {
            const state = item.state;
            if (!acc[state]) acc[state] = [];
            acc[state].push(item);
            return acc;
        }, {});
        const sortedStates = Object.keys(stateGroups).sort();

        return (
            <div className="min-h-screen bg-industrial-100 pb-24">
                <section className="bg-industrial-900 text-white pt-24 pb-32 px-4 relative overflow-hidden text-center">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    <div className="max-w-4xl mx-auto relative z-10">
                        <div className="inline-block bg-safety-500/10 text-safety-500 px-4 py-1 rounded-full text-xs font-black uppercase tracking-[2px] mb-6 border border-safety-500/20">
                            National Rankings {SEO_YEAR}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-500 to-yellow-200">{tradeInfo.title}</span> Schools <br /> in the USA
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            The definitive list of physical trade schools ranked by starting salary and local tuition costs.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
                    {/* National Top 10 Leaderboard */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-safety-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-safety-500/20">🏆</div>
                            <h2 className="text-2xl md:text-3xl font-black text-industrial-900 uppercase italic">National Leaderboard</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {goldList.map((school, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-industrial-900 text-safety-500 rounded-lg flex items-center justify-center font-black z-10 shadow-lg text-sm">#{i + 1}</div>
                                    <ListingCard school={school} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Browse by State (Results Only) */}
                    <div className="space-y-16">
                        <div className="border-b border-slate-200 pb-4">
                            <h2 className="text-2xl font-black text-industrial-900 uppercase tracking-widest">Browse by State</h2>
                        </div>
                        {sortedStates.map((stateAbbr) => (
                            <div key={stateAbbr} className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-industrial-800 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-1 bg-safety-500 rounded-full"></span>
                                    {getStateName(stateAbbr)}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {stateGroups[stateAbbr].map((school, i) => (
                                        <ListingCard key={i} school={school} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    notFound();
}
