import { AdGenerator } from '@/components/AdGenerator';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-1.5 rounded-lg shadow-lg shadow-accent/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline text-2xl tracking-tight font-bold text-white">AdVision AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Como funciona</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Modelos</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Preços</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 text-white max-w-4xl mx-auto leading-tight">
          Crie Campanhas Publicitárias Profissionais <span className="text-accent italic">Instantaneamente</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-body">
          Envie seu produto, escolha um tema e deixe nossa IA gerar visuais de estúdio otimizados para qualquer plataforma.
        </p>
      </section>

      {/* Generator Component */}
      <section className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <AdGenerator />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-border/40 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">&copy; 2024 AdVision AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
