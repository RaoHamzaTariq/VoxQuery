import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'University Voice Portal - AI Assistant',
  description: 'Voice-controlled university data assistant for administrators and stakeholders. Get instant insights about enrollment, attendance, GPA, and more.',
  keywords: ['university', 'voice assistant', 'AI', 'education', 'analytics', 'enrollment', 'student data'],
  authors: [{ name: 'University Portal Team' }],
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicons/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/favicons/favicon.ico' },
    ],
  },
  manifest: '/favicons/site.webmanifest',
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
