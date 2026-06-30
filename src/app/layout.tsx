import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import BlobBackground from '@/components/BlobBackground'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'pdku:arena — vote for your favorites',
  description: 'Reality TV style polling for plzdontkillus. Track public sentiment, vote daily, see who the audience loves.',
  openGraph: {
    title: 'pdku:arena — the people\'s court',
    description: 'Vote daily. Track sentiment. See who survives.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pdku:arena',
    description: 'Reality TV polling for plzdontkillus',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <BlobBackground />
        <Nav />
        <main className="relative z-[2] flex-1 pt-14">
          <div className="page-container">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  )
}
