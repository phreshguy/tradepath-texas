1. THE ELEVATOR PITCH (Product Philosophy)
We are not building a directory. We are building an ROI Engine for the skilled trades.
The Problem: Traditional education directories are lead-gen farms for low-quality online universities. They focus on "Degrees."
Our Solution: We focus on "outcomes." We serve the "Career Pivoter" (ages 25–40)—someone currently working in retail/service who wants to make $70k+ in a trade.
The differentiator: Every listing MUST calculate "Return on Investment." We map Tuition Cost (Input) against Local Salary Data (Output) to verify if a school is worth it.
2. CORE BUSINESS RULES (Immutable Laws)
State-First Strategy: We are launching Texas-Only for V1. Do not generate national schemas yet.
The "Data handshake": The core logic is the cross-reference between:
CIP Codes (Education ID) from the Dept of Education API.
SOC Codes (Job ID) from the Bureau of Labor Statistics (BLS) API.
No "Fluff": If a school doesn't have a physical campus or verified trade accreditation, it does not get listed.
Performance Over Beauty: This is for blue-collar users on mobile devices (jobsites). The UI must be high-contrast, big buttons, and instant load time. Zero heavy animations.
3. THE "GOLDEN RECORD" (Data Schema Logic)
The Agent must structure the database around the School_Program relationship, not just School.
Bad Schema: School Name -> Address.
Good Schema: School Name -> offers Program (Welding) -> links to Occupation (SOC 51-4121) -> pulls Wage (Dallas County).
4. TECH STACK & ARCHITECTURE
Framework: Next.js 15 (App Router).
Language: TypeScript (Strict mode).
Database: Supabase (PostgreSQL). Use Row Level Security.
Data Fetching: Python Scripts for ETL (running in the background to fetch Gov APIs).
Styling: Tailwind CSS. "Brutal/Utilitarian" design system (Think: Craigslist meets Gov.uk).
Search: Postgres Full Text Search (Do not use Algolia yet; keep costs zero).
5. TARGET USER PERSONA ("Dave")
Name: Dave, 29.
Current State: Works at Amazon Warehouse. Tired. Back hurts.
Goal: Wants to be an Elevator Mechanic or HVAC tech.
Friction: Confused by google search results. Scared of debt.
What he needs from us: A map showing the closest school + a big green number saying "Graduates earn $60k starting."
6. IMMEDIATE SUCCESS METRICS (V1 Goals)
Ingest all Title IV Trade Schools in Texas (CIP families 46, 47, 48).
Map them successfully to BLS Salary Data for their Zip Code.
Auto-generate 50 SEO landing pages: /{city}-{trade}-schools (e.g., /houston-hvac-schools).
Component ROICalculator.tsx is working on every listing page.