'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateCrazyStory, type StoryOutput } from '@/ai/flows/generate-crazy-story';
import { generateComicVisual } from '@/ai/flows/generate-comic-visual';
import { Loader2, Send, RotateCcw, Printer, AlertTriangle, BookOpen, Settings, Key, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StoryOutput | null>(null);
  const [images, setImages] = useState<Record<number, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  
  const [userApiKey, setUserApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('conto-maluco-api-key');
    if (savedKey) setUserApiKey(savedKey);
  }, []);

  const saveApiKey = (key: string) => {
    const trimmedKey = key.trim();
    setUserApiKey(trimmedKey);
    localStorage.setItem('conto-maluco-api-key', trimmedKey);
    toast({ title: "Configuração Salva", description: "Sua chave de API será usada agora." });
  };

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
    setImages({});

    try {
      // 1. Gera o roteiro do gibi com Gemini 2.5 Flash
      const story = await generateCrazyStory({ 
        answers: finalAnswers,
        userApiKey: userApiKey || undefined
      });
      setResult(story);
      setIsFinalizing(false);

      // 2. Gera as imagens para cada página em paralelo
      story.pages.forEach((page, index) => {
        generateImageForPage(index, page.visualPrompt);
      });

      toast({ title: "Gibi Criado!", description: "A história está pronta, as imagens estão carregando!" });
    } catch (err: any) {
      console.error("Erro na geração:", err);
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError("A cota do sistema acabou! Configure sua própria chave Gemini para continuar.");
      } else {
        setError("Ocorreu um erro ao gerar a história. Verifique sua chave e tente novamente.");
      }
      setIsFinalizing(false);
    }
  };

  const generateImageForPage = async (index: number, prompt: string) => {
    setLoadingImages(prev => ({ ...prev, [index]: true }));
    try {
      const url = await generateComicVisual(prompt);
      setImages(prev => ({ ...prev, [index]: url }));
    } catch (e) {
      console.error("Erro na imagem:", e);
    } finally {
      setLoadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleRetry = () => {
    processFinalStory(answers);
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer('');
    setResult(null);
    setError(null);
    setIsFinalizing(false);
    setImages({});
  };

  return (
    <div className="space-y-4">
      <div className="min-h-[400px]">
        {isFinalizing ? (
          <Card className="comic-border p-12 text-center space-y-6 bg-white animate-in fade-in zoom-in-95 duration-500">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <h2 className="text-3xl font-black comic-text text-black uppercase">Desenhando com Gemini 2.5 Flash...</h2>
            <p className="italic text-muted-foreground font-bold text-lg">Criando um gibi exclusivo com as suas respostas!</p>
          </Card>
        ) : error ? (
          <Card className="comic-border p-12 text-center space-y-6 bg-white border-destructive">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-black comic-text text-black">Eita! Deu zebra na cota!</h2>
            <p className="font-bold text-muted-foreground text-lg">{error}</p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Button onClick={handleRetry} className="comic-border bg-primary hover:bg-primary/90 h-14 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Tentar Novamente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsSettingsOpen(true)} 
                className="comic-border h-14 font-bold flex gap-2 justify-center items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Key className="w-5 h-5" /> Configurar Minha Chave
              </Button>
            </div>
          </Card>
        ) : result ? (
          <div className="space-y-12 animate-in zoom-in-95 duration-700">
            {/* Capa do Gibi (Apenas Visual Web) */}
            <Card className="comic-border bg-primary p-12 text-center no-print shadow-2xl">
              <h2 className="text-5xl md:text-7xl font-black uppercase comic-text text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                {result.title}
              </h2>
              <p className="text-xl font-bold text-yellow-300 mt-4 italic">Uma aventura maluca em {result.pages.length} páginas!</p>
            </Card>

            {/* Páginas do Gibi */}
            <div className="space-y-12">
              {result.pages.map((page, index) => (
                <Card key={index} className="comic-border bg-white overflow-hidden shadow-2xl comic-page print:page-break-after-always">
                  <CardContent className="p-8 md:p-12 flex flex-col items-center gap-8">
                    {/* Imagem do Painel */}
                    <div className="w-full aspect-square max-w-2xl bg-gray-50 border-4 border-black relative overflow-hidden flex items-center justify-center">
                      {loadingImages[index] ? (
                        <div className="text-center space-y-4">
                          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                          <p className="comic-text font-bold animate-pulse">Desenhando cena {index + 1}...</p>
                        </div>
                      ) : images[index] ? (
                        <img src={images[index]} alt={`Página ${index + 1}`} className="w-full h-full object-cover comic-image" />
                      ) : (
                        <div className="text-center opacity-20">
                          <ImageIcon className="w-24 h-24 mx-auto" />
                          <p className="font-bold uppercase tracking-widest mt-2">Aguardando IA...</p>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-yellow-400 border-2 border-black px-4 py-1 font-black text-xl -rotate-6">
                        {index + 1}
                      </div>
                    </div>

                    {/* Legenda/Texto */}
                    <div className="comic-caption w-full max-w-2xl p-6 bg-yellow-50 border-2 border-dashed border-black">
                      <p className="comic-text text-2xl md:text-3xl text-center text-black leading-relaxed italic">
                        "{page.text}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Rodapé e Ações */}
            <div className="flex flex-wrap gap-4 justify-center no-print pb-12">
              <Button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/90 text-white comic-border h-20 px-12 font-black uppercase text-2xl shadow-xl hover:scale-105 transition-all">
                <Printer className="w-8 h-8 mr-4" /> Baixar Gibi (PDF)
              </Button>
              <Button onClick={restart} variant="outline" className="comic-border h-20 px-12 font-black uppercase text-2xl bg-white hover:bg-gray-50 shadow-xl hover:scale-105 transition-all">
                <RotateCcw className="w-8 h-8 mr-4" /> Jogar de Novo
              </Button>
            </div>
          </div>
        ) : (
          <Card className="comic-border bg-white overflow-hidden shadow-2xl relative">
            <div className="bg-secondary p-5 text-white flex justify-between items-center border-b-4 border-black">
              <span className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" /> PERGUNTA {currentStep + 1} DE {QUESTIONS.length}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="text-white hover:bg-white/20">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
            <CardContent className="p-8 md:p-20 space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-black comic-text text-center text-black leading-tight">
                  {QUESTIONS[currentStep]}
                </h2>
              </div>
              
              <div className="space-y-8 max-w-3xl mx-auto">
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="Sua resposta maluca..."
                  className="h-24 text-3xl md:text-4xl border-4 border-black rounded-none comic-text bg-yellow-50/50 text-center focus-visible:ring-0 focus:border-primary transition-colors"
                  autoFocus
                />
                <Button 
                  onClick={handleNext} 
                  disabled={!currentAnswer.trim()}
                  className="w-full h-24 bg-primary hover:bg-primary/90 text-white font-black text-3xl uppercase comic-border transition-all shadow-[0_10px_0_0_rgba(0,0,0,1)] hover:translate-y-[-4px] active:translate-y-[6px] active:shadow-none"
                >
                  PRÓXIMO <Send className="w-10 h-10 ml-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="comic-border bg-white p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="comic-text text-2xl font-black uppercase flex items-center gap-2">
              <Key className="w-6 h-6 text-primary" /> Minha Chave Gemini
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground text-base">
              Use sua própria chave para o Gemini 2.5 Flash e garanta gerações ilimitadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-black">API Key (Google AI Studio)</label>
              <Input 
                type="password" 
                placeholder="Insira sua chave aqui..." 
                value={userApiKey} 
                onChange={(e) => setUserApiKey(e.target.value)}
                className="border-2 border-black rounded-none comic-text h-14 text-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { saveApiKey(userApiKey); setIsSettingsOpen(false); }} className="comic-border bg-secondary hover:bg-secondary/90 w-full font-black uppercase text-white h-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
