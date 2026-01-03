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

    // --- EXPANSION: HIGH-VALUE TRADES (Tech, Medical, Services) ---

    // 11: Tech & Cybersecurity
    { cip_code: '11', soc_code: '15-1212', title: 'Information Security Analysts' },
    { cip_code: '11.0901', soc_code: '15-1151', title: 'Computer Network Support Specialists' },
    { cip_code: '11.1003', soc_code: '15-1212', title: 'Information Security Analysts' },

    // 12: Cosmetology & Personal Services
    { cip_code: '12', soc_code: '39-5012', title: 'Hairdressers, Hairstylists, and Cosmetologists' },
    { cip_code: '12.0401', soc_code: '39-5012', title: 'Cosmetology/Cosmetologist' },
    { cip_code: '12.0402', soc_code: '39-5011', title: 'Barbers' },

    // 51: Healthcare (Nursing, Dental, Medical Assist)
    { cip_code: '51', soc_code: '29-1141', title: 'Registered Nurses' },
    // 4-Digit API Format Matches
    { cip_code: '5106', soc_code: '31-9091', title: 'Dental Assistants' },
    { cip_code: '5108', soc_code: '31-9092', title: 'Medical Assistants' },
    { cip_code: '5138', soc_code: '29-1141', title: 'Registered Nurses' },
    { cip_code: '5139', soc_code: '29-2061', title: 'Licensed Practical and Licensed Vocational Nurses' },

    // 6-Digit Standard Matches (Keep for safety)
    { cip_code: '51.3801', soc_code: '29-1141', title: 'Registered Nurses' },
    { cip_code: '51.3901', soc_code: '29-2061', title: 'Licensed Practical and Licensed Vocational Nurses' },
    { cip_code: '51.0601', soc_code: '31-9091', title: 'Dental Assistants' },
    { cip_code: '51.0801', soc_code: '31-9092', title: 'Medical Assistants' },
    { cip_code: '51.0904', soc_code: '29-2041', title: 'Emergency Medical Technicians' },
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
