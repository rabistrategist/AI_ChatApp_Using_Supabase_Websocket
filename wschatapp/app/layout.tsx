import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GeminiChat — AI Powered Chat',
  description: 'Chat with Gemini AI using real-time WebSocket messaging',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #BFDBFE',
              color: '#1e3a5f',
            },
            classNames: {
              success: 'border-blue-200 bg-blue-50',
              error: 'border-red-200 bg-red-50',
            },
          }}
        />
      </body>
    </html>
  )
}