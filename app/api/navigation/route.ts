import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all parent menu items
    const parentItems = await prisma.navigation_menu.findMany({
      where: {
        is_active: true,
        parent_id: null
      },
      orderBy: {
        order_index: 'asc'
      }
    });

    // Get all submenu items
    const subItems = await prisma.navigation_menu.findMany({
      where: {
        is_active: true,
        parent_id: { not: null }
      },
      orderBy: [
        { parent_id: 'asc' },
        { order_index: 'asc' }
      ]
    });

    // Build hierarchical menu structure
    const menuItems = parentItems.map((parent) => {
      const children = subItems.filter((sub) => sub.parent_id === parent.id);
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