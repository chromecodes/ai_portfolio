// src/app/layout.tsx
import '../app/globals.css';
import { ReactNode } from 'react';
import ThemeInitializer from '@/components/ThemeInitializer';
import MainBg from '@/components/MainBg';
import Topbar from '@/components/UI/Topbar/Topbar';
import Footbar from '@/components/UI/Chatbar/Footbar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex flex-col min-h-screen">
        <ThemeInitializer />
        <MainBg />
        <Topbar />
        <div className="grow pt-16 pb-16">
          {children}
        </div>
        <Footbar />
      </body>
    </html>
  );
}
