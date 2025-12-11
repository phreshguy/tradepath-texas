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
            {/* NAV OVERRIDE (For Visual Consistency) */}
            <div className="bg-industrial-900 h-24 absolute top-0 left-0 w-full z-0"></div>

            <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
                {/* Back Link */}
                <Link href="/blog" className="text-safety-500 font-bold mb-6 inline-block hover:underline">
                    &larr; Back to Journal
                </Link>

                {/* Main Content Card - WHITE BOX FORCE */}
                <article className="bg-white rounded-2xl shadow-xl overflow-hidden">

                    {/* Image */}
                    {post.cover_image_url && (
                        <img src={post.cover_image_url} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
                    )}

                    {/* Text Container */}
                    <div className="p-8 md:p-12">
                        <h1 className="text-3xl md:text-5xl font-black text-industrial-900 mb-4">{post.title}</h1>
                        <p className="text-gray-500 text-sm mb-8 border-b pb-8">
                            Published: {new Date(post.published_at).toLocaleDateString()}
                        </p>

                        {/* THE RENDERER - Force Standard Styling */}
                        <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-industrial-900 prose-a:text-safety-600">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {post.content_markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </article>
            </div>
        </main>
    );
}
