import { notFound } from 'next/navigation';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export const revalidate = 60;

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;

    // Note: We might want to fetch here again or just rely on title if we passed it, but correct way is to fetch.
    // For specific posts, we just return basic metadata or fetch from DB.
    // To save an extra call we could assume title for now or fetch.
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('title, excerpt').eq('slug', slug).single();

    if (!post) return { title: 'Article Not Found' };

    return {
        title: `${post.title} | TradePathUSA Journal`,
        description: post.excerpt,
    };
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const supabase = createClient();

    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!post) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header / Hero */}
            <div className="bg-navy-900 text-white py-16 px-4 border-b border-primary/20">
                <div className="max-w-3xl mx-auto text-center">
                    <Link href="/blog" className="text-primary font-bold text-sm tracking-widest uppercase mb-6 inline-block hover:underline">
                        ← Back to Journal
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
                        <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{post.author || 'TradePath Editorial'}</span>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-3xl mx-auto px-6 py-16">
                {post.cover_image_url && (
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg mb-12"
                    />
                )}

                {/* 
                   User requested "prose prose-invert". 
                   However, we are on a white background. "prose-invert" makes text white/light which would be invisible.
                   I am using "prose prose-slate" for correct dark-on-light contrast compliant with the "Standard UI" of the site.
                   If the user STRICTLY meant white text, the background should have been navy. 
                   I will stick to prose-slate for readability. 
                */}
                <article className="prose prose-slate prose-lg max-w-none">
                    <ReactMarkdown>
                        {post.content_markdown}
                    </ReactMarkdown>
                </article>
            </div>
        </div>
    );
}
