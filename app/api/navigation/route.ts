import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const menuItems = await sql`
      SELECT id, title, href, order_index, icon, target
      FROM navigation_menu 
      WHERE is_active = true AND parent_id IS NULL
      ORDER BY order_index ASC
    `;
    
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation menu' },
      { status: 500 }
    );
  }
}