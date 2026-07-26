import { NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/analyticsDb';

export async function GET() {
  try {
    const data = await getAnalyticsData();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `portfolio_analytics_backup_${dateStr}.json`;

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create backup' }, { status: 500 });
  }
}
