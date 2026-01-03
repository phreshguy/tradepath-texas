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

- **schools**: Core school data (Name, City, State, ZIP).
- **programs**: Tuition, Program Name, CIP Code.
- **bls_salary_data**: Gov source for wages (SOC Code).
- **cip_soc_matrix**: The "Bridge" table linking Education (CIP) to Jobs (SOC).
  - *Update:* Now supports both 6-digit (standard) and 4-digit (API) CIP codes.
- **blog_posts**: CMS table for AI-generated content.

### Critical View

- **verified_roi_listings**: The ROI Engine.
  - **Joins:** Schools -> Programs -> CIP/SOC Matrix -> BLS Wages.
  - **Logic:** Calculates `Projected Salary - Tuition` = ROI.
  - **Categorization:** Maps raw SOC codes to user-friendly "Display Categories" (e.g., "Nursing (LPN-RN)", "Cybersecurity").

## 3. DATA INGESTION PIPELINE (The Engine)

### School Ingestion (`scripts/etl/fetchSchools.ts`)

- **Source:** Dept of Education API (College Scorecard).
- **Method:** "High-Speed" Batch Upsert.
  - Fetches 100 schools/page.
  - Buffers data into arrays.
  - Performs **Batch Insert** (ignoring duplicates) for Schools.
  - Performs **Batch Insert** for Programs, linking to valid School IDs.
- **Handling:** Patched to handle both Object and Array-based CIP responses from the API.

### Trade Mapping (`scripts/etl/fixLinkage.ts`)

- **Purpose:** Bridges the gap between Education and Industry.
- **Logic:**
  - Inject manual mappings into `cip_soc_matrix`.
  - Supports Granular Mappings (e.g., `5106` -> Dental Assistant).
  - Enables "Future Expansion" by simply adding new CIP-to-SOC pairs.

## 4. FRONTEND STRUCTURE (/web)

### Unified Routing (`web/app/[...slug]/page.tsx`)

- **One Route to Rule Them All:** Handles both State Hubs (`/tx`, `/fl`) and Trade Hubs (`/welding`, `/nursing-lpn-rn`).
- **Logic:**
  1. Checks if slug is a State Abbreviation -> Renders State Directory.
  2. Checks if slug is a Trade Key -> Renders National Trade Hub.
  3. Else -> 404.

### Components

- **MegaMenu:** Professional 2-column navigation ("Skilled Trades" vs "Healthcare & Tech").
- **SearchInput:** Smart search filtering by `display_category`.
- **ListingCard:** Displays ROI, Tuition, and Salary data points.

## 5. N8N AUTOMATION ARCHITECTURE

### Workflow A (The Scout)

- **Frequency:** Weekly.
- **Action:** Scrapes RSS -> AI Strategist -> `content_ideas`.

### Workflow B (The Factory)

- **Frequency:** Hourly.
- **Logic:** Polls `pending` ideas -> Research -> AI Writer -> Formats Markdown -> Saves Draft.

## 6. SEO STRATEGY

**Sitemap (`sitemap.ts`):**

- Dynamically generates massive scale sitemap.
- Combines: Static Routes + Blog Posts + City/Trade Permutations (via `get_seo_combinations` RPC).

**Metadata:**

- Programmatic generation based on Page Slug and Trade Data keys.

## 7. ENVIRONMENT VARIABLES

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Backend only)
- `DATA_GOV_API_KEY` (School Data)
- `BLS_API_KEY` (Wage Data)
