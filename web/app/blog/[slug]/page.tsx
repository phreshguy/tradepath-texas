import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 60; // ISR for SEO

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
    if (!post) return {};

    return {
        title: `${post.title} | TradePath Texas`,
        description: post.excerpt || post.content_markdown.substring(0, 150),
        openGraph: { images: post.cover_image_url ? [post.cover_image_url] : [] }
    };
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();

    if (!post) return notFound();

    return (
        <article className="min-h-screen bg-white">
            {/* HEADER */}
            <div className="bg-industrial-900 text-white py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <Link href="/blog" className="text-safety-500 font-bold text-sm hover:underline mb-4 block">← BACK TO JOURNAL</Link>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">{post.title}</h1>
                    <div className="text-slate-400 text-sm flex justify-center gap-4">
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>TradePath Verified Data</span>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-3xl mx-auto px-6 py-12">

                {/* Main Image */}
                {post.cover_image_url && (
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-auto rounded-xl shadow-lg mb-12" />
                )}

                {/* MARKDOWN RENDERER */}
                <div className="prose prose-lg prose-slate max-w-none 
            prose-headings:font-bold prose-headings:text-industrial-900 
            prose-a:text-safety-600 prose-a:no-underline hover:prose-a:underline
            prose-table:border prose-table:text-sm prose-th:bg-slate-100 prose-th:p-4 prose-td:p-4">

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content_markdown}
                    </ReactMarkdown>

                </div>

                {/* NEWSLETTER CTA */}
                <div className="mt-20 p-8 bg-industrial-100 rounded-2xl text-center border border-industrial-200">
                    <h3 className="text-2xl font-bold text-industrial-900 mb-2">Want these jobs?</h3>
                    <p className="text-slate-600 mb-6">Get verified trade school lists and scholarship info sent to your inbox.</p>
                    <a href="#newsletter" className="inline-block bg-safety-500 hover:bg-safety-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition transform hover:scale-105">
                        Join Newsletter
                    </a>
                </div>

            </div>
        </article>
    );
}
