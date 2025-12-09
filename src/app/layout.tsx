// src/app/layout.tsx
import '../app/globals.css';
import { ReactNode } from 'react';
import ThemeInitializer from '@/components/ThemeInitializer';
import MainBg from '@/components/MainBg';
import Topbar from '@/components/UI/Topbar/Topbar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ThemeInitializer />
        <MainBg />
        <Topbar />
        {children}
      </body>
    </html>
  );
}
