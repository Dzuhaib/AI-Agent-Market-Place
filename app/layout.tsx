import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseProvider } from '@/components/FirebaseProvider';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';
import Onboarding from '@/components/Onboarding';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Agent Marketplace',
  description: 'Build, sell, and use specialized AI agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
          <Onboarding />
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster position="top-center" />
        </FirebaseProvider>
      </body>
    </html>
  );
}
