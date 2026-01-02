import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import SearchInput from '@/components/SearchInput';
import ListingCard from '@/components/ListingCard';

export const dynamic = 'force-dynamic';

export default async function SearchPage(props: { searchParams: Promise<{ q?: string, trade?: string }> }) {
    // Handle the case where searchParams might be a promise or an object depending on Next.js version/config
    const params = await props.searchParams;
    const q = params.q;
    const selectedTrade = params.trade;

    const supabase = createClient();

    let query = supabase.from('verified_roi_listings').select('*');

    if (q) {
        query = query.or(`school_name.ilike.%${q}%,program_name.ilike.%${q}%,city.ilike.%${q}%`);
    }

    if (selectedTrade) {
        query = query.ilike('program_name', `%${selectedTrade}%`);
    }

    const { data } = await query.order('calculated_roi', { ascending: false }).limit(50);
    const listings = data || [];

    const displayQuery = q || selectedTrade || "All Programs";


    return (
        <div className="min-h-screen bg-industrial-100">
            <section className="bg-industrial-900 text-white pt-24 pb-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black mb-6">
                        Search Results: <span className="text-safety-500">"{displayQuery}"</span>
                    </h1>
                    <div className="max-w-2xl mx-auto">
                        <SearchInput />
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 pb-24">
                {listings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-industrial-900 mb-2">No results found for "{displayQuery}"</h3>
                        <p className="text-slate-500 mb-6">Try searching for a specific trade like "Welding" or a school name.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((school: any, i: number) => (
                            <ListingCard key={i} school={school} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
