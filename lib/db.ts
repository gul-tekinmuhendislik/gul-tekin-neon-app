import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local if not already loaded
if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), '.env.local') });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export const sql = neon(process.env.DATABASE_URL);