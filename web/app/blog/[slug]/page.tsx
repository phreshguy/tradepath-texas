import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';

export const revalidate = 3600; // Cache for 1 hour

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = createClient();
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
    if (!data) return {};
    return {
        title: `${data.title} | TradePath Texas`,
        description: data.excerpt,
        openGraph: { images: [data.cover_image_url || '/og-image.png'] }
    };
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();

    if (!post) return notFound();

    // Schema.org for Google
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        image: post.cover_image_url,
        datePublished: post.published_at,
        author: { '@type': 'Organization', name: 'TradePath Editorial' }
    };

    return (
        <main className="bg-white min-h-screen">
            {/* HEADER (Navy Brand) */}
            <header className="bg-industrial-900 pt-24 pb-12 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <Link href="/blog" className="text-safety-500 font-bold text-xs uppercase tracking-widest hover:text-white mb-6 block transition">
                        ← Back to Insights
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                        {post.title}
                    </h1>
                    <div className="flex justify-center items-center gap-3 text-slate-400 text-sm">
                        <span className="bg-white/10 px-2 py-1 rounded text-white font-medium">Verified Data</span>
                        <span>•</span>
                        <time>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                    </div>
                </div>
            </header>

            {/* ARTICLE BODY (White Paper Clean) */}
            <article className="max-w-3xl mx-auto px-6 -mt-8 relative z-10 pb-20">

                {/* Featured Image */}
                {post.cover_image_url && (
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full aspect-video object-cover rounded-xl shadow-xl border-4 border-white mb-12 bg-gray-100"
                    />
                )}

                {/* CONTENT ENGINE */}
                <div className="prose prose-lg prose-slate max-w-none 
            prose-headings:font-bold prose-headings:text-industrial-900 
            prose-p:leading-relaxed prose-li:marker:text-safety-500
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-th:bg-industrial-50 prose-th:text-industrial-900 prose-th:p-4
            prose-td:border-b prose-td:border-gray-100 prose-td:p-4
            first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:text-safety-500">

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content_markdown}
                    </ReactMarkdown>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-12 pt-8 border-t border-gray-100 text-xs text-gray-400 italic">
                    Source references: TradePath Internal Database, BLS.gov OEWS 2024, Dept of Education.
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                </div>
            </article>
        </main>
    );
}
