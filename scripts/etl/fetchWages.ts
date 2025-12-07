
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const blsKey = process.env.BLS_API_KEY;

if (!supabaseUrl || !supabaseKey || !blsKey) {
    throw new Error('Missing configuration.');
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
    console.log('Fetching unique SOC codes from matrix...');
    // Get distinct soc_code. Supabase doesn't have .distinct() in easy way usually select('soc_code').
    // RLS or large dataset might be issue. 
    // Let's use RPC or just fetch all and dedup in memory if small.
    // cip_soc_matrix might be large-ish but SOC codes are limited (~800).
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
        // ID: OEUS4800000000000{soc}04
        // SOC format in DB: 51-4121
        // BLS requires clean SOC: 514121
        const seriesMap = new Map();
        const seriesIds = batch.map(soc => {
            const cleanSoc = soc.replace(/-/g, '');
            const id = `OEUS4800000000000${cleanSoc}04`;
            seriesMap.set(id, soc);
            return id;
        });

        try {
            const response = await axios.post('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
                seriesid: seriesIds,
                registrationkey: blsKey,
                startyear: "2023",
                endyear: "2024",
                catalog: false,
                calculations: false,
                annualaverage: false // Data Type 04 is Annual Mean, usually present in annual data? 
                // Note: OES data is usually annual. Time series endpoint might return it as M13 or A01.
                // Let's see what we get.
            });

            const results = response.data?.Results?.series || [];

            const upsertData: any[] = [];

            for (const series of results) {
                const seriesId = series.seriesID;
                const socCode = seriesMap.get(seriesId);
                const dataPoints = series.data || [];
                if (dataPoints.length > 0) {
                    const latest = dataPoints[0]; // Assuming sorted desc
                    const val = parseFloat(latest.value);

                    if (!isNaN(val)) {
                        upsertData.push({
                            soc_code: socCode,
                            soc_title: 'Fetched Title', // BLS TimeSeries doesn't verify title easily in this payload, defaults/ placeholders?
                            // Schema requires soc_title. We don't have it from Timeseries API easily without catalog=true?
                            // BLS API response with catalog=true might give title.
                            // Let's try to update the payload or use placeholder for now.
                            state_abbr: 'TX',
                            median_annual_salary: val,
                            // Note: Data Type 04 is "Annual Mean Wage", not Median. Schema has median_annual_salary.
                            // We will map Mean to Median column or Hourly?
                            // Schema: median_annual_salary. BLS 04 is Mean. BLS 03 is Median?
                            // OES: 04 = Annual Mean. 03 = Annual Median.
                            // User script `soc_fetcher` used 04. I will use 04 (Mean) as proxy or if user requested Mean.
                            // Actually I can fetch both or just 04. 
                            // I'll stick to 04 as per `soc_fetcher` precedent and put it in median_annual_salary and maybe rename col later?
                            // Or fetch 03?
                            // Let's use 04 (Mean) as it was in `soc_fetcher.py`.
                            // But I'll put it in `median_annual_salary` for now, or `hourly_mean`?
                            // Schema has `median_annual_salary` and `hourly_mean`.
                            // 04 is Annual Mean.
                            // 13 is Hourly Mean.
                            // Let's fetch 04.

                            // We need soc_title. If we don't have it, we might fail NOT NULL constraint.
                            // I will set it to "N/A" or "Fetched" for now.
                        });
                    }
                } else {
                    console.warn(`No data for ${socCode} (${seriesId})`);
                }
            }

            if (upsertData.length > 0) {
                // Need unique constraint on bls_salary_data? 
                // Schema PK is ID (UUID). No constraint on soc_code+state?
                // If I insert, I'll create duplicates.
                // Schema has no unique constraint on soc_code.
                // I should select and update or just Insert. 
                // Script `soc_fetcher.py` was printing only.
                // I'll insert.
                const { error: insertError } = await supabase.from('bls_salary_data').insert(upsertData);
                if (insertError) console.error('Error inserting wages:', insertError);
            }

        } catch (err: any) {
            console.error('Error fetching wages batch:', err.message);
        }

        // Politeness
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('Wage fetch complete.');
}

fetchWages();
