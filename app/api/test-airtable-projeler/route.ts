import { NextResponse } from 'next/server';
import { getAllProjeler } from '@/lib/airtable-projeler-client';

export async function GET() {
  try {
    const records = await getAllProjeler();
    
    // Get first 3 records with their field names
    const sample = records.slice(0, 3).map(record => ({
      id: record.id,
      fieldNames: Object.keys(record.fields || {}),
      fields: record.fields,
    }));
    
    // Get all unique field names
    const allFieldNames = new Set<string>();
    records.forEach(record => {
      Object.keys(record.fields || {}).forEach(field => {
        allFieldNames.add(field);
      });
    });
    
    return NextResponse.json({
      success: true,
      totalRecords: records.length,
      uniqueFields: Array.from(allFieldNames),
      fieldCount: allFieldNames.size,
      sampleRecords: sample,
    });
  } catch (error) {
    console.error('Error testing Airtable:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}