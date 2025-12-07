
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) { throw new Error('Missing config'); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function report() {
    const tables = ['cip_soc_matrix', 'schools', 'programs', 'bls_salary_data'];

    console.log('--- Data Ingestion Report ---');
    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`${t}: ERROR - ${error.message} (Hint: ${error.hint || 'No hint'})`);
        } else {
            console.log(`${t}: ${count} rows`);
        }
    }
    console.log('-----------------------------');
}

report();
