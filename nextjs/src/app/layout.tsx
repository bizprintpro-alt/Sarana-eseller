import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/shared/AuthProvider';
import Toast from '@/components/shared/Toast';

export const metadata: Metadata = {
  title: 'eseller.mn — Борлуулагчтай л борлуулалт байна',
  description:
    'eseller.mn — Монголын seller-powered marketplace. Барааны эзэн + Борлуулагч = Бодит борлуулалт.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <AuthProvider>
          {children}
          <Toast />
        </AuthProvider>
      </body>
    </html>
  );
}
