import { AdGenerator } from '@/components/AdGenerator';
import { Sparkles, ArrowRight, Zap, Play } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header Premium */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline text-2xl font-bold text-white uppercase italic tracking-tighter">AdVision AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest transition-colors">Galeria</a>
            <a href="#" className="text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest transition-colors">Preços</a>
            <div className="h-6 w-px bg-white/10" />
            <button className="text-xs font-bold text-primary border border-primary/20 px-6 py-2 rounded-full hover:bg-primary/10 transition-all">SOU AGÊNCIA</button>
          </nav>
        </div>
      </header>

      {/* Hero Section Master */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-30" />
        <div className="container mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">O futuro do criativo publicitário chegou</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-bold text-white leading-[1.1] max-w-5xl mx-auto italic">
            Transforme links em <span className="text-primary italic underline decoration-primary/20">Campanhas de Elite</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-body italic">
            Nossa IA analisa seu produto, interpreta sua marca e gera anúncios com visual de estúdio prontos para converter. O padrão Apple agora ao seu alcance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button className="bg-primary text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3">
              COMEÇAR AGORA <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/5 text-white px-10 py-5 rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3">
              VER DEMO <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section className="container mx-auto px-4 pb-40">
        <AdGenerator />
      </section>

      {/* Footer Minimalista */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 opacity-40">
            <Zap className="w-4 h-4" />
            <span className="font-headline text-sm font-bold uppercase tracking-widest italic">AdVision AI</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">&copy; 2024 Design Criativo por Inteligência Analítica.</p>
        </div>
      </footer>
    </main>
  );
}
