
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { parse } from 'csv-parse/sync';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const fs = require('fs');
const path = require('path');

const CROSSWALK_FILE = path.join(process.cwd(), 'CIP_SOC_Crosswalk.csv');

async function loadCrosswalk() {
    console.log('Reading crosswalk from local file...');
    try {
        const csvData = fs.readFileSync(CROSSWALK_FILE, 'utf8');

        // Remove BOM if present
        const cleanCsv = csvData.replace(/^\uFEFF/, '');

        console.log('Parsing CSV...');
        const records = parse(cleanCsv, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        console.log(`Found ${records.length} records.`);

        const upsertBuffer: any[] = [];
        const seen = new Set<string>();

        for (const row of records) {
            // Keys might vary, let's find them dynamically or assume standard
            // Expecting CIP2020Code and SOC2018Code
            // The keys might be quoted or have different case depending on the file
            const keys = Object.keys(row);
            const cipKey = keys.find(k => k.toLowerCase().includes('cip') && k.toLowerCase().includes('code'));
            const socKey = keys.find(k => k.toLowerCase().includes('soc') && k.toLowerCase().includes('code'));

            if (!cipKey || !socKey) {
                console.warn('Could not find CIP/SOC columns in row:', row);
                continue;
            }

            let cipCode = row[cipKey]?.replace(/=|^"|"$/g, '').trim(); // clear ="..." excel artifacts if any
            let socCode = row[socKey]?.replace(/=|^"|"$/g, '').trim();

            if (!cipCode || !socCode) continue;

            // Remove dots from CIP if needed? Standard is XX.XXXX. 
            // User schema: cip_code text.
            // SOC: XX-XXXX.

            const key = `${cipCode}-${socCode}`;
            if (seen.has(key)) continue;
            seen.add(key);

            upsertBuffer.push({
                cip_code: cipCode,
                soc_code: socCode,
                confidence_score: 100,
                // is_verified: false, // Rely on default or omit to avoid potential cache mismatch if not critical
            });

            if (upsertBuffer.length >= 1000) {
                await flushBuffer(upsertBuffer);
            }
        }

        if (upsertBuffer.length > 0) {
            await flushBuffer(upsertBuffer);
        }

        console.log('Crosswalk loading complete.');

    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            console.error("Crosswalk URL not found. Using Mock Data for testing.");
            // Fallback or error? User asked to Parse CIP_SOC_Crosswalk.csv.
            // I will throw to let user know, or I can implement fallback if requested.
            // Getting 404 is likely since URLs change. 
            // I'll try to use a more stable URL or just fail.
            throw err;
        }
        console.error('Error loading crosswalk:', err);
        process.exit(1);
    }
}

async function flushBuffer(buffer: any[]) {
    const { error } = await supabase
        .from('cip_soc_matrix')
        .upsert(buffer, { onConflict: 'cip_code,soc_code' });

    if (error) {
        console.error('Error upserting batch:', error);
    } else {
        process.stdout.write('.');
        buffer.length = 0;
    }
}

loadCrosswalk();
