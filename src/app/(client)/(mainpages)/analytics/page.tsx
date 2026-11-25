import AnalyticsDashboard from '@/features/Analytics/AnalyticsDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | Portfolio',
  description: 'Real-time visitor analytics, navigation routes, scroll engagement, and text selection telemetry.',
};

export default function AnalyticsPage() {
  return (
    <main className="w-full min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-mac bg-neutral-950 text-neutral-100">
      <AnalyticsDashboard />
    </main>
  );
}
