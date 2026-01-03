-- Manual Core Trade Mappings
-- This "bridges" the schools to the BLS wage data
-- Welding
INSERT INTO cip_soc_matrix (cip_code, soc_code, confidence_score)
VALUES ('48.0508', '51-4121', 100) ON CONFLICT (cip_code, soc_code) DO NOTHING;
-- HVAC
INSERT INTO cip_soc_matrix (cip_code, soc_code, confidence_score)
VALUES ('47.0201', '49-9021', 100) ON CONFLICT (cip_code, soc_code) DO NOTHING;
-- Electrician
INSERT INTO cip_soc_matrix (cip_code, soc_code, confidence_score)
VALUES ('46.0302', '47-2111', 100) ON CONFLICT (cip_code, soc_code) DO NOTHING;
-- Plumbing
INSERT INTO cip_soc_matrix (cip_code, soc_code, confidence_score)
VALUES ('46.0503', '47-2152', 100) ON CONFLICT (cip_code, soc_code) DO NOTHING;
-- Automotive
INSERT INTO cip_soc_matrix (cip_code, soc_code, confidence_score)
VALUES ('47.0604', '49-3023', 100) ON CONFLICT (cip_code, soc_code) DO NOTHING;
-- Diesel
INSERT INTO cip_soc_matrix (cip_code, soc_code, confidence_score)
VALUES ('47.0605', '49-3031', 100) ON CONFLICT (cip_code, soc_code) DO NOTHING;
-- Construction
INSERT INTO cip_soc_matrix (cip_code, soc_code, confidence_score)
VALUES ('46.0201', '47-2031', 100) ON CONFLICT (cip_code, soc_code) DO NOTHING;
-- Machining
INSERT INTO cip_soc_matrix (cip_code, soc_code, confidence_score)
VALUES ('48.0501', '51-4041', 100) ON CONFLICT (cip_code, soc_code) DO NOTHING;