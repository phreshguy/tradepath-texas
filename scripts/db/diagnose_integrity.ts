
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLinkage() {
    console.log("--- Checking Linkage Keys ---");

    // 1. Program CIP format
    const { data: p } = await supabase.from('programs').select('cip_code').limit(3);
    console.log("Programs CIP:", p.map(x => `"${x.cip_code}"`));

    // 2. Matrix CIP and SOC format
    const { data: m } = await supabase.from('cip_soc_matrix').select('cip_code, soc_code').limit(3);
    console.log("Matrix CIP:", m.map(x => `"${x.cip_code}"`));
    console.log("Matrix SOC:", m.map(x => `"${x.soc_code}"`));

    // 3. Wages SOC format
    const { data: w } = await supabase.from('bls_salary_data').select('soc_code').limit(3);
    console.log("Wages SOC:", w.map(x => `"${x.soc_code}"`));

    // 4. Try a manual join check
    // Pick one CIP from programs
    if (p.length > 0) {
        const targetCIP = p[0].cip_code;
        console.log(`\nAttempting Trace for CIP: ${targetCIP}`);

        // Find Matrix matches
        const { data: mat } = await supabase.from('cip_soc_matrix').select('soc_code').eq('cip_code', targetCIP);
        console.log(`... Found ${mat?.length || 0} Matrix matches.`);
        if (mat && mat.length > 0) {
            const targetSOC = mat[0].soc_code;
            console.log(`... Trace SOC: ${targetSOC}`);

            // Find Wage matches
            const { data: wa } = await supabase.from('bls_salary_data').select('*').eq('soc_code', targetSOC).limit(1);
            console.log(`... Found ${wa?.length || 0} Wage matches for this SOC.`);
        }
    }
}

checkLinkage();
