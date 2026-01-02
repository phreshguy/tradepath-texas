import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import { slugify } from '@/utils/slugify';
import { STATE_MAP } from '@/utils/states';

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

  // Default Sort: ROI
  query = query.order('calculated_roi', { ascending: false }).limit(50);

  const { data: listings } = await query;

  // Dynamic Header Logic
  let headerTitle = "National ROI Database";
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
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-tight">
            Blue Collar is the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-500 via-orange-400 to-yellow-200">
              New Gold Collar
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-light px-4">
            Compare verified trade programs nationwide by real salary outcomes.
          </p>

          <div className="px-4">
            <SearchInput />
          </div>
        </div>
      </section>

      {/* DATA GRID */}
      <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-24">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-md flex items-center gap-2">
          <span className="bg-safety-500 w-2 h-8 rounded-full inline-block"></span>
          {headerTitle}
        </h2>
        <p className="text-xs text-slate-400 mb-8 ml-4">
          Showing top results nationally...
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
                <div className="bg-industrial-50/80 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. 1st Year ROI</span>
                  <span className="text-success-500 font-black text-xl tracking-tight">
                    +${school.calculated_roi?.toLocaleString()}
                  </span>
                </div>

                <div className="p-6 flex-grow">
                  <h3 className="text-lg font-bold text-industrial-900 mb-2 leading-tight line-clamp-2">
                    {school.school_name}
                  </h3>
                  <p className="text-safety-500 text-sm font-bold mb-4">{school.program_name}</p>

                  <div className="text-sm text-secondary mb-6 flex items-start gap-1.5">
                    <svg width="16" height="16" className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{school.city}, {school.state}</span>
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Tuition</span>
                      {school.tuition_in_state > 0 ? (
                        <span className="text-sm font-medium text-slate-600">${school.tuition_in_state?.toLocaleString()}</span>
                      ) : (
                        <span className="text-xs italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Contact School</span>
                      )}
                    </div>

                    <div className="bg-industrial-50 rounded-lg p-3 border border-slate-100 mt-2">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Projected Salary</span>
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

                <div className="p-4 bg-industrial-50 border-t border-slate-100">
                  <a
                    href={formatUrl(school.website) || '#'}
                    target="_blank"
                    className="block w-full text-center bg-industrial-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-safety-500 hover:text-industrial-900 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Visit School
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BROWSE BY STATE SECTION */}
      <section className="bg-industrial-50 py-16 border-t border-slate-200 mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-industrial-900 mb-8 text-center uppercase tracking-widest">Browse by State</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(STATE_MAP).map(([abbr, name]) => (
              <Link
                key={abbr}
                href={`/${abbr}`}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-safety-500 transition-all group text-center flex flex-col items-center justify-center min-h-[100px]"
              >
                <span className="text-slate-500 group-hover:text-industrial-900 font-bold">{name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity mt-1">{abbr}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
