import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://cseuihnfszobjbvysgfm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZXVpaG5mc3pvYmpidnlzZ2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQzODMzMywiZXhwIjoyMDg3MDE0MzMzfQ.FCYRUjostQRbpAMUcaXpWlRVGskC8Gfr6kvYnDyhpXY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Reading migration file from:', migrationPath);
    console.log('');
    console.log('Instructions:');
    console.log('');
    console.log('Unfortunately, the Supabase JavaScript client does not provide a direct method');
    console.log('to execute raw SQL statements. To run this migration, please:');
    console.log('');
    console.log('1. Go to your Supabase Dashboard: https://app.supabase.com');
    console.log('2. Select your project (cseuihnfszobjbvysgfm)');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the entire contents of this file:');
    console.log('   /Users/sabs/projects/halaqas/supabase/migrations/001_initial_schema.sql');
    console.log('6. Click "Run" to execute the migration');
    console.log('');
    console.log('The migration SQL is ready to be pasted. Size: ' + sqlContent.length + ' bytes');
    console.log('');
    console.log('Migration file path: ' + migrationPath);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

runMigration();
