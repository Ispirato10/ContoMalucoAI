import { StoryGame } from '@/components/StoryGame';
import { InstallPWA } from '@/components/InstallPWA';
import { ShareApp } from '@/components/ShareApp';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto pt-20 md:pt-12">
      <header className="text-center mb-12 space-y-4 no-print">
        <div className="inline-block bg-accent comic-border p-6 -rotate-2 relative">
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter comic-text text-black">
            Conto Maluco AI
          </h1>
        </div>
        <p className="text-lg md:text-xl font-bold text-primary flex items-center justify-center gap-3 italic">
          Sua fábrica bizarra de gibis com Gemini 2.5 Flash!
        </p>
      </header>

      <div className="relative">
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-yellow-400 rounded-full comic-border flex items-center justify-center -rotate-12 z-10 no-print">
          <BookOpen className="w-8 h-8 text-black" />
        </div>
        <StoryGame />
      </div>

      <ShareApp />

      <footer className="mt-8 text-center text-sm font-bold opacity-60 italic no-print pb-24">
        Responda às perguntas e deixe a inteligência artificial criar a confusão!
      </footer>

      <InstallPWA />
    </main>
  );
}
