import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { getStateName } from '@/utils/states';
import { slugify } from '@/utils/slugify';
import { SEO_YEAR } from '@/utils/date';
import ListingCard from '@/components/ListingCard';

type Props = {
    params: Promise<{ state: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { state } = await params;
    const stateName = getStateName(state);
    const stateUpper = state.toUpperCase();

    return {
        title: `Best Trade Schools in ${stateName} (${SEO_YEAR} Cost & Salary)`,
        description: `Compare verified outcomes for trade programs in ${stateName}. Find the highest ROI schools for welding, HVAC, plumbing, and more in ${stateUpper}.`,
    };
}

export default async function StatePage({ params }: Props) {
    const { state } = await params;
    const stateUpper = state.toUpperCase();
    const stateName = getStateName(state);
    const supabase = createClient();

    // Fetch top 50 in state
    const { data: listings } = await supabase
        .from('verified_roi_listings')
        .select('*')
        .ilike('state', stateUpper)
        .order('calculated_roi', { ascending: false })
        .limit(50);

    // Fetch distinct cities in this state for the browse section
    const { data: citiesData } = await supabase
        .rpc('get_seo_combinations');

    const stateCities = Array.from(new Set(
        (citiesData as any[] || [])
            .filter((item: any) => item.state.toLowerCase() === state.toLowerCase())
            .map((item: any) => item.city as string)
    )).sort();

    if (!listings || listings.length === 0) {
        const { count } = await supabase
            .from('verified_roi_listings')
            .select('*', { count: 'exact', head: true })
            .ilike('state', stateUpper);

        if (count === 0 && stateName === stateUpper) {
            notFound();
        }
    }

    return (
        <div className="min-h-screen bg-industrial-100">
            {/* HERO SECTION */}
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

            {/* LISTINGS GRID */}
            <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-24">
                {(!listings || listings.length === 0) ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-industrial-900 mb-2">No verified programs found in {stateName} yet.</h3>
                        <p className="text-slate-500 mb-6">Our national data ingestion is still active. Check back soon for updated ROI listings.</p>
                        <Link href="/" className="inline-block bg-safety-500 text-industrial-900 font-bold px-8 py-3 rounded-xl hover:bg-white border border-transparent hover:border-industrial-200 transition-all">
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

            {/* BROWSE CITIES SECTION */}
            {stateCities.length > 0 && (
                <section className="bg-white py-16 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-industrial-900 mb-8">Browse trade programs in {stateName} by City</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {stateCities.map((city: string) => (
                                <Link
                                    key={city}
                                    href={`/${state.toLowerCase()}/${slugify(city)}`}
                                    className="bg-industrial-100 hover:bg-safety-500 hover:text-industrial-900 text-industrial-700 px-4 py-2 rounded-full text-sm font-medium transition-all"
                                >
                                    {city}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
