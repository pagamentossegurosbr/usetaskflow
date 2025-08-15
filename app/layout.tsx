import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/Providers';
import { MainNavigation } from '@/components/MainNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow Notch',
  description: 'A beautiful and modern todo list application',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --background: 0 0% 3.9%;
              --foreground: 0 0% 98%;
              --card: 0 0% 3.9%;
              --card-foreground: 0 0% 98%;
              --popover: 0 0% 3.9%;
              --popover-foreground: 0 0% 98%;
              --primary: 0 0% 98%;
              --primary-foreground: 0 0% 9%;
              --secondary: 0 0% 14.9%;
              --secondary-foreground: 0 0% 98%;
              --muted: 0 0% 14.9%;
              --muted-foreground: 0 0% 63.9%;
              --accent: 0 0% 14.9%;
              --accent-foreground: 0 0% 98%;
              --destructive: 0 62.8% 30.6%;
              --destructive-foreground: 0 0% 98%;
              --border: 0 0% 14.9%;
              --input: 0 0% 14.9%;
              --ring: 0 0% 83.1%;
              --chart-1: 220 70% 50%;
              --chart-2: 160 60% 45%;
              --chart-3: 30 80% 55%;
              --chart-4: 280 65% 60%;
              --chart-5: 340 75% 55%;
              --radius: 0.5rem;
            }
            * {
              border-color: hsl(var(--border));
            }
            body {
              background-color: hsl(var(--background));
              color: hsl(var(--foreground));
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            .bio-selectable {
              -webkit-user-select: text;
              -moz-user-select: text;
              -ms-user-select: text;
              user-select: text;
            }
          `
        }} />
      </head>
      <body 
        className={`${inter.className} dark bg-[#010101] text-foreground min-h-screen relative overflow-y-auto`}
        suppressHydrationWarning
      >
        {/* Background otimizado para performance */}
        <div className="fixed inset-0 bg-[#010101] z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-purple-500/8 to-purple-500/12"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/18 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10">
          <Providers>
            <MainNavigation />
            {children}
            <Toaster />
          </Providers>
        </div>
      </body>
    </html>
  );
}