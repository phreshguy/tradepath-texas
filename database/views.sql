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
    p.tuition_in_state as tuition_cost,
    p.program_length_months,
    b.median_annual_salary as projected_salary,
    (
        b.median_annual_salary - coalesce(p.tuition_in_state, 0)
    ) as calculated_roi,
    b.soc_title,
    b.soc_code,
    CASE
        WHEN b.soc_code LIKE '51-412%' THEN 'Welding Technology'
        WHEN b.soc_code LIKE '49-902%' THEN 'HVAC/R Technician'
        WHEN b.soc_code LIKE '47-211%' THEN 'Electrician & Power Systems'
        WHEN b.soc_code LIKE '47-215%' THEN 'Plumbing & Pipefitting'
        WHEN b.soc_code LIKE '49-302%' THEN 'Automotive Service Tech'
        WHEN b.soc_code LIKE '49-303%' THEN 'Diesel & Heavy Equipment'
        WHEN b.soc_code LIKE '47-203%'
        OR b.soc_code LIKE '47-206%' THEN 'Carpentry & Construction'
        WHEN b.soc_code LIKE '51-404%'
        OR b.soc_code LIKE '51-916%' THEN 'CNC Machining & Fabrication'
        WHEN b.soc_code = '31-9091' THEN 'Dental Assistant'
        WHEN b.soc_code = '31-9092' THEN 'Medical Clinical Assistant'
        WHEN b.soc_code = '29-1141'
        OR b.soc_code = '29-2061' THEN 'Nursing (LPN-RN)'
        WHEN b.soc_code = '15-1212'
        OR b.soc_code = '15-1151' THEN 'Cybersecurity & Network Tech'
        WHEN b.soc_code = '39-5012'
        OR b.soc_code = '39-5011' THEN 'Cosmetology & Barbering'
        WHEN b.soc_code = '49-3011' THEN 'Aviation Maintenance'
        WHEN b.soc_code = '53-3032' THEN 'Commercial Driving (CDL)'
        WHEN b.soc_code = '35-1011' THEN 'Culinary Arts'
        WHEN b.soc_code = '47-2231' THEN 'Solar Energy Technology'
        ELSE 'Other'
    END as display_category
from programs p
    join schools s on p.school_id = s.id
    join cip_soc_matrix csm on p.cip_code = csm.cip_code
    join bls_salary_data b on csm.soc_code = b.soc_code
where b.state_abbr = s.state
    and b.median_annual_salary is not null
order by (
        b.median_annual_salary - coalesce(p.tuition_in_state, 0)
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
        WHEN display_category = 'Welding Technology' THEN 'welding'
        WHEN display_category = 'HVAC/R Technician' THEN 'hvac'
        WHEN display_category = 'Electrician & Power Systems' THEN 'electrician'
        WHEN display_category = 'Plumbing & Pipefitting' THEN 'plumbing'
        WHEN display_category = 'Automotive Service Tech' THEN 'automotive'
        WHEN display_category = 'Diesel & Heavy Equipment' THEN 'diesel'
        WHEN display_category = 'Carpentry & Construction' THEN 'construction'
        WHEN display_category = 'CNC Machining & Fabrication' THEN 'machining'
        WHEN display_category = 'Dental Assistant' THEN 'dental-assistant'
        WHEN display_category = 'Medical Clinical Assistant' THEN 'medical-clinical-assistant'
        WHEN display_category = 'Nursing (LPN-RN)' THEN 'nursing-lpn-rn'
        WHEN display_category = 'Cybersecurity & Network Tech' THEN 'cybersecurity-network-tech'
        WHEN display_category = 'Cosmetology & Barbering' THEN 'cosmetology-barbering'
        WHEN display_category = 'Aviation Maintenance' THEN 'aviation-maintenance'
        WHEN display_category = 'Commercial Driving (CDL)' THEN 'commercial-driving-cdl'
        WHEN display_category = 'Culinary Arts' THEN 'culinary-arts'
        WHEN display_category = 'Solar Energy Technology' THEN 'solar-energy-technology'
        ELSE 'other'
    END as trade
from verified_roi_listings
where display_category != 'Other';
$$;