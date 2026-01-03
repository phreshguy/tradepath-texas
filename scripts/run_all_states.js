
const { execSync } = require('child_process');

// List of state abbreviations (50 States + DC)
// List of state abbreviations (Remaining 41 States)
// Removed Completed: AL, AK, AZ, AR, CA, CO, CT, DE, DC, FL
const STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
    "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
    "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI",
    "WY"
];

// Helper for synchronous sleep to block the loop
function sleep(ms) {
    const sab = new SharedArrayBuffer(4);
    const view = new Int32Array(sab);
    Atomics.wait(view, 0, 0, ms);
}

console.log(`Starting National Wage Data Ingestion for ${STATES.length} remaining states...`);

for (const state of STATES) {
    console.log("------------------------------------------------");
    console.log(`Running fetchWages.ts for STATE: ${state}`);
    console.log("------------------------------------------------");

    try {
        // Execute the script and inherit stdio to show streaming output
        // Using npx tsx directly
        execSync(`npx tsx scripts/etl/fetchWages.ts --state=${state}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`ERROR: Failed to fetch wages for ${state}. Continuing to next state...`);
        console.error(error.message);
    }

    console.log(`Finished ${state}.`);
    console.log("Sleeping for 5 seconds to respect API Rate Limits...");

    // 5 seconds sleep (Reduced from 5 mins)
    sleep(5000);
}

console.log("National Data Ingestion Complete.");
