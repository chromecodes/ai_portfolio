import AnalyticsDashboard from '@/features/Analytics/AnalyticsDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | Portfolio',
  description: 'Real-time visitor analytics, navigation routes, scroll engagement, and text selection telemetry.',
};

export default function AnalyticsPage() {
  return (
    <main className="w-full min-h-screen bg-primary-background">
      <AnalyticsDashboard />
    </main>
  );
}
