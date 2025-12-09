CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content_markdown TEXT NOT NULL,
    cover_image_url TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    author TEXT DEFAULT 'TradePath Editorial'
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read blog" ON blog_posts FOR
SELECT USING (true);
CREATE POLICY "Service role manages blog" ON blog_posts USING (true);