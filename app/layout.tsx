// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Persona Chat',
  description: 'Chat with custom AI personalities',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();

  return (
    <ClerkProvider initialState={{ cookies: cookieStore }}>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="p-4">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
