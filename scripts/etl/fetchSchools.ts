import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// --- CONFIG ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.DATA_GOV_API_KEY;

if (!supabaseUrl || !supabaseKey || !apiKey) {
    throw new Error('Missing configuration: Check .env file for Supabase/API Keys.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Trade Families: Construction (46), Mechanic (47), Precision (48), Tech (11), Services (12), Medical (51)
const TARGET_FAMILIES = ['46', '47', '48', '11', '12', '51'];
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

async function fetchSchools() {
    console.log('🚀 Starting NATIONAL School Ingestion (Expanded Mode)...');

    let page = 0;
    const perPage = 100;
    let schoolsProcessed = 0;
    let schoolsInserted = 0;
    let programsInserted = 0;
    let hasMore = true;

    while (hasMore) {
        try {
            console.log(`📡 Fetching Page ${page} (Offset ${page * perPage})...`);

            const response = await axios.get(BASE_URL, {
                params: {
                    api_key: apiKey,
                    // Request specific fields including tuition
                    fields: 'id,school.name,latest.programs.cip_4_digit,school.city,school.zip,school.accreditation,school.school_url,school.state,latest.cost.tuition.in_state',
                    per_page: perPage,
                    page: page,
                    'school.operating': 1 // Only open schools
                }
            });

            const results = response.data.results || [];

            if (results.length === 0) {
                console.log('✅ Reached end of data results.');
                hasMore = false;
                break;
            }

            // SEQUENTIAL PROCESSING (Normal Route for reliability)
            for (const school of results) {
                schoolsProcessed++;

                const programsMap = school['latest.programs.cip_4_digit'];
                if (!programsMap) continue;

                const programCodes = Object.keys(programsMap);
                const relevantCodes = programCodes.filter(code =>
                    TARGET_FAMILIES.some(fam => code.startsWith(fam))
                );

                if (relevantCodes.length > 0) {
                    const schoolName = school['school.name'] || 'Unknown School';
                    const schoolZip = (school['school.zip'] || '00000').substring(0, 5);
                    const schoolState = (school['school.state'] || 'US').toUpperCase();
                    const tuition = school['latest.cost.tuition.in_state'] || 0;

                    // Manual existence check (Safe Upsert)
                    let { data: existingSchool } = await supabase
                        .from('schools')
                        .select('id')
                        .eq('name', schoolName)
                        .eq('zip', schoolZip)
                        .maybeSingle();

                    let schoolId;
                    if (existingSchool) {
                        schoolId = existingSchool.id;
                        // Optional: Update record
                        await supabase.from('schools').update({
                            city: school['school.city'],
                            state: schoolState,
                            website: school['school.school_url'],
                            accreditation_status: school['school.accreditation']
                        }).eq('id', schoolId);
                    } else {
                        const { data: newSchool, error: insErr } = await supabase
                            .from('schools')
                            .insert({
                                name: schoolName,
                                city: school['school.city'],
                                state: schoolState,
                                zip: schoolZip,
                                website: school['school.school_url'],
                                accreditation_status: school['school.accreditation'],
                            })
                            .select('id')
                            .single();

                        if (insErr) {
                            console.error(`  ❌ School Insert Error [${schoolName}]:`, insErr.message);
                            continue;
                        }
                        schoolId = newSchool.id;
                        schoolsInserted++;
                    }

                    // Process Programs for this school
                    for (const code of relevantCodes) {
                        let namePrefix = "Technical Program";
                        if (code.startsWith('46')) namePrefix = "Construction/Trades";
                        if (code.startsWith('47')) namePrefix = "Mechanic/Repair Tech";
                        if (code.startsWith('48')) namePrefix = "Precision Production";
                        if (code.startsWith('11')) namePrefix = "Cybersecurity & Network Tech";
                        if (code.startsWith('12')) namePrefix = "Cosmetology & Barbering";
                        if (code.startsWith('5106')) namePrefix = "Dental Assistant";
                        else if (code.startsWith('5108')) namePrefix = "Medical Clinical Assistant";
                        else if (code.startsWith('5138')) namePrefix = "Nursing (LPN-RN)";
                        else if (code.startsWith('51')) namePrefix = "Medical & Health";

                        // Manual existence check for programs
                        const { data: existingProg } = await supabase
                            .from('programs')
                            .select('id')
                            .eq('school_id', schoolId)
                            .eq('cip_code', code)
                            .maybeSingle();

                        if (!existingProg) {
                            const { error: progErr } = await supabase
                                .from('programs')
                                .insert({
                                    school_id: schoolId,
                                    program_name: namePrefix,
                                    cip_code: code,
                                    tuition_in_state: tuition, // Correct field after rename
                                    program_length_months: 12
                                });

                            if (progErr) {
                                console.error(`    ❌ Program Insert Error [${code}]:`, progErr.message);
                            } else {
                                programsInserted++;
                            }
                        }
                    }
                }
            }

            console.log(`  Processed Page ${page}. Schools: ${schoolsInserted} New / ${schoolsProcessed} Total. Programs: ${programsInserted} New.`);
            page++;

            // Safety break 
            if (page > 500) break;

        } catch (e: any) {
            console.error(`🛑 Critical Error on Page ${page}:`, e.message);
            await new Promise(r => setTimeout(r, 5000)); // Cool down
            page++; // Skip to next to avoid infinite loop
        }
    }

    console.log('🎉 INGESTION COMPLETE.');
    console.log(`Summary: ${schoolsInserted} schools added, ${programsInserted} programs linked.`);
}

fetchSchools();
