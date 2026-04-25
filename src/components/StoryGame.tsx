'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateCrazyStory, type StoryOutput } from '@/ai/flows/generate-crazy-story';
import { generateComicVisual } from '@/ai/flows/generate-comic-visual';
import { Loader2, Send, RotateCcw, Printer, Image as ImageIcon, AlertTriangle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QUESTIONS = [
  "Quem é o herói ou heroína dessa aventura?",
  "Onde esse personagem vive (um lugar bem estranho)?",
  "O que ele(a) faz para passar o tempo (algo bizarro)?",
  "Quem apareceu para atrapalhar tudo?",
  "O que esse intruso gritou bem alto?",
  "Como essa confusão terminou de um jeito maluco?",
];

export function StoryGame() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setIsFinalizing(true);
    setError(null);
    setResult(null);
    setComicImage(null);

    try {
      const story = await generateCrazyStory({ answers: finalAnswers });
      setResult(story);
      
      setLoadingImage(true);
      generateComicVisual(story.imagePrompt)
        .then((image) => setComicImage(image))
        .catch((imgError) => console.error("Erro na imagem:", imgError))
        .finally(() => setLoadingImage(false));
      
      toast({ title: "Gibi Criado!", description: "Sua história está pronta!" });
    } catch (err: any) {
      console.error("Erro na geração:", err);
      setError("A IA atingiu o limite de criatividade por agora. Vamos tentar de novo?");
    } finally {
      setIsFinalizing(false);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer('');
    setResult(null);
    setComicImage(null);
    setError(null);
    setIsFinalizing(false);
  };

  if (isFinalizing && !result) {
    return (
      <Card className="comic-border p-12 text-center space-y-6 bg-white animate-in fade-in zoom-in-95 duration-500">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
        <h2 className="text-3xl font-black comic-text text-black uppercase">Escrevendo sua maluquice...</h2>
        <p className="italic text-muted-foreground font-bold">Aguarde, os gnomos da IA estão trabalhando!</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="comic-border p-12 text-center space-y-6 bg-white border-destructive">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-black comic-text text-black">Eita! Deu zebra!</h2>
        <p className="font-bold text-muted-foreground">{error}</p>
        <div className="flex flex-col gap-4">
          <Button onClick={() => processFinalStory(answers)} className="comic-border bg-primary hover:bg-primary/90 h-14 font-black uppercase text-lg text-white">
            Tentar Novamente
          </Button>
          <Button variant="ghost" onClick={restart} className="font-bold underline">
            Voltar para o Início
          </Button>
        </div>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="space-y-8 animate-in zoom-in-95 duration-700">
        <Card className="comic-border bg-white overflow-hidden shadow-2xl print:shadow-none print:border-2">
          <div className="bg-primary p-6 text-white text-center border-b-4 border-black print:bg-white print:text-black">
            <h2 className="text-4xl md:text-5xl font-black uppercase comic-text drop-shadow-md print:drop-shadow-none">
              {result.title}
            </h2>
          </div>
          <CardContent className="p-8 space-y-8 paper-texture print:bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start print:block">
              <div className="space-y-6 print:mb-8">
                <div className="prose prose-xl max-w-none font-bold comic-text leading-relaxed whitespace-pre-wrap text-black text-2xl md:text-3xl">
                  {result.fullStory}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                {loadingImage ? (
                  <div className="comic-border bg-yellow-50 w-full aspect-square flex flex-col items-center justify-center space-y-4 p-8 text-center rotate-1 print:hidden">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="font-bold comic-text text-lg">Ilustrando sua loucura...</p>
                  </div>
                ) : comicImage ? (
                  <div className="comic-border bg-white p-3 rotate-2 transition-transform hover:rotate-0 duration-500 shadow-2xl print:rotate-0 print:shadow-none print:max-w-md mx-auto">
                    <img src={comicImage} alt="Capa do Gibi" className="w-full h-auto border-4 border-black" />
                    <div className="mt-4 text-center text-[10px] font-black uppercase opacity-40">Edição Especial AI</div>
                  </div>
                ) : (
                  <div className="comic-border bg-gray-50 w-full aspect-square flex flex-col items-center justify-center space-y-4 opacity-50 p-8 text-center italic print:hidden">
                    <ImageIcon className="w-16 h-16" />
                    <p className="font-bold">A imagem fugiu, mas a história é hilária!</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center no-print pb-12">
          <Button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/90 text-white comic-border h-16 px-12 font-black uppercase text-xl shadow-xl hover:scale-105 transition-all">
            <Printer className="w-7 h-7 mr-3" /> Salvar Gibi (PDF)
          </Button>
          <Button onClick={restart} variant="outline" className="comic-border h-16 px-12 font-black uppercase text-xl bg-white hover:bg-gray-50 shadow-xl hover:scale-105 transition-all">
            <RotateCcw className="w-7 h-7 mr-3" /> Jogar de Novo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="comic-border bg-white overflow-hidden shadow-2xl">
      <div className="bg-secondary p-5 text-white flex justify-between items-center border-b-4 border-black">
        <span className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" /> PERGUNTA {currentStep + 1} DE {QUESTIONS.length}
        </span>
        <div className="flex gap-2">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`w-5 h-5 rounded-full border-2 border-black transition-all ${i <= currentStep ? 'bg-accent scale-110' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
      <CardContent className="p-8 md:p-20 space-y-12">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-6xl font-black comic-text text-center text-black leading-tight drop-shadow-sm">
            {QUESTIONS[currentStep]}
          </h2>
          <p className="text-center text-lg font-bold italic text-primary animate-pulse">
            Seja o mais absurdo possível!
          </p>
        </div>
        
        <div className="space-y-8 max-w-3xl mx-auto">
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            placeholder="Sua resposta secreta..."
            className="h-24 text-3xl md:text-4xl border-4 border-black focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none comic-text shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)] bg-yellow-50/50 text-center"
            autoFocus
          />
          <Button 
            onClick={handleNext} 
            disabled={!currentAnswer.trim()}
            className="w-full h-24 bg-primary hover:bg-primary/90 text-white font-black text-3xl uppercase comic-border transition-all active:scale-95 shadow-[0_10px_0_0_rgba(0,0,0,1)] hover:translate-y-[-4px] active:translate-y-[6px] active:shadow-none"
          >
            CONFIRMAR <Send className="w-10 h-10 ml-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
