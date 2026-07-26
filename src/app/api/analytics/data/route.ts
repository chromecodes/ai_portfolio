import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData, clearAnalyticsData } from '@/lib/analyticsDb';
import { verifyAuth } from '@/lib/analyticsAuth';

export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized access to analytics data' }, { status: 401 });
  }

  try {
    const data = await getAnalyticsData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized access to analytics data' }, { status: 401 });
  }

  try {
    await clearAnalyticsData();
    return NextResponse.json({ success: true, message: 'Analytics data cleared' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to clear analytics' }, { status: 500 });
  }
}
