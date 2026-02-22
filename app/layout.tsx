import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'University Voice Portal - AI Assistant',
  description: 'Voice-controlled university data assistant for administrators and stakeholders. Get instant insights about enrollment, attendance, GPA, and more.',
  keywords: ['university', 'voice assistant', 'AI', 'education', 'analytics', 'enrollment', 'student data'],
  authors: [{ name: 'University Portal Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0f172a',
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
