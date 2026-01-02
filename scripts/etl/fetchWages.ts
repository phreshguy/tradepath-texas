
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing configuration.');
}

// Parse Command Line Arguments for --state=XX
const args = process.argv.slice(2);
const stateArg = args.find(a => a.startsWith('--state='));
const targetState = stateArg ? stateArg.split('=')[1] : null;

if (!targetState) {
    console.error('Error: You must provide a target state. Usage: npx tsx fetchWages.ts --state=TX');
    process.exit(1);
}

// Parse Keys
// Support comma, semicolon, or space delimiters
const blsKeys = (process.env.BLS_API_KEY || '').split(/[,;\s]+/).map(k => k.trim()).filter(Boolean);
if (blsKeys.length === 0) {
    const singleKey = process.env.BLS_API_KEY;
    if (singleKey) blsKeys.push(singleKey);
    else throw new Error('Missing BLS_API_KEY in .env');
}
console.log(`Loaded ${blsKeys.length} BLS API Key(s).`);

let currentKeyIndex = 0;

const STATE_FIPS: Record<string, string> = {
    "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06",
    "CO": "08", "CT": "09", "DE": "10", "DC": "11", "FL": "12",
    "GA": "13", "HI": "15", "ID": "16", "IL": "17", "IN": "18",
    "IA": "19", "KS": "20", "KY": "21", "LA": "22", "ME": "23",
    "MD": "24", "MA": "25", "MI": "26", "MN": "27", "MS": "28",
    "MO": "29", "MT": "30", "NE": "31", "NV": "32", "NH": "33",
    "NJ": "34", "NM": "35", "NY": "36", "NC": "37", "ND": "38",
    "OH": "39", "OK": "40", "OR": "41", "PA": "42", "RI": "44",
    "SC": "45", "SD": "46", "TN": "47", "TX": "48", "UT": "49",
    "VT": "50", "VA": "51", "WA": "53", "WV": "54", "WI": "55",
    "WY": "56"
};

const fipsCode = STATE_FIPS[targetState];
if (!fipsCode) {
    console.error(`Error: Invalid state abbreviation '${targetState}'.`);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

async function fetchWages() {
    console.log(`Fetching wages for STATE: ${targetState} (FIPS: ${fipsCode})...`);
    console.log('Fetching unique SOC codes from matrix...');

    const { data: matrixData, error: matrixError } = await supabase
        .from('cip_soc_matrix')
        .select('soc_code');

    if (matrixError) {
        console.error('Error fetching matrix:', matrixError);
        return;
    }

    const uniqueSocs = Array.from(new Set(matrixData.map(r => r.soc_code))).filter(Boolean);
    console.log(`Found ${uniqueSocs.length} unique SOC codes.`);

    // Warm cache for bls_salary_data
    await supabase.from('bls_salary_data').select('id').limit(1);

    const batches = chunkArray(uniqueSocs, 40);

    for (const batch of batches) {
        console.log(`Fetching batch of ${batch.length}...`);

        // Construct Series IDs
        const seriesMap = new Map();
        const seriesIds = batch.map(soc => {
            const cleanSoc = soc.replace(/-/g, '');
            // Verified format: OEUS + FIPS + 11 zeros + SOC + 04
            const id = `OEUS${fipsCode}00000000000${cleanSoc}04`;
            seriesMap.set(id, soc);
            return id;
        });

        let batchSuccess = false;
        let attempts = 0;

        // Retry Loop for Key Rotation
        while (!batchSuccess && attempts < blsKeys.length) {
            const activeKey = blsKeys[currentKeyIndex];

            // console.log(`Attempting with Key Index: ${currentKeyIndex}`);

            try {
                const response = await axios.post('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
                    seriesid: seriesIds,
                    registrationkey: activeKey,
                    startyear: "2023",
                    endyear: "2024",
                    catalog: false,
                    calculations: false,
                    annualaverage: false
                });

                const data = response.data;

                // Check for Limit Error
                if (data.status === 'REQUEST_NOT_PROCESSED' &&
                    data.message &&
                    data.message.some((m: string) => m.includes('daily threshold'))) {

                    console.warn(`⚠️ API Key ${currentKeyIndex + 1}/${blsKeys.length} exhausted. Rotating to next key...`);
                    currentKeyIndex = (currentKeyIndex + 1) % blsKeys.length;
                    attempts++;
                    // Wait a moment before retrying
                    await new Promise(r => setTimeout(r, 2000));
                    continue; // Retry logic with new key
                }

                // If success or other error
                const results = data.Results?.series || [];

                // Debug Log
                if (results.length === 0) {
                    console.error("API returned 0 series results. Raw:", JSON.stringify(data).substring(0, 300));
                }

                const upsertData: any[] = [];
                for (const series of results) {
                    const seriesId = series.seriesID;
                    const socCode = seriesMap.get(seriesId);
                    const dataPoints = series.data || [];
                    if (dataPoints.length > 0) {
                        const latest = dataPoints[0];
                        const val = parseFloat(latest.value);
                        if (!isNaN(val)) {
                            upsertData.push({
                                soc_code: socCode,
                                soc_title: 'Fetched Title',
                                state_abbr: targetState,
                                median_annual_salary: val,
                            });
                        }
                    } else {
                        console.warn(`No data points for ${socCode} in this series.`);
                    }
                }

                if (upsertData.length > 0) {
                    const { error: insertError } = await supabase.from('bls_salary_data').insert(upsertData);
                    if (insertError) console.error('Error inserting wages:', insertError);
                    else console.log(`Inserted ${upsertData.length} wage records for ${targetState}.`);
                }

                batchSuccess = true; // Exit retry loop

            } catch (err: any) {
                console.error('Error fetching wages batch:', err.message);
                batchSuccess = true; // Network error, dont retry infinitely
            }
        }

        if (!batchSuccess) {
            console.error("❌ All API keys exhausted or persistent error. Aborting.");
            process.exit(1);
        }

        // Politeness
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Wage fetch complete for ${targetState}.`);
}

fetchWages();
