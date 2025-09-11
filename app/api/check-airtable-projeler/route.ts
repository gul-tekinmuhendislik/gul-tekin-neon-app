import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';

// Configure Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

export async function GET() {
  try {
    if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Airtable configuration missing',
      }, { status: 500 });
    }

    const base = Airtable.base(AIRTABLE_BASE_ID);
    const fieldNames = new Set<string>();
    const sampleRecords: { id: string; fields: Record<string, unknown> }[] = [];

    await new Promise((resolve, reject) => {
      base(AIRTABLE_TABLE_ID_PROJELER)
        .select({
          maxRecords: 5,
          view: 'Grid view',
        })
        .eachPage(
          (pageRecords, fetchNextPage) => {
            pageRecords.forEach((record) => {
              // Collect all field names
              Object.keys(record.fields).forEach(field => fieldNames.add(field));
              
              // Store sample records
              sampleRecords.push({
                id: record.id,
                fields: record.fields,
              });
            });
            fetchNextPage();
          },
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          }
        );
    });

    // Check field types and sample values
    const fieldAnalysis: Record<string, unknown> = {};
    fieldNames.forEach(fieldName => {
      const samples = sampleRecords
        .map(r => (r.fields as Record<string, unknown>)[fieldName])
        .filter(v => v !== undefined && v !== null)
        .slice(0, 3);
      
      fieldAnalysis[fieldName] = {
        type: samples.length > 0 ? typeof samples[0] : 'unknown',
        isArray: Array.isArray(samples[0]),
        samples: samples,
        hasValues: samples.length > 0,
      };
    });

    return NextResponse.json({
      success: true,
      tableName: AIRTABLE_TABLE_ID_PROJELER,
      totalFields: fieldNames.size,
      fields: Array.from(fieldNames),
      fieldAnalysis,
      sampleRecords: sampleRecords.slice(0, 2).map(r => ({
        id: r.id,
        fieldCount: Object.keys(r.fields as Record<string, unknown>).length,
        fields: r.fields,
      })),
    });
  } catch (error) {
    console.error('Error checking Airtable schema:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}