'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateCrazyStory, type StoryOutput } from '@/ai/flows/generate-crazy-story';
import { generateComicVisual } from '@/ai/flows/generate-comic-visual';
import { Loader2, Send, RotateCcw, Printer, Sparkles, Image as ImageIcon } from 'lucide-react';
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
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
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
    setLoadingStory(true);
    try {
      const story = await generateCrazyStory({ answers: finalAnswers });
      setResult(story);
      setLoadingStory(false);
      
      // Gera a imagem em paralelo para não travar a leitura
      setLoadingImage(true);
      try {
        const image = await generateComicVisual(story.imagePrompt);
        setComicImage(image);
      } catch (imgError) {
        console.error("Erro ao gerar imagem:", imgError);
        toast({ title: "Visual Indisponível", description: "Não conseguimos desenhar o gibi, mas a história está pronta!" });
      } finally {
        setLoadingImage(false);
      }
      
      toast({ title: "História Gerada!", description: "Prepare-se para rir!" });
    } catch (error) {
      setLoadingStory(false);
      toast({ 
        title: "Ops!", 
        description: "A IA se confundiu com tanta maluquice. Tente de novo!", 
        variant: "destructive" 
      });
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer('');
    setResult(null);
    setComicImage(null);
  };

  if (loadingStory) {
    return (
      <Card className="comic-border p-12 text-center space-y-6 bg-white animate-pulse">
        <div className="relative inline-block">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs uppercase">AI</div>
        </div>
        <h2 className="text-2xl font-black comic-text">Costurando as respostas malucas...</h2>
        <p className="italic text-muted-foreground">O roteirista está batendo as teclas freneticamente!</p>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="space-y-8 animate-in zoom-in-95 duration-500">
        <Card className="comic-border bg-white overflow-hidden shadow-2xl">
          <div className="bg-primary p-6 text-white text-center border-b-4 border-black">
            <h2 className="text-4xl font-black uppercase comic-text drop-shadow-md">{result.title}</h2>
          </div>
          <CardContent className="p-8 space-y-8 paper-texture min-h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="prose prose-lg max-w-none font-bold comic-text text-xl md:text-2xl leading-relaxed whitespace-pre-wrap text-black">
                  {result.fullStory}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                {loadingImage ? (
                  <div className="comic-border bg-gray-100 w-full aspect-square flex flex-col items-center justify-center space-y-4 p-8 text-center rotate-1">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="font-bold comic-text text-sm">IA está desenhando a cena principal...</p>
                  </div>
                ) : comicImage ? (
                  <div className="comic-border bg-white p-2 rotate-2 transition-transform hover:rotate-0 duration-500 max-w-md w-full shadow-2xl">
                    <img src={comicImage} alt="Ilustração do gibi" className="w-full h-auto border-2 border-black" />
                    <div className="mt-2 text-center text-[10px] font-black uppercase opacity-30">© Conto Maluco AI 2024</div>
                  </div>
                ) : (
                  <div className="comic-border bg-gray-50 w-full aspect-square flex flex-col items-center justify-center space-y-2 opacity-50 p-8 text-center italic">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm">O ilustrador saiu para o café. <br/>A imagem não pôde ser gerada.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center no-print pb-12">
          <Button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/90 text-white comic-border h-14 px-10 font-black uppercase text-lg shadow-xl hover:scale-105 transition-transform">
            <Printer className="w-6 h-6 mr-2" /> Imprimir Gibi (PDF)
          </Button>
          <Button onClick={restart} variant="outline" className="comic-border h-14 px-10 font-black uppercase text-lg bg-white hover:bg-gray-50 shadow-xl hover:scale-105 transition-transform">
            <RotateCcw className="w-6 h-6 mr-2" /> Jogar de Novo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="comic-border bg-white overflow-hidden shadow-2xl">
      <div className="bg-secondary p-5 text-white flex justify-between items-center border-b-4 border-black">
        <span className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" /> Pergunta {currentStep + 1} de {QUESTIONS.length}
        </span>
        <div className="flex gap-2">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-sm border-2 border-black transition-colors ${i <= currentStep ? 'bg-accent' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
      <CardContent className="p-8 md:p-16 space-y-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black comic-text text-center text-black leading-tight">
            {QUESTIONS[currentStep]}
          </h2>
          <p className="text-center text-sm font-bold italic text-muted-foreground">
            Responda qualquer coisa! O segredo é o absurdo.
          </p>
        </div>
        
        <div className="space-y-6 max-w-2xl mx-auto">
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            placeholder="Digite aqui..."
            className="h-20 text-2xl border-4 border-black focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none comic-text shadow-inner bg-yellow-50/30"
            autoFocus
          />
          <Button 
            onClick={handleNext} 
            disabled={!currentAnswer.trim()}
            className="w-full h-20 bg-primary hover:bg-primary/90 text-white font-black text-2xl uppercase comic-border transition-all active:scale-95 shadow-xl hover:translate-y-[-2px]"
          >
            Próxima Pergunta <Send className="w-8 h-8 ml-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}