import { StoryGame } from '@/components/StoryGame';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <header className="text-center mb-12 space-y-4">
        <div className="inline-block bg-accent comic-border p-4 -rotate-2">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter comic-text">
            Conto Maluco AI
          </h1>
        </div>
        <p className="text-lg font-bold text-primary flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" /> A brincadeira de papel agora com superpoderes!
        </p>
      </header>

      <div className="relative">
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full comic-border flex items-center justify-center -rotate-12 z-10">
          <BookOpen className="w-6 h-6 text-black" />
        </div>
        <StoryGame />
      </div>

      <footer className="mt-12 text-center text-sm font-bold opacity-60 italic">
        Responda às perguntas e deixe a IA criar a confusão!
      </footer>
    </main>
  );
}