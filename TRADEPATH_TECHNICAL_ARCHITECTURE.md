# TradePath Technical Architecture

## 1. HIGH-LEVEL OVERVIEW

**Mission:** Data-backed Trade School ROI Engine + Automated Media Publication.

**Stack:**

- **Frontend:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS (Industrial Navy Theme)
- **Database:** Supabase (PostgreSQL)
- **Automation:** n8n
- **Hosting:** Vercel

## 2. DATABASE SCHEMA (Supabase)

### Tables

- **schools**: Core school data.
- **programs**: Tuition and program lengths.
- **bls_salary_data**: Gov source for wages.
- **cip_soc_matrix**: The handshake link.
- **blog_posts**: CMS table.
  - Calls: `title`, `slug`, `content_markdown`, `status` [draft/published], `cover_image_url`.
- **content_ideas**: n8n War Room.
  - Cols: `topic_title`, `target_keyword`, `status` [pending/processing/completed], `angle`.

### Critical View

- **verified_roi_listings**: Joins schools to wages + adds buckets logic.

### Functions

- **get_and_lock_next_idea()**: RPC function for n8n atomic locking.

## 3. N8N AUTOMATION ARCHITECTURE

### Workflow A (The Scout)

- **Frequency:** Runs weekly.
- **Action:** Scrapes RSS (News/Reddit) -> AI Strategist (Filters & Scores) -> Saves to `content_ideas`.

### Workflow B (The Factory)

- **Frequency:** Runs hourly.
- **Logic:** Polls `content_ideas` for 'pending' -> Locks topic -> Research (Serper + Tavily) -> Cross-checks Internal Data -> AI Writer (DeepSeek/Gemini) -> Auto-formats (Markdown) -> Saves to `blog_posts` (Draft) -> Notifies Telegram.

## 4. FRONTEND STRUCTURE (/web)

### pSEO

- `web/app/local/[city]/[trade]/page.tsx` (Dynamic Landing Pages).

### Blog

- `web/app/blog/[slug]/page.tsx` (Static Generated w/ Revalidation).
- Uses `react-markdown` + `remark-gfm` + typography plugin for "White Paper" rendering.

### Components

- **Navbar:** Client Component for Mobile menu.
- **SearchInput:** Core search component.

## 5. SEO STRATEGY

**Sitemap:**

- Dynamic generation in `sitemap.ts` (combines static routes + database blogs + city/trade permutations).

**Metadata:**

- Dynamic year logic (`SEO_YEAR` constant).

**Analytics:**

- Google Analytics 4 (`next/script`) + Vercel Analytics.

**Verification:**

- Google + Yandex ownership tags in layout.

## 6. ENVIRONMENT VARIABLES

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL`
- `BLS_API_KEY`
- `OPENAI_API_KEY`
- `SERPER_API_KEY`
- `TAVILY_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
