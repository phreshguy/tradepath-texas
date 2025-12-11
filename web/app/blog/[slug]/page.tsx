import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const supabase = createClient();
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).single();
    if (!data) return {};
    return {
        title: `${data.title} | TradePath Texas`,
        description: data.excerpt
    };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).single();

    if (!post) return notFound();

    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans">
            {/* NAV SPACER to clear fixed header */}
            <div className="h-16 bg-industrial-900"></div>

            {/* ARTICLE CONTAINER */}
            <article className="max-w-3xl mx-auto px-6 py-16">

                {/* BREADCRUMB */}
                <div className="mb-8">
                    <Link href="/blog" className="text-safety-600 font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
                        <span>←</span> Back to Journal
                    </Link>
                </div>

                {/* TITLE BLOCK */}
                <h1 className="text-3xl md:text-5xl font-black text-industrial-900 mb-6 leading-tight">
                    {post.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-10 pb-10 border-b border-slate-100">
                    <span className="bg-industrial-100 text-industrial-800 px-2 py-1 rounded font-medium">Verified Data</span>
                    <span>{new Date(post.published_at).toLocaleDateString()}</span>
                    <span>By TradePath Editorial</span>
                </div>

                {/* HERO IMAGE */}
                {post.cover_image_url && (
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-auto rounded-xl mb-12 shadow-sm border border-slate-100"
                    />
                )}

                {/* THE CONTENT RENDERER (Clean Typography) */}
                <div className="prose prose-lg prose-slate max-w-none 
            prose-headings:text-industrial-900 prose-headings:font-bold
            prose-a:text-blue-600 hover:prose-a:underline
            prose-th:p-4 prose-th:bg-slate-50 prose-td:p-4
            prose-table:border prose-table:border-slate-200">

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content_markdown}
                    </ReactMarkdown>
                </div>

                {/* BOTTOM CTA */}
                <div className="mt-20 p-8 bg-industrial-900 text-white rounded-2xl text-center">
                    <h3 className="text-2xl font-bold mb-3">Don't guess with your future.</h3>
                    <p className="text-slate-400 mb-6">See verified trade programs and real salaries.</p>
                    <Link href="/" className="inline-block bg-safety-500 text-industrial-900 font-bold py-3 px-8 rounded hover:bg-white transition">
                        Search Schools
                    </Link>
                </div>

            </article>
        </main>
    );
}
