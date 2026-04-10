import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import AuthProvider from '@/components/shared/AuthProvider';
import Toast from '@/components/shared/Toast';
import { ThemeProvider, ThemeScript } from '@/providers/ThemeProvider';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import ChatWidget from '@/components/chat/ChatWidget';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
    <html lang="mn" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#E8242C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Eseller" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toast />
            <InstallPrompt />
            <ChatWidget />
          </AuthProvider>
        </ThemeProvider>

        {/* Service Worker */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        `}</Script>

        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
