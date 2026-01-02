-- View: verified_roi_listings
-- Purpose: Join Schools -> Programs -> SOC -> Wages to calculate ROI.
-- "Projected Salary" = bls_salary_data.median_annual_salary
-- "ROI" = Projected Salary - Tuition Cost (Simplified 1st Year ROI)
create or replace view verified_roi_listings as
select s.name as school_name,
    s.city,
    s.state,
    s.zip,
    s.website,
    p.program_name,
    p.tuition_cost,
    p.program_length_months,
    b.median_annual_salary as projected_salary,
    (
        b.median_annual_salary - coalesce(p.tuition_cost, 0)
    ) as calculated_roi,
    b.soc_title,
    b.soc_code,
    CASE
        WHEN b.soc_code LIKE '47%' THEN 'Construction Trade'
        WHEN b.soc_code LIKE '49%' THEN 'Mechanic/Repair Tech'
        WHEN b.soc_code LIKE '51%' THEN 'Precision Production'
        ELSE 'Other'
    END as display_category
from programs p
    join schools s on p.school_id = s.id
    join cip_soc_matrix csm on p.cip_code = csm.cip_code
    join bls_salary_data b on csm.soc_code = b.soc_code -- MATCHING STATE: Wages must match School State
where b.state_abbr = s.state
    and b.median_annual_salary is not null
order by (
        b.median_annual_salary - coalesce(p.tuition_cost, 0)
    ) desc;
-- RPC: get_seo_combinations
-- Returns distinct City + State + Trade combinations for Sitemap generation
create or replace function get_seo_combinations() returns table (
        city text,
        state text,
        trade text
    ) language sql as $$
select distinct city,
    state,
    CASE
        WHEN display_category = 'Construction Trade' THEN 'construction'
        WHEN display_category = 'Mechanic/Repair Tech' THEN 'mechanic'
        WHEN display_category = 'Precision Production' THEN 'precision'
        ELSE 'other'
    END as trade
from verified_roi_listings
where display_category IN (
        'Construction Trade',
        'Mechanic/Repair Tech',
        'Precision Production'
    );
$$;