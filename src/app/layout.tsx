// src/app/layout.tsx
import '../app/globals.css';
import { ReactNode } from 'react';
import Topbar from '@/components/Topbar';
import ThemeInitializer from '@/components/ThemeInitializer';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ThemeInitializer />
        <Topbar />
        {children}
      </body>
    </html>
  );
}
