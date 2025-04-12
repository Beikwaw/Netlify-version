import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const poppins = Poppins({
  subsets: ['latin'],
  preload: true,
  weight: ['400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'My Domain Student Living',
  description: 'Student accommodation management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
