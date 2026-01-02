import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// "The Big Three" Trade Mappings (CIP to SOC)
// These are standard US Dept of Education / BLS crosswalk values
const MAPPINGS = [
    // 46: Construction (Electricians, Plumbers, Carpenters)
    { cip_code: '46', soc_code: '47-2061', title: 'Construction Laborers' },
    { cip_code: '46.0302', soc_code: '47-2111', title: 'Electricians' },
    { cip_code: '46.0302', soc_code: '47-3013', title: 'Helpers--Electricians' },
    { cip_code: '46.0503', soc_code: '47-2152', title: 'Plumbers, Pipefitters, and Steamfitters' },
    { cip_code: '46.0201', soc_code: '47-2031', title: 'Carpenters' },

    // 47: Mechanic/Repair (HVAC, Auto, Diesel)
    { cip_code: '47', soc_code: '49-9071', title: 'Maintenance and Repair Workers' },
    { cip_code: '47.0201', soc_code: '49-9021', title: 'HVAC/R Mechanics' },
    { cip_code: '47.0604', soc_code: '49-3023', title: 'Automotive Service Technicians' },
    { cip_code: '47.0605', soc_code: '49-3031', title: 'Diesel Engine Specialists' },

    // 48: Precision Production (Welding, Machining)
    { cip_code: '48', soc_code: '51-4121', title: 'Welders, Cutters, Solderers' },
    { cip_code: '48.0508', soc_code: '51-4121', title: 'Welding Technology' },
    { cip_code: '48.0501', soc_code: '51-4041', title: 'Machinists' },
    { cip_code: '48.0503', soc_code: '51-4011', title: 'CNC Tool Programmers' },
];

async function fixLinkage() {
    console.log('🔗 Starting Linkage Repair (Matrix Population)...');

    const payload = MAPPINGS.map(m => ({
        cip_code: m.cip_code,
        soc_code: m.soc_code,
        confidence_score: 100,
    }));

    // Sequential UPSERT to avoid crashing on missing constraints
    for (const item of payload) {
        const { error } = await supabase
            .from('cip_soc_matrix')
            .upsert(item, { onConflict: 'cip_code,soc_code' });

        if (error) {
            console.error(`\n❌ Error upserting ${item.cip_code}-${item.soc_code}:`, error.message);
        } else {
            process.stdout.write('.');
        }
    }

    console.log('\n✅ Linkage table populated with valid Trade Crosswalks.');
}

fixLinkage();
