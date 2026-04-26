import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  metadataBase: new URL('https://conto-maluco-ai.vercel.app'),
  title: 'Conto Maluco AI - Fábrica de Gibis Bizarras!',
  description: 'Você responde sem saber, o Gemini cria a confusão! Gere seu gibi personalizado e ouça a narração bizarra.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png?v=1', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png?v=1', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png?v=1',
    apple: '/logo.png?v=1',
  },
  openGraph: {
    title: 'Conto Maluco AI - Crie sua História Bizarra! 🚀',
    description: 'Responda perguntas às cegas e deixe a IA criar um gibi épico com narração! Experimente agora.',
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
    title: 'Conto Maluco AI - Sua Fábrica de Histórias!',
    description: 'Você não vai acreditar no que a IA criou com minhas respostas! Gere seu gibi também.',
    images: ['/logo.png'],
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
        <link rel="icon" type="image/png" href="/logo.png?v=1" />
        <link rel="shortcut icon" type="image/png" href="/logo.png?v=1" />
        <link rel="apple-touch-icon" href="/logo.png?v=1" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
