import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { getStateName } from '@/utils/states';
import { slugify } from '@/utils/slugify';
import { SEO_YEAR } from '@/utils/date';

type Props = {
    params: Promise<{ state: string }>;
};

// Reuse formatUrl helper
const formatUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://${url}`;
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
        // If no listings, but it's a valid state, we still show the page with an empty state
        // but if it's junk, maybe 404. Let's check if there are ANY programs.
        const { count } = await supabase
            .from('verified_roi_listings')
            .select('*', { count: 'exact', head: true })
            .ilike('state', stateUpper);

        if (count === 0 && stateName === stateUpper) {
            // likely not a valid state in our helper OR db
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
                            <div key={i} className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-full overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. 1st Year ROI</span>
                                    <span className="text-success-500 font-black text-lg">+${school.calculated_roi?.toLocaleString()}</span>
                                </div>
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
                                            {school.tuition_in_state > 0 ? (
                                                <span className="text-sm font-medium text-slate-600">${school.tuition_in_state.toLocaleString()}</span>
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

            {/* BROWSE CITIES SECTION */}
            {stateCities.length > 0 && (
                <section className="bg-white py-16 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-industrial-900 mb-8">Browse trade programs in {stateName} by City</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {stateCities.map((city: string) => (
                                <Link
                                    key={city}
                                    href={`/${state.toLowerCase()}/${slugify(city)}/welding`}
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
