import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// --- CONFIG ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.DATA_GOV_API_KEY;

if (!supabaseUrl || !supabaseKey || !apiKey) {
    throw new Error('Missing configuration. Check .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Target Families including NEW expansions:
// 46: Construction, 47: Mechanic, 48: Precision
// 11: IT/Tech, 12: Cosmetology/Culinary, 51: Healthcare
const TARGET_FAMILIES = ['46', '47', '48', '11', '12', '51'];
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

async function fetchSchools() {
    console.log('🚀 Starting HIGH-SPEED National School Ingestion...');

    let page = 0;
    const perPage = 100;
    let schoolsProcessed = 0;
    let hasMore = true;

    while (hasMore) {
        try {
            console.log(`📡 Fetching API Page ${page} (Batch Size ${perPage})...`);

            const response = await axios.get(BASE_URL, {
                params: {
                    api_key: apiKey,
                    fields: 'id,school.name,latest.programs.cip_4_digit,school.city,school.zip,school.school_url,school.state,latest.cost.tuition.in_state',
                    per_page: perPage,
                    page: page,
                    'school.operating': 1
                },
                timeout: 10000
            });

            const results = response.data.results || [];
            if (results.length === 0) { hasMore = false; break; }

            // --- BATCH PREPARATION ---
            // Instead of inserting one by one, we build Arrays
            const schoolsToUpsert: any[] = [];
            const programsToUpsert: any[] = [];
            const schoolLookupMap = new Map(); // Maps Name+Zip -> API Data for program linkage

            for (const school of results) {
                const programsMap = school['latest.programs.cip_4_digit'];
                if (!programsMap) continue;

                const programCodes = Object.keys(programsMap);
                // Fast filter
                const hasTargetPrograms = programCodes.some(code =>
                    TARGET_FAMILIES.some(fam => code.startsWith(fam))
                );

                if (hasTargetPrograms) {
                    const cleanName = school['school.name'] || 'Unknown School';
                    const cleanZip = (school['school.zip'] || '00000').substring(0, 5);
                    const key = `${cleanName}-${cleanZip}`;

                    // Add to School Payload (no accreditation_status - field doesn't exist in DB)
                    schoolsToUpsert.push({
                        name: cleanName,
                        city: school['school.city'],
                        state: (school['school.state'] || 'US').toUpperCase(),
                        zip: cleanZip,
                        website: school['school.school_url']
                    });

                    // Store raw data to map programs after we get IDs back
                    schoolLookupMap.set(key, {
                        codes: programCodes,
                        tuition: school['latest.cost.tuition.in_state'] || 0
                    });
                }
            }

            // --- BULK ACTION 1: Insert Schools (with duplicate handling) ---
            if (schoolsToUpsert.length > 0) {
                // Try bulk insert - duplicates will be silently skipped
                const { data: insertedSchools, error: schoolErr } = await supabase
                    .from('schools')
                    .insert(schoolsToUpsert)
                    .select('id, name, zip');

                // Fetch ALL schools from this batch (including pre-existing ones)
                const allSchoolKeys = schoolsToUpsert.map(s => ({ name: s.name, zip: s.zip }));
                const { data: allSchools } = await supabase
                    .from('schools')
                    .select('id, name, zip')
                    .in('name', allSchoolKeys.map(k => k.name));

                const savedSchools = allSchools || [];

                // --- BULK ACTION 2: Prepare Programs ---
                // Match the new IDs back to our Program data
                savedSchools?.forEach(savedDbRow => {
                    const key = `${savedDbRow.name}-${savedDbRow.zip}`;
                    const rawData = schoolLookupMap.get(key);

                    if (rawData) {
                        const { codes, tuition } = rawData;

                        // Process codes for this specific school
                        codes.forEach((code: string) => {
                            if (!TARGET_FAMILIES.some(fam => code.startsWith(fam))) return;

                            let namePrefix = "Technical Trade Program";

                            // Precise Naming Logic for New Expansions
                            if (code.startsWith('11')) namePrefix = "Cybersecurity & Network Tech";
                            else if (code.startsWith('12')) namePrefix = "Cosmetology & Barbering";
                            else if (code.startsWith('46')) namePrefix = "Construction & Electrical";
                            else if (code.startsWith('47')) namePrefix = "Mechanic & HVAC Tech";
                            else if (code.startsWith('48')) namePrefix = "Precision & Welding";
                            else if (code.startsWith('5106')) namePrefix = "Dental Assistant";
                            else if (code.startsWith('5108')) namePrefix = "Medical Clinical Assistant";
                            else if (code.startsWith('5138')) namePrefix = "Nursing (LPN-RN)";
                            else if (code.startsWith('51')) namePrefix = "Healthcare Technology";

                            programsToUpsert.push({
                                school_id: savedDbRow.id,
                                cip_code: code,
                                program_name: namePrefix,
                                tuition_in_state: tuition,
                                program_length_months: 12
                            });
                        });
                    }
                });

                // --- BULK ACTION 3: Insert Programs (duplicates ignored) ---
                if (programsToUpsert.length > 0) {
                    const { error: progErr } = await supabase
                        .from('programs')
                        .insert(programsToUpsert);

                    // Silently ignore duplicate errors - programs may already exist
                    if (progErr && !progErr.message.includes('duplicate')) {
                        console.error("Program Batch Error:", progErr.message);
                    }
                }

                schoolsProcessed += schoolsToUpsert.length;
                console.log(`  ✅ Synced ${schoolsToUpsert.length} schools & ${programsToUpsert.length} programs in batch.`);
            }

            page++;
            // 60-70 pages covers most trade schools, increase to 200 for full university coverage
            if (page > 300) break;

        } catch (e: any) {
            console.error(`🛑 Error on page ${page}:`, e.message);
            // Don't crash, just retry next page
            await new Promise(r => setTimeout(r, 2000));
            page++;
        }
    }

    console.log(`🎉 COMPLETED. Total Trade Schools Managed: ${schoolsProcessed}`);
}

fetchSchools();