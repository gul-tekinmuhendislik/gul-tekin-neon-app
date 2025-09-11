require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';

Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

const base = Airtable.base(AIRTABLE_BASE_ID);

async function countProjects() {
  try {
    console.log('Counting projects in Airtable...\n');
    
    const records = [];
    
    await base('Projeler')
      .select({
        view: 'Grid view',
        fields: ['Proje Adı']
      })
      .eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords);
        fetchNextPage();
      });
    
    console.log(`Total projects in Airtable: ${records.length}`);
    console.log(`Currently synced in Neon: 236`);
    console.log(`Remaining to sync: ${records.length - 236}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

countProjects();