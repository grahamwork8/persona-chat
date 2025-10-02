// /app/layout.tsx
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Header from '../app/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Persona Chat',
  description: 'Chat with custom personas powered by AI',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main className="min-h-screen bg-gray-50 text-gray-900">
            <Header />
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
