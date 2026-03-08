import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'VoxQuery - Talk to Your Database. Get Instant Answers.',
  description: 'Interact with your database using natural voice commands. Get instant insights, charts, and analytics through conversational AI powered by Google Gemini 2.5.',
  keywords: ['database', 'voice assistant', 'AI', 'analytics', 'SQL', 'Gemini', 'data visualization', 'VoxQuery'],
  authors: [{ name: 'VoxQuery Team' }],
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'VoxQuery - Voice-Controlled Database Assistant',
    description: 'Talk to your database and get instant answers with voice-controlled AI analytics.',
    type: 'website',
    images: ['/Logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoxQuery',
    description: 'Talk to your database and get instant answers.',
    images: ['/Logo.png'],
  },
  icons: {
    icon: '/favicons/favicon.ico',
    apple: '/favicons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-[#0f172a] text-slate-100 min-h-screen h-screen-safe overflow-hidden">
        {children}
      </body>
    </html>
  );
}
