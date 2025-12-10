-- 1. Status Tracking (Draft vs Published)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
-- (Options: 'draft', 'published', 'archived')
-- 2. SEO Meta Data (Google Snippets)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS meta_description TEXT;
-- 3. Target Keywords (For our internal tracking)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS target_keywords TEXT [];
-- 4. Featured Image Alt Text (Accessibility/SEO)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS cover_image_alt TEXT;
-- 5. Source Links (To cite our own data or sources)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS source_references JSONB DEFAULT '[]';