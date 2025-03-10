import './globals.css';
import '@fontsource-variable/vazirmatn/index.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Derakhte Kherad',
  description: 'Educational Platform for Farsi/German Language Institution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
        <Providers>
          <div className="flex-grow">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
