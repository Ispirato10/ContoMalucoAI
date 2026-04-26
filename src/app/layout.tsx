
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
        url: 'https://picsum.photos/seed/crazybooklogo/1200/630',
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
    images: ['https://picsum.photos/seed/crazybooklogo/1200/630'],
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
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23facc15' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3Ctext x='12' y='14' font-family='Arial' font-size='6' font-weight='bold' text-anchor='middle' fill='black'%3EAI%3C/text%3E%3C/svg%3E",
    apple: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23facc15' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3Ctext x='12' y='14' font-family='Arial' font-size='6' font-weight='bold' text-anchor='middle' fill='black'%3EAI%3C/text%3E%3C/svg%3E",
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
      </head>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
