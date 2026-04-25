'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateCrazyStory, type StoryOutput } from '@/ai/flows/generate-crazy-story';
import { generateComicVisual } from '@/ai/flows/generate-comic-visual';
import { Loader2, Send, RotateCcw, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QUESTIONS = [
  "Quem é o personagem principal?",
  "Onde ele(a) está?",
  "O que ele(a) está fazendo de estranho?",
  "Quem apareceu de repente?",
  "O que essa pessoa disse?",
  "Como tudo terminou de forma absurda?",
];

export function StoryGame() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryOutput | null>(null);
  const [comicImage, setComicImage] = useState<string | null>(null);

  const handleNext = () => {
    if (!currentAnswer.trim()) return;
    
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      processFinalStory(newAnswers);
    }
  };

  const processFinalStory = async (finalAnswers: string[]) => {
    setLoading(true);
    try {
      const story = await generateCrazyStory({ answers: finalAnswers });
      setResult(story);
      
      const image = await generateComicVisual(story.imagePrompt);
      setComicImage(image);
      
      toast({ title: "História Gerada!", description: "Prepare-se para rir!" });
    } catch (error) {
      toast({ 
        title: "Ops!", 
        description: "A IA se confundiu com tanta maluquice. Tente de novo!", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer('');
    setResult(null);
    setComicImage(null);
  };

  if (loading) {
    return (
      <Card className="comic-border p-12 text-center space-y-6 bg-white">
        <div className="relative inline-block">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs uppercase">AI</div>
        </div>
        <h2 className="text-2xl font-black comic-text">Misturando as respostas no caldeirão...</h2>
        <p className="italic text-muted-foreground">Desenhando os quadrinhos e escrevendo as piadas!</p>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="space-y-8 animate-in zoom-in-95 duration-500">
        <Card className="comic-border bg-white overflow-hidden">
          <div className="bg-primary p-4 text-white text-center border-b-4 border-black">
            <h2 className="text-3xl font-black uppercase comic-text">{result.title}</h2>
          </div>
          <CardContent className="p-8 space-y-8 paper-texture">
            {comicImage && (
              <div className="comic-border bg-white p-2 rotate-1 mx-auto max-w-md">
                <img src={comicImage} alt="Cena do gibi" className="w-full h-auto border-2 border-black" />
              </div>
            )}
            
            <div className="prose prose-lg max-w-none font-bold comic-text text-xl leading-relaxed whitespace-pre-wrap">
              {result.fullStory}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center no-print">
          <Button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/90 comic-border h-12 px-8 font-black uppercase">
            <Printer className="w-5 h-5 mr-2" /> Imprimir Gibi (PDF)
          </Button>
          <Button onClick={restart} variant="outline" className="comic-border h-12 px-8 font-black uppercase">
            <RotateCcw className="w-5 h-5 mr-2" /> Jogar de Novo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="comic-border bg-white overflow-hidden">
      <div className="bg-secondary p-4 text-white flex justify-between items-center border-b-4 border-black">
        <span className="font-black uppercase tracking-widest text-sm">Pergunta {currentStep + 1} de {QUESTIONS.length}</span>
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full border border-black ${i <= currentStep ? 'bg-accent' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
      <CardContent className="p-8 md:p-12 space-y-8">
        <h2 className="text-3xl md:text-4xl font-black comic-text text-center text-black">
          {QUESTIONS[currentStep]}
        </h2>
        
        <div className="space-y-4">
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            placeholder="Digite aqui o que vier na cabeça..."
            className="h-16 text-xl border-4 border-black focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none comic-text"
            autoFocus
          />
          <Button 
            onClick={handleNext} 
            disabled={!currentAnswer.trim()}
            className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl uppercase comic-border transition-transform active:scale-95"
          >
            Próxima Pergunta <Send className="w-6 h-6 ml-2" />
          </Button>
        </div>

        <p className="text-center text-sm font-bold italic text-muted-foreground">
          Dica: Não tente fazer sentido! Quanto mais aleatório, melhor!
        </p>
      </CardContent>
    </Card>
  );
}