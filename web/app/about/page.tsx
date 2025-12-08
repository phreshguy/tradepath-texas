import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-3xl mx-auto py-16 px-6">
                <h1 className="text-3xl font-bold text-navy-900 mb-8">About TradePath</h1>
                <div className="prose prose-slate max-w-none text-slate-600">
                    <p className="text-xl font-light text-slate-500 mb-8 leading-relaxed">
                        We believe the 4-year degree isn't the only path. We built a tool to show the real ROI of skilled trades in Texas.
                    </p>

                    <p className="mb-4">
                        TradePath was founded with a simple mission: to bring transparency to the trade school market. For too long, students have been pushed towards expensive university degrees without knowing the lucrative, stable, and essential career paths available in the skilled trades.
                    </p>

                    <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">Our Data</h2>
                    <p className="mb-4">
                        We don't guess. All our data is sourced directly from verifying government bodies to ensure you get the most accurate picture of your potential future.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-8">
                        <li>
                            <strong>College Scorecard (U.S. Department of Education):</strong> Used for verify school existence, location, and tuition costs.
                        </li>
                        <li>
                            <strong>Bureau of Labor Statistics (OEWS):</strong> Used to calculate median annual salaries for specific trade occupations in Texas.
                        </li>
                    </ul>

                    <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">Our Mission</h2>
                    <p className="mb-4">
                        To empower the next generation of Texas workforce with the data they need to make smart financial decisions about their education.
                    </p>

                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <Link href="/contact" className="text-primary font-bold hover:underline">
                            Get in touch with us &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
