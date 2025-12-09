import Link from 'next/link';
import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

export const revalidate = 60; // Revalidate every minute

export default async function BlogIndex() {
    const supabase = createClient();
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('title, slug, excerpt, published_at, cover_image_url')
        .order('published_at', { ascending: false });

    return (
        <div className="bg-slate-50 min-h-screen py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-navy-900 mb-4 text-center">TradePath Journal</h1>
                <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
                    Insights, career guides, and industry news for the Texas industrial workforce.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts?.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                {post.cover_image_url && (
                                    <div className="h-48 overflow-hidden bg-slate-100">
                                        <img
                                            src={post.cover_image_url}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="text-xs text-primary font-bold mb-2 uppercase tracking-wide">
                                        {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Draft'}
                                    </div>
                                    <h3 className="text-xl font-bold text-navy-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <span className="text-navy-900 font-bold text-sm mt-auto flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Read Article <span>→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {(!posts || posts.length === 0) && (
                        <div className="col-span-full text-center py-20 text-slate-400">
                            <p>No articles published yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
