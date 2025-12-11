import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = createClient();
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
    return { title: data ? `${data.title} | TradePath` : 'Blog Post' };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();

    if (!post) return notFound();

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            {/* NAV SPACER */}
            <div className="h-16 bg-industrial-900"></div>

            {/* HEADER */}
            <header className="py-16 px-4 bg-slate-50 border-b border-slate-200">
                <div className="max-w-3xl mx-auto text-center">
                    <Link href="/blog" className="text-safety-600 font-bold text-xs uppercase tracking-widest hover:underline mb-4 block">
                        ← Back to Journal
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black text-industrial-900 mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <p className="text-slate-500">
                        Published: {new Date(post.published_at).toLocaleDateString()}
                    </p>
                </div>
            </header>

            {/* MAIN CONTENT - WHITE BACKGROUND */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                {post.cover_image_url && (
                    <img
                        src={post.cover_image_url}
                        alt="Cover"
                        className="w-full h-auto rounded-xl shadow-md mb-12 bg-gray-100"
                    />
                )}

                {/* PROSE CONTAINER */}
                <article className="prose prose-lg prose-slate max-w-none 
            prose-headings:text-industrial-900 prose-headings:font-bold
            prose-p:text-slate-700 prose-li:text-slate-700
            prose-a:text-blue-600 hover:prose-a:text-blue-800
            prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:block prose-table:overflow-x-auto md:prose-table:table
            prose-table:border prose-table:border-slate-200 
            prose-th:bg-slate-100 prose-th:p-4 prose-td:p-4">

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content_markdown}
                    </ReactMarkdown>

                </article>
            </main>

            {/* FOOTER CTA */}
            <div className="bg-industrial-900 text-white py-12 text-center mt-20">
                <h3 className="text-2xl font-bold mb-4">Join the TradePath Newsletter</h3>
                <p className="text-slate-400 mb-6">Get verified trade job alerts sent to your inbox.</p>
                <a href="#newsletter" className="bg-safety-500 text-black font-bold py-3 px-8 rounded hover:bg-white transition">
                    Subscribe Free
                </a>
            </div>
        </div>
    );
}
