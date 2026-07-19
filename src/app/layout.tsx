// src/app/layout.tsx
import '../app/globals.css';
import '../app/global.scss';

import { ReactNode } from 'react';
import ThemeInitializer from '@/components/ThemeInitializer';
import Topbar from '@/features/Topbar/Topbar';
import Footbar from '@/features/Chatbar/Footbar';
import { Inter } from 'next/font/google'
import RouteTransitionController from '@/components/animation/RouteTransitionController';
import AnimationTester from '@/components/animation/AnimationTester';
import { useCursor } from '@/lib/useCursor';
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: ReactNode }) {


  return (
    <html lang="en" className={inter.className}>
      <body className="bg-primary-background text-font-color antialiased h-full flex flex-col min-h-screen max-h-screen">
        <ThemeInitializer />
        {/* <MainBg /> */}
        <Topbar />
        <div className="flex flex-col grow overflow-auto scrollbar-mac min-h-0">
          {children}
        </div>
        <Footbar />
        <RouteTransitionController />
        <AnimationTester />
      </body>
    </html>
  );
}
