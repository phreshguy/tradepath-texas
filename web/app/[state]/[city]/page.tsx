import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { getStateName } from '@/utils/states';
import { slugify } from '@/utils/slugify';
import { SEO_YEAR } from '@/utils/date';
import ListingCard from '@/components/ListingCard';

type Props = {
    params: Promise<{
        state: string;
        city: string;
    }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { state, city } = await params;
    const stateName = getStateName(state);
    const stateUpper = state.toUpperCase();
    const cityTitle = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const baseTitle = `Best Trade Schools in ${cityTitle}, ${stateUpper} (${SEO_YEAR})`;
    const seoTitle = baseTitle.length > 50 ? baseTitle : `${baseTitle} | TradePath`;

    return {
        title: seoTitle,
        description: `Compare verified outcomes for trade programs in ${cityTitle}, ${stateName}. Find state-verified ROI metrics for nursing, HVAC, CDL, and more.`,
    };
}

export default async function CityPage({ params }: Props) {
    const { state: stateParam, city: cityParam } = await params;
    const stateUpper = stateParam.toUpperCase();
    const stateName = getStateName(stateParam);
    const decodedCity = decodeURIComponent(cityParam).replace(/-/g, ' ');
    const cityTitle = decodedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const supabase = createClient();

    // Step A: Fetch listings for specific City + State
    const { data: cityListings } = await supabase
        .from('verified_roi_listings')
        .select('*')
        .ilike('state', stateUpper)
        .ilike('city', `%${decodedCity}%`)
        .order('calculated_roi', { ascending: false });

    let listings = cityListings || [];
    let isFallback = false;

    // Step B: Fallback (State-wide) if city is empty
    if (listings.length === 0) {
        const { data: stateListings } = await supabase
            .from('verified_roi_listings')
            .select('*')
            .ilike('state', stateUpper)
            .order('calculated_roi', { ascending: false })
            .limit(10);

        if (stateListings && stateListings.length > 0) {
            listings = stateListings;
            isFallback = true;
        }
    }

    if (listings.length === 0 && !isFallback) {
        notFound();
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
                        <Link href={`/${stateParam.toLowerCase()}`} className="text-safety-500 hover:text-white transition-colors">{stateName}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-white">{cityTitle}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        Trade Schools in <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-500 to-yellow-200">{cityTitle}, {stateUpper}</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                        Compare verified local programs in {cityTitle} by starting salary and ROI.
                        Data sourced from federal and state educational databases.
                    </p>
                </div>
            </section>

            {/* LISTINGS GRID */}
            <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-24">
                {isFallback && (
                    <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow-lg p-6 mb-8 flex items-start gap-4 mx-auto max-w-3xl md:mx-0">
                        <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                            <span className="text-amber-600 font-bold text-xl">ℹ️</span>
                        </div>
                        <div>
                            <h3 className="text-amber-900 font-bold text-lg mb-1">City Hub Notice</h3>
                            <p className="text-amber-800/80 text-sm leading-relaxed">
                                No verified programs found in {cityTitle} specifically.
                                Showing the top verified programs across <strong>{stateName}</strong>.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((school: any, i: number) => (
                        <ListingCard key={i} school={school} />
                    ))}
                </div>
            </section>
        </div>
    );
}
