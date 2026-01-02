
import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars
// Load env vars explicitly from root
const envPath = path.join(process.cwd(), '.env');
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

async function run() {
    console.log("Available Env Keys:", Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')));
    const candidates = Object.keys(process.env).filter(k => k.includes('URL') || k.includes('DB') || k.includes('POSTGRES'));
    console.log("Candidate Keys:", candidates);

    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL not found in .env");
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        const viewPath = path.join(process.cwd(), 'database', 'views.sql');
        const sql = fs.readFileSync(viewPath, 'utf8');

        console.log("Applying view update...");
        await client.query(sql);
        console.log("Successfully updated 'verified_roi_listings' view.");

    } catch (err) {
        console.error("Error applying view update:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
