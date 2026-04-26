import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Conto Maluco AI - Seu Gibi de Histórias Bizarras',
  description: 'Crie contos épicos e bizarros com suas respostas "às cegas"! O jogo clássico agora com narração e superpoderes do Gemini 2.5 Flash.',
  keywords: ['PWA', 'IA', 'Gemini 2.5 Flash', 'Gibi', 'Livro de Histórias', 'Jogo', 'Criatividade', 'Educação'],
  authors: [{ name: 'Conto Maluco AI' }],
  openGraph: {
    title: 'Conto Maluco AI - O Jogo de Criar Histórias Bizarras',
    description: 'Você responde sem saber, a IA cria a confusão! Gere seu gibi personalizado, ouça a narração e divirta-se.',
    url: 'https://conto-maluco-ai.vercel.app',
    siteName: 'Conto Maluco AI',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Conto Maluco AI - Seu Livro de Histórias',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conto Maluco AI - Seu Livro de Histórias',
    description: 'Transforme respostas malucas em contos épicos com inteligência artificial!',
    images: ['/logo.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Conto Maluco',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  }
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
