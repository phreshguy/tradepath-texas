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
        <main className="bg-industrial-100 min-h-screen">
            {/* HERO HEADER SECTION - IMMERSIVE NAVY */}
            <header className="bg-industrial-900 text-white relative overflow-hidden pb-32 pt-12 md:pb-48 md:pt-20">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    {/* Breadcrumb / Back Link */}
                    <Link href="/blog" className="text-safety-500 font-bold mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all hover:text-safety-600">
                        <span>&larr;</span> Back to Journal
                    </Link>

                    {/* Metadata Header */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                            <span className="uppercase tracking-widest text-safety-500">TradePath Editorial</span>
                            <span>•</span>
                            <time dateTime={post.published_at}>
                                {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
                                {post.excerpt}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT - OVERLAPPING CARD */}
            <div className="max-w-4xl mx-auto px-4 relative z-20 -mt-20 md:-mt-32 pb-24">
                <article className="bg-white rounded-2xl md:rounded-3xl shadow-2xl shadow-industrial-900/10 overflow-hidden border border-slate-100">

                    {/* Featured Image (Full Bleed) */}
                    {post.cover_image_url && (
                        <div className="relative w-full h-[300px] md:h-[500px]">
                            <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay for bottom blending */}
                            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent opacity-50"></div>
                        </div>
                    )}

                    {/* The Content */}
                    <div className="p-6 md:p-12 lg:p-16">
                        {/* Markdown Renderer with Pro Table Styling */}
                        <div className="prose prose-lg prose-slate max-w-none 
                            prose-headings:font-bold prose-headings:text-industrial-900 
                            prose-a:text-safety-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-industrial-900 prose-strong:font-black
                            prose-blockquote:border-l-4 prose-blockquote:border-safety-500 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                            
                            /* TABLE STYLING */
                            prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:block prose-table:overflow-x-auto md:prose-table:table
                            prose-thead:bg-industrial-50 prose-thead:text-industrial-900 prose-thead:border-b-2 prose-thead:border-industrial-100
                            prose-th:p-4 prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:font-black
                            prose-td:p-4 prose-td:text-sm prose-td:border-b prose-td:border-slate-100 prose-td:text-slate-600
                            prose-tr:even:bg-slate-50/50 hover:prose-tr:bg-blue-50/30 transition-colors
                            ">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {post.content_markdown}
                            </ReactMarkdown>
                        </div>

                        {/* Article Footer */}
                        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                                This article is for informational purposes.
                            </div>
                            <Link href="/blog" className="text-industrial-900 font-bold hover:text-safety-500 transition-colors">
                                Read More Articles &rarr;
                            </Link>
                        </div>
                    </div>
                </article>
            </div>
        </main>
    );
}
