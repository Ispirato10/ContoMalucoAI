import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  metadataBase: new URL('https://conto-maluco-ai.vercel.app'),
  title: 'Conto Maluco AI - Seu Gibi de Histórias Bizarras',
  description: 'Transforme respostas malucas em contos épicos com inteligência artificial!',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Conto Maluco AI',
    description: 'Você responde sem saber, a IA cria a confusão! Gere seu gibi e ouça a narração.',
    url: 'https://conto-maluco-ai.vercel.app',
    siteName: 'Conto Maluco AI',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Conto Maluco AI',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conto Maluco AI',
    description: 'Histórias bizarras e divertidas geradas por IA!',
    images: ['/logo.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Conto Maluco',
  },
};

export const viewport: Viewport = {
  themeColor: '#f12711',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Alegreya:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}