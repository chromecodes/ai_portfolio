// src/app/layout.tsx
import '../app/globals.css';
import { ReactNode } from 'react';
import ThemeInitializer from '@/components/ThemeInitializer';
import MainBg from '@/components/MainBg';
import Topbar from '@/components/UI/Topbar/Topbar';
import Footbar from '@/components/UI/Chatbar/Footbar';
import { Inter } from 'next/font/google'
import { TransitionProvider } from '@/components/animation/PageTransitionProvider';
import RouteTransitionController from '@/components/animation/RouteTransitionController';
import AnimationTester from '@/components/animation/AnimationTester';
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-background text-fontColor antialiased h-full flex flex-col min-h-screen">
        <ThemeInitializer />
        {/* <MainBg /> */}
        <Topbar />
        <div className="flex flex-col grow min-h-0">
          {children}
        </div>
        <Footbar />
        <RouteTransitionController />
        <AnimationTester />
      </body>
    </html>
  );
}
