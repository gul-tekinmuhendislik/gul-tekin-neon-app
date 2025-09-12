import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { syncHizmetlerIds, verifySyncedData } from '../lib/sync-markalar-hizmetler';

async function main() {
  console.log('Starting Markalar-Hizmetler sync process...');
  console.log('==========================================\n');
  
  try {
    // Run the sync
    const syncResult = await syncHizmetlerIds();
    
    console.log('\n=== Sync completed successfully! ==="');
    console.log(JSON.stringify(syncResult, null, 2));
    
    // Verify the synced data
    console.log('\n=== Verifying synced data... ==="');
    await verifySyncedData();
    
    console.log('\n✅ All operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during sync process:', error);
    process.exit(1);
  }
}

// Run the script
main();