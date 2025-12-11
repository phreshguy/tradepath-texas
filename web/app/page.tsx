import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';

export const dynamic = 'force-dynamic';

const formatUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://${url}`;
};

export default async function Home(props: { searchParams: Promise<{ trade?: string, city?: string }> }) {
  const searchParams = await props.searchParams;
  const trade = searchParams?.trade;
  const city = searchParams?.city;
  const supabase = createClient();

  let query = supabase.from('verified_roi_listings').select('*');

  // Trade Filter
  if (trade && trade !== 'All Trades') {
    query = query.ilike('program_name', `%${trade}%`);
  }

  // City Filter (Fuzzy / Case Insensitive)
  if (city) {
    query = query.ilike('city', `%${city}%`);
  }

  // Default Sort if not searching, otherwise sort by closest match
  // (We'll keep ROI sort as default for meaningful lists)
  query = query.order('calculated_roi', { ascending: false }).limit(50);

  const { data: listings } = await query;

  // Dynamic Header Logic
  let headerTitle = "Top Rated Programs";
  if (trade && city) {
    headerTitle = `Showing ${trade}s in ${city}`;
  } else if (trade) {
    headerTitle = `Top Rated ${trade}s`;
  } else if (city) {
    headerTitle = `Top Programs in ${city}`;
  }

  return (
    <div>
      {/* HERO SECTION */}
      <section className="bg-industrial-900 text-white pt-24 pb-32 px-4 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Blue Collar is the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-500 via-orange-400 to-yellow-200">
              New Gold Collar
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Compare 90+ Texas verified trade programs by real salary outcomes.
          </p>

          {/* Visual Search Bar */}
          <SearchInput />
        </div>
      </section>

      {/* DATA GRID */}
      <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-24">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-md flex items-center gap-2">
          <span className="bg-safety-500 w-2 h-8 rounded-full inline-block"></span>
          {headerTitle}
        </h2>
        <p className="text-xs text-slate-400 mb-8 ml-4">
          Showing verified programs in {city || 'Texas'}...
        </p>

        {(!listings || listings.length === 0) ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
            <p className="text-slate-500 text-lg">
              No results found for these filters. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((school: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col h-full overflow-hidden group hover:shadow-2xl hover:border-safety-500/30 transition-all duration-300">

                {/* Card Top: ROI Badge */}
                <div className="bg-industrial-50/80 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. 1st Year ROI</span>
                  <span className="text-success-500 font-black text-xl tracking-tight">
                    +${school.calculated_roi?.toLocaleString()}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-grow">
                  {/* School Name */}
                  <h3 className="text-lg font-bold text-industrial-900 mb-2 leading-tight line-clamp-2">
                    {school.school_name}
                  </h3>

                  {/* Details: Program Name */}
                  <p className="text-safety-500 text-sm font-bold mb-4">{school.program_name}</p>

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
                    <div className="bg-industrial-50 rounded-lg p-3 border border-slate-100 mt-2">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Projected Salary</span>
                          {/* Trust Link */}
                          <a href={school.salary_source_url || '#'} target="_blank" className="text-[10px] text-blue-500 font-medium hover:text-blue-700 flex items-center gap-1 group/link">
                            Verify Gov Data
                          </a>
                        </div>
                        <span className="text-2xl font-black text-industrial-900 tracking-tight">
                          ${school.projected_salary?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Button */}
                <div className="p-4 bg-industrial-50 border-t border-slate-100">
                  <a
                    href={formatUrl(school.website) || '#'}
                    target="_blank"
                    className="block w-full text-center bg-industrial-900 text-white font-bold py-3 rounded-xl text-sm hover:text-safety-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Visit School
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BROWSE BY CITY SECTION */}
      <section className="bg-industrial-50 py-16 border-t border-slate-200 mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-industrial-900 mb-8 text-center">Browse Texas Trade Programs by City</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {['Houston', 'Dallas', 'San Antonio', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Laredo', 'Midland'].map((city) => (
              <div key={city} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-lg text-industrial-900 mb-4 border-b border-slate-100 pb-2">{city}</h3>
                <div className="flex flex-col gap-2">
                  {['Welding', 'HVAC', 'Electrician', 'Plumbing', 'Mechanic'].map((trade) => (
                    <Link
                      key={trade}
                      href={`/local/${city.toLowerCase().replace(' ', '%20')}/${trade.toLowerCase().replace(' ', '-')}`}
                      className="text-slate-500 hover:text-safety-500 text-sm font-medium transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-safety-500 transition-colors"></span>
                      {city} {trade} Schools
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
