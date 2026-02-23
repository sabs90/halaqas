import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://cseuihnfszobjbvysgfm.supabase.co';
const SERVICE_ROLE_KEY = readFileSync('.env.local', 'utf8')
  .split('\n')
  .find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))
  ?.split('=')[1]
  ?.trim();

if (!SERVICE_ROLE_KEY) {
  console.error('Could not read SUPABASE_SERVICE_ROLE_KEY from .env.local');
  process.exit(1);
}

const sql = readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8');

// Split into individual statements and execute one at a time
// The Supabase Management API doesn't support raw SQL via REST,
// but we can use the pg-meta endpoint
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
});

// If RPC doesn't work, try the SQL query endpoint (available in newer Supabase)
// Actually, let's use the Supabase client to create a function first, then call it

// Alternative: Use the database URL directly
// For Supabase, the pg endpoint is available at:
const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

if (pgResponse.ok) {
  console.log('Migration executed successfully!');
  const result = await pgResponse.json();
  console.log(result);
} else {
  console.log('pg/query endpoint not available, status:', pgResponse.status);
  console.log('Response:', await pgResponse.text());
  console.log('\n--- FALLBACK ---');
  console.log('Please run the migration manually:');
  console.log('1. Go to https://supabase.com/dashboard/project/cseuihnfszobjbvysgfm/sql');
  console.log('2. Paste the contents of supabase/migrations/001_initial_schema.sql');
  console.log('3. Click "Run"');
}
