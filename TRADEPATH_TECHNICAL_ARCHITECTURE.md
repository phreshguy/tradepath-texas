# TradePathUSA Technical Architecture

## 1. Project Mission

**TradePathUSA** is a **Texas Trade School ROI Engine**. Its core mission is to empower blue-collar students by providing verified government data on the "1st Year ROI" of trade programs. It counters the "4-year degree only" narrative by highlighting lucrative vocational paths (HVAC, Welding, etc.).

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS (Industrial Theme: Navy 900 / Safety Orange)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Language**: TypeScript

## 3. Database Map (Supabase)

The application relies on 5 core tables and 1 logical view.

### Tables

1. **`schools`**: Verified institutions (Name, City, Website). Source: CollegeScorecard.
2. **`programs`**: Specific offerings (e.g., "Welding Technology") linked to schools. Contains Tuition & Length. Source: CollegeScorecard.
3. **`bls_salary_data`**: Median annual wages for SOC (Standard Occupational Classification) codes in Texas. Source: BLS OEWS.
4. **`cip_soc_matrix`**: The "Rosetta Stone" mapping educational programs (CIP codes) to careers (SOC codes).
5. **`blog_posts`**: Content engine for articles.
   - Columns: `id, slug, title, content_markdown, status, meta_description, target_keywords`

### Views

- **`verified_roi_listings`**: A master view that joins Schools + Programs + Wages.
  - Logic: `(Median Salary - Tuition) = Calculated ROI`.
  - Used by the Frontend to display the "Top Rated Scools" grid.

## 4. Programmatic SEO (pSEO) Strategy

We capture long-tail traffic via dynamic landing pages.

- **Route**: `/local/[city]/[trade]`
- **Example**: `/local/houston/hvac`
- **Logic**:
  1. Accepts `city` and `trade` params.
  2. Maps simple trade slugs (e.g., `hvac`) to database categories (e.g., `Mechanic/Repair Tech`).
  3. Queries `verified_roi_listings` for schools in that city + category.
  4. Renders a keyword-rich H1 and Metadata title.
  5. **Smart Fallback**: If no specific matches found, shows the broader category for the city to prevent empty pages.

## 5. Environment Variables

Keys required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: Connection string.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key.
- `DATABASE_URL`: Direct Postgres connection (for migration scripts).

## 6. Deployment Settings (Vercel)

- **Root Directory**: `web`
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Framework Preset**: Next.js

## 7. Future Automation (n8n)

The `blog_posts` table is prepped for AI Automation.

- **Trigger**: n8n watches for new rows or status changes.
- **Action**: AI writes content to `content_markdown` and sets status to `draft` for review.
