import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { SEO_YEAR } from '@/utils/date';
import { getStateName } from '@/utils/states';

type Props = {
    params: Promise<{ trade: string }>;
};

// Dictionary mapping slugs to display names and search keywords
const tradeData: Record<string, { title: string; keyword: string }> = {
    'welding': { title: 'Welding Technology', keyword: 'Welding' },
    'hvac': { title: 'HVAC/R Technician', keyword: 'HVAC' },
    'electrician': { title: 'Electrician & Power Systems', keyword: 'Electrician' },
    'plumbing': { title: 'Plumbing & Pipefitting', keyword: 'Plumbing' },
    'automotive': { title: 'Automotive Service Tech', keyword: 'Automotive' },
    'diesel': { title: 'Diesel & Heavy Equipment', keyword: 'Diesel' },
    'construction': { title: 'Carpentry & Construction', keyword: 'Construction' },
    'machining': { title: 'CNC Machining & Fabrication', keyword: 'CNC' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { trade } = await params;
    const tradeInfo = tradeData[trade.toLowerCase()];
    if (!tradeInfo) return { title: 'Not Found' };

    return {
        title: `Best ${tradeInfo.title} Schools in the USA: ${SEO_YEAR} Rankings`,
        description: `National database of top-rated ${tradeInfo.title} programs. Compare ROI, starting salaries, and tuition across all 50 states.`,
    };
}

export default async function TradeHubPage({ params }: Props) {
    const { trade } = await params;
    const tradeInfo = tradeData[trade.toLowerCase()];
    if (!tradeInfo) notFound();

    const supabase = createClient();

    // Fetch up to 200 listings nationally matching the trade
    const { data: listingsData } = await supabase
        .from('verified_roi_listings')
        .select('*')
        .ilike('program_name', `%${tradeInfo.keyword}%`)
        .order('calculated_roi', { ascending: false })
        .limit(200);

    let listings = listingsData || [];
    let isValueOnly = false;

    // --- FALLBACK (Strict matching didn't work or view is empty) ---
    if (listings.length === 0) {
        // Attempt to fetch from programs table directly to avoid 404
        const { data: fallbackData } = await supabase
            .from('programs')
            .select('program_name, tuition_cost, school_id, schools(name, city, state, zip, website)')
            .ilike('program_name', `%${tradeInfo.keyword}%`)
            .limit(100);

        if (fallbackData && fallbackData.length > 0) {
            listings = fallbackData.map((p: any) => ({
                school_name: p.schools.name,
                city: p.schools.city,
                state: p.schools.state,
                program_name: p.program_name,
                tuition_cost: p.tuition_cost,
                projected_salary: 0,
                calculated_roi: -(p.tuition_cost || 0),
                website: p.schools.website
            }));
            isValueOnly = true;
        }
    }

    if (listings.length === 0) {
        notFound();
    }

    // Section A: The Gold List (Top 10 National)
    const goldList = listings.slice(0, 10);

    // Section B: State Index (Grouping by State)
    const stateGroups = listings.reduce((acc: Record<string, any[]>, item) => {
        const state = item.state;
        if (!acc[state]) acc[state] = [];
        acc[state].push(item);
        return acc;
    }, {});

    const sortedStates = Object.keys(stateGroups).sort();

    return (
        <div className="min-h-screen bg-industrial-100 pb-24">
            {/* HERO SECTION */}
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
                        Data sourced from verified government employment metrics.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">

                {/* FALLBACK NOTICE */}
                {isValueOnly && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl mb-12 shadow-sm flex gap-4 items-start">
                        <div className="text-2xl text-amber-500">⚠️</div>
                        <div>
                            <h3 className="font-bold text-amber-900 mb-1">Cost Data Only</h3>
                            <p className="text-amber-800 text-sm opacity-90 leading-relaxed">
                                We are currently updating our national wage database for {tradeInfo.title} programs.
                                Listings below are sorted by **Tuition Cost** only while we verify 2024 starting salaries.
                            </p>
                        </div>
                    </div>
                )}

                {/* SECTION A: THE GOLD LIST */}
                {!isValueOnly && (
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-safety-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-safety-500/20">🏆</div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-industrial-900 uppercase italic">The Gold List</h2>
                                <p className="text-slate-500 text-sm">Top 10 High-ROI Programs Nationwide</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {goldList.map((school, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-industrial-900 text-safety-500 rounded-lg flex items-center justify-center font-black z-10 shadow-lg text-sm">
                                        #{i + 1}
                                    </div>
                                    <ListingCard school={school} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SECTION B: STATE INDEX */}
                <div className="space-y-16">
                    <div className="border-b border-slate-200 pb-4">
                        <h2 className="text-2xl font-black text-industrial-900 uppercase tracking-widest">Browse by State</h2>
                    </div>

                    {sortedStates.map((stateAbbr) => (
                        <div key={stateAbbr} id={stateAbbr} className="scroll-mt-24">
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
