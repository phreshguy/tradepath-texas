import { createClientComponentClient as createClient } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 3600;

// Standard components for the Markdown renderer
const markdownComponents = {
    // Style headings
    h1: ({ node, ...props }: any) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b pb-2" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
    // Style lists
    ul: ({ node, ...props }: any) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
    // Style paragraphs
    p: ({ node, ...props }: any) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
    // Style links
    a: ({ node, ...props }: any) => <a className="text-blue-600 underline hover:text-blue-800" {...props} />,
    // Fix tables (The Critical Fix)
    table: ({ node, ...props }: any) => (
        <div className="overflow-x-auto my-8 border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full text-sm divide-y divide-gray-200" {...props} />
        </div>
    ),
    thead: ({ node, ...props }: any) => <thead className="bg-gray-50 font-semibold" {...props} />,
    tbody: ({ node, ...props }: any) => <tbody className="bg-white divide-y divide-gray-100" {...props} />,
    tr: ({ node, ...props }: any) => <tr className="hover:bg-gray-50" {...props} />,
    th: ({ node, ...props }: any) => <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" {...props} />,
    td: ({ node, ...props }: any) => <td className="px-6 py-4 whitespace-nowrap text-gray-700" {...props} />,
};

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const supabase = createClient();
    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();

    if (!post) return notFound();

    return (
        <main className="min-h-screen bg-white">
            {/* HEADER: Clean Navy Top */}
            <header className="bg-industrial-900 py-16 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <Link href="/blog" className="text-safety-500 font-bold text-sm tracking-wide hover:text-white transition mb-6 inline-block">
                        ← BACK TO JOURNAL
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                        {post.title}
                    </h1>
                    <p className="text-slate-400">
                        {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </header>

            {/* BODY: Clean White Paper */}
            <article className="max-w-3xl mx-auto px-6 py-12">
                {post.cover_image_url && (
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-auto rounded-lg shadow-lg mb-12 -mt-20 border-4 border-white" />
                )}

                {/* THE CONTENT RENDERER */}
                <div className="prose prose-lg prose-slate max-w-none text-black">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                    >
                        {post.content_markdown}
                    </ReactMarkdown>
                </div>

                {/* DISCLAIMER */}
                <hr className="my-12 border-gray-200" />
                <p className="text-sm text-gray-500 italic">
                    Note: Career data verified via TradePathUSA.com database sources (BLS 2025).
                </p>
            </article>
        </main>
    );
}
