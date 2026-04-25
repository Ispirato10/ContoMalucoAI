'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateCrazyStory, type StoryOutput } from '@/ai/flows/generate-crazy-story';
import { Loader2, Send, RotateCcw, Printer, AlertTriangle, BookOpen, Settings, Key, Sparkles, UserCheck } from 'lucide-react';
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
    toast({ title: "Chave Salva!", description: "Sua chave foi configurada com sucesso." });
    
    // Se estávamos em uma tela de erro e temos todas as respostas, tenta gerar de novo imediatamente
    if (error && answers.length === QUESTIONS.length) {
      processFinalStory(answers, trimmedKey);
    }
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

  const processFinalStory = async (finalAnswers: string[], forcedKey?: string) => {
    setIsFinalizing(true);
    setError(null);
    setResult(null);

    const apiKeyToUse = forcedKey || userApiKey;
    const isUsingUserKey = apiKeyToUse && apiKeyToUse.length > 20;

    try {
      const story = await generateCrazyStory({ 
        answers: finalAnswers,
        userApiKey: apiKeyToUse || undefined
      });
      setResult(story);
      setIsFinalizing(false);
      toast({ title: "Gibi Criado!", description: "Prepare-se para rir muito!" });
    } catch (err: any) {
      console.error("Erro na geração:", err);
      
      // Se deu erro de cota mas o usuário ESTAVA usando a própria chave, o erro é na chave dele
      if (isUsingUserKey) {
        setError("Eita! Parece que sua própria chave de API também atingiu o limite ou é inválida.");
      } else if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError("As requisições gratuitas do app acabaram.");
      } else {
        setError("Ocorreu um erro ao conectar com o Gemini 2.5 Flash.");
      }
      setIsFinalizing(false);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer('');
    setResult(null);
    setError(null);
    setIsFinalizing(false);
  };

  return (
    <div className="space-y-4">
      {userApiKey && userApiKey.length > 20 && !result && !isFinalizing && (
        <div className="flex justify-center no-print">
          <div className="bg-green-100 text-green-700 border-2 border-green-500 px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2 animate-bounce">
            <UserCheck className="w-4 h-4" /> Usando sua Chave Pessoal (Sem limites!)
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        {isFinalizing ? (
          <Card className="comic-border p-12 text-center space-y-6 bg-white animate-in fade-in zoom-in-95 duration-500">
            <div className="relative inline-block">
              <Loader2 className="w-24 h-24 animate-spin text-primary mx-auto opacity-20" />
              <Sparkles className="w-12 h-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black comic-text text-black uppercase">Gemini 2.5 Flash está escrevendo...</h2>
            <p className="italic text-muted-foreground font-bold text-lg">Transformando suas respostas em um gibi épico!</p>
          </Card>
        ) : error ? (
          <Card className="comic-border p-12 text-center space-y-6 bg-white border-destructive">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-black comic-text text-black uppercase">Cota Esgotada!</h2>
            <p className="font-bold text-muted-foreground text-lg">{error}</p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Button 
                variant="outline" 
                onClick={() => setIsSettingsOpen(true)} 
                className="comic-border h-16 font-bold flex gap-2 justify-center items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg hover:bg-yellow-50"
              >
                <Key className="w-6 h-6 text-primary" /> {userApiKey ? "Atualizar Minha Chave" : "Configurar Minha Chave"}
              </Button>
              <Button 
                onClick={() => processFinalStory(answers)} 
                className="comic-border bg-primary hover:bg-primary/90 h-16 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xl"
              >
                Tentar Novamente
              </Button>
            </div>
          </Card>
        ) : result ? (
          <div className="space-y-12 animate-in zoom-in-95 duration-700">
            <Card className="comic-border bg-primary p-12 text-center no-print shadow-2xl relative overflow-hidden comic-title-page">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
              <h2 className="text-5xl md:text-8xl font-black uppercase comic-text text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] relative z-10">
                {result.title}
              </h2>
              <div className="mt-8 relative z-10">
                <span className="bg-yellow-400 border-4 border-black px-8 py-3 font-black text-2xl rotate-3 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                  GIBI DE COLECIONADOR
                </span>
              </div>
            </Card>

            <div className="space-y-8">
              {result.pages.map((page, index) => (
                <Card key={index} className="comic-border bg-white overflow-hidden shadow-2xl comic-page print:page-break-after-always relative paper-texture">
                  <CardContent className="p-8 md:p-16 flex flex-col items-center gap-6 min-h-[600px] justify-center">
                    <div className="absolute top-6 left-6 bg-yellow-400 border-4 border-black px-8 py-3 font-black text-3xl -rotate-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] z-20">
                      PÁG. {index + 1}
                    </div>
                    
                    <div className="w-full max-w-4xl p-12 bg-white border-[6px] border-black relative shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
                      <div className="absolute -top-6 -right-6 bg-primary border-4 border-black p-4 rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <p className="comic-text text-3xl md:text-5xl text-center text-black leading-tight italic font-black uppercase whitespace-pre-wrap">
                        {page.text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center no-print pb-24">
              <Button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/90 text-white comic-border h-24 px-16 font-black uppercase text-3xl shadow-2xl hover:scale-105 transition-all active:scale-95">
                <Printer className="w-10 h-10 mr-4" /> Baixar Gibi (PDF)
              </Button>
              <Button onClick={restart} variant="outline" className="comic-border h-24 px-16 font-black uppercase text-3xl bg-white hover:bg-gray-50 shadow-2xl hover:scale-105 transition-all active:scale-95">
                <RotateCcw className="w-10 h-10 mr-4" /> Novo Conto
              </Button>
            </div>
          </div>
        ) : (
          <Card className="comic-border bg-white overflow-hidden shadow-2xl relative">
            <div className="bg-secondary p-6 text-white flex justify-between items-center border-b-4 border-black">
              <span className="font-black uppercase tracking-widest text-lg flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-accent" /> PERGUNTA {currentStep + 1} / {QUESTIONS.length}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="text-white hover:bg-white/20 h-12 w-12">
                <Settings className="w-8 h-8" />
              </Button>
            </div>
            <CardContent className="p-8 md:p-20 space-y-12">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black comic-text text-center text-black leading-tight drop-shadow-sm uppercase">
                  {QUESTIONS[currentStep]}
                </h2>
              </div>
              
              <div className="space-y-10 max-w-4xl mx-auto">
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="Escreva algo absurdo..."
                  className="h-20 text-xl md:text-3xl border-[6px] border-black rounded-none comic-text bg-yellow-50/50 text-center focus-visible:ring-0 focus:border-primary transition-colors placeholder:opacity-30"
                  autoFocus
                />
                <Button 
                  onClick={handleNext} 
                  disabled={!currentAnswer.trim()}
                  className="w-full h-24 bg-primary hover:bg-primary/90 text-white font-black text-4xl uppercase comic-border transition-all shadow-[0_12px_0_0_rgba(0,0,0,1)] hover:translate-y-[-4px] active:translate-y-[8px] active:shadow-none"
                >
                  PRÓXIMO <Send className="w-12 h-12 ml-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="comic-border bg-white p-10 max-w-xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="comic-text text-3xl font-black uppercase flex items-center gap-3 text-black">
              <Key className="w-8 h-8 text-primary" /> Chave Gemini
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground text-lg leading-tight">
              Use sua própria chave do <strong>Google AI Studio</strong> para ignorar os limites do app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-8">
            <div className="space-y-3">
              <label className="text-lg font-black uppercase tracking-widest text-black">API Key (Gemini 2.5 Flash)</label>
              <Input 
                type="password" 
                placeholder="Cole sua chave AIza..." 
                value={userApiKey} 
                onChange={(e) => setUserApiKey(e.target.value)}
                className="border-4 border-black rounded-none comic-text h-16 text-2xl bg-yellow-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => { saveApiKey(userApiKey); setIsSettingsOpen(false); }} 
              className="comic-border bg-secondary hover:bg-secondary/90 w-full font-black uppercase text-white h-20 text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              Salvar e Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
