import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 0; // Fresh data every load

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = createClient();
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
    if (!data) return {};
    return { title: `${data.title} | TradePath Texas` };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();

    if (!post) return notFound();

    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans">
            {/* NAV BAR SPACER (Since nav is fixed) */}
            <div className="h-16 bg-industrial-900"></div>

            {/* ARTICLE HEADER (Centered & Clean) */}
            <div className="max-w-3xl mx-auto px-6 py-12 text-center">
                <Link href="/blog" className="text-safety-500 font-bold text-xs uppercase tracking-widest hover:underline mb-4 block">
                    ← Back to Journal
                </Link>
                <h1 className="text-3xl md:text-5xl font-extrabold text-industrial-900 mb-6 leading-tight">
                    {post.title}
                </h1>
                <div className="text-slate-500 text-sm">
                    {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="mx-2">•</span>
                    <span>TradePath Editorial</span>
                </div>
            </div>

            {/* FEATURED IMAGE */}
            {post.cover_image_url && (
                <div className="max-w-4xl mx-auto px-4 mb-12">
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-lg"
                    />
                </div>
            )}

            {/* CONTENT BODY - THE PAPER LAYOUT */}
            <article className="max-w-3xl mx-auto px-6 pb-24">
                <div className="prose prose-lg prose-slate max-w-none
          prose-headings:text-industrial-900 prose-headings:font-bold
          prose-a:text-safety-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-industrial-800
          prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:block prose-table:overflow-x-auto md:prose-table:table
          prose-thead:bg-slate-50 prose-thead:text-industrial-900 prose-thead:border-b-2 prose-thead:border-slate-200
          prose-th:p-3 prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:font-black prose-th:bg-slate-50
          prose-td:p-3 prose-td:text-sm prose-td:border-b prose-td:border-slate-100 prose-td:text-slate-700
          prose-tr:even:bg-slate-50">

                    {/* The Engine: Turns Raw Markdown into HTML */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content_markdown}
                    </ReactMarkdown>

                </div>

                <hr className="my-12 border-slate-100" />
                <p className="text-center text-xs text-slate-400">
                    Data verified by TradePathUSA.com verified database. Content is for educational purposes.
                </p>
            </article>
        </main>
    );
}
