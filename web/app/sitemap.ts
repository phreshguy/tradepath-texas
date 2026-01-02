import { MetadataRoute } from 'next';
import { createClientComponentClient } from '@/utils/supabase/client';
import { slugify } from '@/utils/slugify';
import { STATE_MAP } from '@/utils/states';

// Base URL for the project
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tradepathusa.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClientComponentClient();

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/search',
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

    // 2. State Routes (e.g., /tx, /fl)
    const stateRoutes = Object.keys(STATE_MAP).map((abbr) => ({
        url: `${BASE_URL}/${abbr.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    // 3. Dynamic Blog Posts
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

    // 4. City Hubs and pSEO Niche Pages
    const { data: seoPages } = await supabase
        .rpc('get_seo_combinations');

    let pSEORoutes: MetadataRoute.Sitemap = [];
    let cityHubRoutes: MetadataRoute.Sitemap = [];

    if (seoPages && seoPages.length > 0) {
        // Create City Hubs (/[state]/[city])
        const uniqueCityKeys = Array.from(new Set(seoPages.map((p: any) => `${p.state.toLowerCase()}|${p.city}`))) as string[];
        cityHubRoutes = uniqueCityKeys.map((key) => {
            const [state, city] = key.split('|');
            return {
                url: `${BASE_URL}/${state}/${slugify(city)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            };
        });

        // Create niche pages (/[state]/[city]/[trade])
        pSEORoutes = seoPages.map((page: any) => ({
            url: `${BASE_URL}/${page.state.toLowerCase()}/${slugify(page.city)}/${page.trade}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    }

    return [...staticRoutes, ...stateRoutes, ...blogRoutes, ...cityHubRoutes, ...pSEORoutes];
}

