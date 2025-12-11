import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = createClient();
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
    if (!data) return {};
    return { title: data.title };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();

    if (!post) return notFound();

    return (
        <main className="bg-slate-50 min-h-screen">
            {/* 1. SIMPLIFIED HEADER (No Overlap) */}
            <header className="bg-industrial-900 text-white py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Breadcrumb */}
                    <Link href="/blog" className="text-safety-500 font-bold mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all hover:text-safety-600">
                        <span>&larr;</span> Back to Journal
                    </Link>

                    {/* Metadata */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                            <span className="uppercase tracking-widest text-safety-500">TradePath Editorial</span>
                            <span>•</span>
                            <time dateTime={post.published_at}>
                                {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                        </div>

                        {/* SEO: H1 Typography Hierarchy */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-xl text-slate-300 max-w-2xl leading-relaxed font-light">
                                {post.excerpt}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. MAIN CONTENT (Very Light Background, High Contrast) */}
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">

                {/* Featured Image - Clean Block */}
                {post.cover_image_url && (
                    <div className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                        <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-auto max-h-[600px] object-cover"
                        />
                    </div>
                )}

                {/* 3. CONTENT TYPOGRAPHY (SEO Optimized) */}
                <article className="prose prose-xl prose-slate max-w-none 
                    /* Text Colors & Contrast */
                    prose-p:text-slate-800 prose-p:leading-8 prose-p:font-normal
                    prose-headings:text-industrial-900 prose-headings:font-bold prose-headings:tracking-tight
                    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-4
                    prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                    prose-strong:text-industrial-900 prose-strong:font-black
                    prose-a:text-safety-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                    prose-li:text-slate-800 prose-li:my-2
                    
                    /* Blockquotes */
                    prose-blockquote:border-l-4 prose-blockquote:border-safety-500 prose-blockquote:bg-white prose-blockquote:shadow-sm prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700
                    
                    /* Tables (Responsive & Pro) */
                    prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:block prose-table:overflow-x-auto md:prose-table:table
                    prose-thead:bg-slate-100 prose-thead:text-industrial-900 prose-thead:border-b-2 prose-thead:border-slate-200
                    prose-th:p-4 prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:font-black prose-th:whitespace-nowrap
                    prose-td:p-4 prose-td:text-base prose-td:border-b prose-td:border-slate-100 prose-td:text-slate-700
                    prose-tr:even:bg-slate-50
                ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content_markdown}
                    </ReactMarkdown>
                </article>

                {/* Footer / Disclaimer */}
                <div className="mt-20 pt-8 border-t border-slate-200">
                    <p className="text-slate-500 text-sm italic">
                        Data verified by TradePathUSA. Content is for educational purposes.
                    </p>
                </div>
            </div>
        </main>
    );
}
