import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get all parent menu items
    const parentItems = await sql`
      SELECT id, title, href, order_index, icon, target
      FROM navigation_menu
      WHERE is_active = true AND parent_id IS NULL
      ORDER BY order_index ASC
    `;

    // Get all submenu items
    const subItems = await sql`
      SELECT id, title, href, order_index, icon, target, parent_id
      FROM navigation_menu
      WHERE is_active = true AND parent_id IS NOT NULL
      ORDER BY parent_id, order_index ASC
    `;

    // Build hierarchical menu structure
    const menuItems = parentItems.map((parent: any) => {
      const children = subItems.filter((sub: any) => sub.parent_id === parent.id);
      return {
        ...parent,
        children: children.length > 0 ? children : undefined
      };
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation menu' },
      { status: 500 }
    );
  }
}