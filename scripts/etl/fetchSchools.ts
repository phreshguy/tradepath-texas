
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.DATA_GOV_API_KEY;

if (!supabaseUrl || !supabaseKey || !apiKey) {
    throw new Error('Missing configuration.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_FAMILIES = ['46', '47', '48'];
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

async function fetchSchools() {
    console.log('Fetching ALL Texas schools (Debugging)...');

    let page = 0;
    let totalPages = 1;
    const perPage = 100;
    let totalTxSchools = 0;
    let tradeSchoolsRetained = 0;

    while (page < totalPages) {
        console.log(`Fetching page ${page} (per_page=${perPage})...`);
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    api_key: apiKey,
                    'school.state': 'TX',
                    fields: 'id,school.name,latest.programs.cip_4_digit,school.city,school.zip,school.accreditation,school.school_url',
                    per_page: perPage,
                    page: page
                }
            });

            const data = response.data;
            const metadata = data.metadata;
            if (metadata) {
                const total = metadata.total;
                totalPages = Math.ceil(total / perPage);
            }

            const results = data.results || [];
            totalTxSchools += results.length;
            // console.log(`Page ${page}: Received ${results.length} schools.`);

            for (const school of results) {
                const programsMap = school['latest.programs.cip_4_digit'];
                // ProgramsMap keys are the CIP codes.
                if (!programsMap) continue;

                const programCodes = Object.keys(programsMap);

                // Filter In Memory: Check families 46, 47, 48
                const relevantCodes = programCodes.filter(code => {
                    // CIP codes often come as "4805" or "48.05".
                    // We check if it starts with "46", "47", "48".
                    // This covers "46xx", "46.xx".
                    return TARGET_FAMILIES.some(fam => code.startsWith(fam));
                });

                if (relevantCodes.length > 0) {
                    tradeSchoolsRetained++;

                    // Clean undefined values
                    const schoolName = school['school.name'] || 'Unknown';
                    const schoolZip = school['school.zip'] || '00000';

                    // Check if school exists
                    const { data: existing } = await supabase
                        .from('schools')
                        .select('id')
                        .eq('name', schoolName)
                        .eq('zip', schoolZip)
                        .maybeSingle();

                    let schoolId;
                    if (existing) {
                        schoolId = existing.id;
                    } else {
                        const { data: inserted, error: insErr } = await supabase
                            .from('schools')
                            .insert({
                                name: schoolName,
                                city: school['school.city'],
                                state: 'TX', // We queried for TX
                                zip: schoolZip,
                                website: school['school.school_url'],
                                accreditation_status: school['school.accreditation'],
                            })
                            .select('id')
                            .single();

                        if (insErr) {
                            console.error('Insert Error (School):', insErr.message);
                            continue;
                        }
                        schoolId = inserted.id;
                    }

                    // Insert Programs
                    // We need to deduplicate programs if re-running?
                    // Ideally we check. For debug, we construct payload.
                    const programsPayload = relevantCodes.map(code => ({
                        school_id: schoolId,
                        program_name: `CIP ${code}`, // Placeholder name
                        cip_code: code,
                    }));

                    if (programsPayload.length > 0) {
                        const { error: pErr } = await supabase.from('programs').insert(programsPayload);
                        if (pErr) {
                            // Ignore uniqueness errors if any
                            // console.error('Insert Error (Programs):', pErr.message);
                        }
                    }
                }
            }

        } catch (e: any) {
            console.error('Fetch Error:', e.message);
            if (e.response) {
                console.error('API Response:', e.response.data);
            }
        }

        page++;
    }

    console.log(`Total TX Schools found: ${totalTxSchools}`);
    console.log(`Trade Schools retained: ${tradeSchoolsRetained}`);
}

fetchSchools();
