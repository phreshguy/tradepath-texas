import { MetadataRoute } from 'next';
import { createClientComponentClient } from '@/utils/supabase/client';

// Base URL for the project
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tradepathusa.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClientComponentClient();

    // 1. Static Routes
    const routes = [
        '',
        '/blog',
        '/about',
        '/contact',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1.0,
    }));

    // 2. Fetch Dynamic Blog Posts
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, published_at')
        .eq('status', 'published');

    const blogRoutes = (posts || []).map((post: { slug: string; published_at: string }) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.published_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    // 3. Fetch pSEO Combinations (Distinct City + Category pairs)
    // We pull distinct combinations to ensure we don't index empty pages
    const { data: seoPages } = await supabase
        .rpc('get_seo_combinations');

    // fallback pSEO logic (Cities x Trades)
    const cities = ['Houston', 'Dallas', 'San Antonio', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock'];
    const trades = ['mechanic', 'construction', 'precision'];

    let pSEORoutes: MetadataRoute.Sitemap = [];

    if (seoPages && seoPages.length > 0) {
        pSEORoutes = seoPages.map((page: any) => ({
            url: `${BASE_URL}/local/${page.city.toLowerCase().replace(' ', '-')}/${page.trade}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));
    } else {
        pSEORoutes = cities.flatMap(city =>
            trades.map(trade => ({
                url: `${BASE_URL}/local/${city.toLowerCase().replace(' ', '-')}/${trade}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            }))
        );
    }

    return [...routes, ...blogRoutes, ...pSEORoutes];
}
