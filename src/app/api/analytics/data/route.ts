import { NextResponse } from 'next/server';
import { getAnalyticsData, clearAnalyticsData } from '@/lib/analyticsDb';

export async function GET() {
  try {
    const data = await getAnalyticsData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearAnalyticsData();
    return NextResponse.json({ success: true, message: 'Analytics data cleared' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to clear analytics' }, { status: 500 });
  }
}
