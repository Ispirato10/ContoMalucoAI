'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateCrazyStory, type StoryOutput } from '@/ai/flows/generate-crazy-story';
import { generateStoryAudio } from '@/ai/flows/generate-story-audio';
import { 
  Loader2, 
  Send, 
  RotateCcw, 
  Printer, 
  AlertTriangle, 
  BookOpen, 
  Settings, 
  Key, 
  Sparkles, 
  Sword,
  Rocket,
  Ghost,
  Heart,
  Shield,
  Zap,
  Wand2,
  Utensils,
  Volume2,
  Pause,
  Download,
  ExternalLink,
  Info,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const THEMES = [
  { id: 'classic', name: 'Aventura Clássica', icon: Sword, description: 'O herói contra o vilão em um lugar estranho.', questions: ["Quem é o herói?", "Onde vive?", "O que faz?", "Quem apareceu?", "O que gritou?", "Como terminou?"] },
  { id: 'scifi', name: 'Espacial', icon: Rocket, description: 'Confusões intergalácticas.', questions: ["Nome da nave?", "Planeta?", "Combustível?", "Alien?", "O que comia?", "O que houve no olá?"] },
  { id: 'horror', name: 'Mansão', icon: Ghost, description: 'Sustos e mistérios.', questions: ["Quem entrou?", "Nome da mansão?", "O que buscava?", "Cheiro?", "Barulho?", "Nome do fantasma?"] },
  { id: 'drama', name: 'Novela', icon: Heart, description: 'Revelações bombásticas.', questions: ["Protagonista?", "Vilão?", "Segredo?", "O que houve no casamento?", "Frase de desmaio?"] },
  { id: 'western', name: 'Oeste', icon: Shield, description: 'Duelos e xerifes.', questions: ["Xerife medroso?", "Cidade?", "O que carrega?", "Bandido?", "Duelo com o quê?"] },
  { id: 'superhero', name: 'Heróis', icon: Zap, description: 'Poderes inúteis.', questions: ["Nome do herói?", "Disfarce?", "Poder inútil?", "Ponto fraco?", "Plano do vilão?"] },
  { id: 'magic', name: 'Magia', icon: Wand2, description: 'Feitiços errados.', questions: ["Escola?", "Varinha?", "Feitiço errado?", "Animal?", "Poção nojenta?"] },
  { id: 'cooking', name: 'Cozinha', icon: Utensils, description: 'Desastres culinários.', questions: ["Cozinheiro?", "Restaurante?", "Prato?", "Ingrediente bizarro?", "Reação do crítico?"] }
];

export function StoryGame() {
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<typeof THEMES[0] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StoryOutput | null>(null);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [userApiKey, setUserApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('conto-maluco-api-key');
    if (savedKey) setUserApiKey(savedKey);
  }, []);

  const saveApiKey = (key: string) => {
    const trimmedKey = key.trim();
    setUserApiKey(trimmedKey);
    localStorage.setItem('conto-maluco-api-key', trimmedKey);
    toast({ title: "Chave Salva!" });
  };

  const handleNext = () => {
    if (!currentAnswer.trim() || !selectedTheme) return;
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    if (currentStep < selectedTheme.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      processFinalStory(newAnswers);
    }
  };

  const processFinalStory = async (finalAnswers: string[]) => {
    setIsFinalizing(true);
    setError(null);
    try {
      const story = await generateCrazyStory({ answers: finalAnswers, userApiKey: userApiKey || undefined });
      setResult(story);
      setIsFinalizing(false);
    } catch (err: any) {
      setError("Cota esgotada ou erro na IA. Tente usar sua própria chave Gemini.");
      setIsFinalizing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (audioUrl) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { audioRef.current?.play(); setIsPlaying(true); }
      return;
    }
    if (!result) return;
    setIsAudioLoading(true);
    try {
      const fullText = `${result.title}. ${result.pages.map(p => p.text).join(' ')}`;
      const audioResponse = await generateStoryAudio({ text: fullText, userApiKey: userApiKey || undefined });
      setAudioUrl(audioResponse.media);
      setIsPlaying(true);
    } catch (err) {
      toast({ title: "Erro no áudio", variant: "destructive" });
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioUrl || !result) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${result.title}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const restart = () => {
    setSelectedTheme(null); setCurrentStep(0); setAnswers([]); setResult(null); setError(null); setAudioUrl(null);
  };

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <audio 
        ref={audioRef} 
        src={audioUrl || undefined} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden" 
      />

      <div className="min-h-[400px]">
        {isFinalizing ? (
          <Card className="comic-border p-12 text-center space-y-6 bg-white animate-bounce">
            <Sparkles className="w-16 h-16 text-primary mx-auto animate-pulse" />
            <h2 className="text-4xl font-black comic-text uppercase text-black">Escrevendo sua loucura...</h2>
          </Card>
        ) : error ? (
          <Card className="comic-border p-12 text-center space-y-6 bg-white border-destructive">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
            <p className="font-bold text-lg text-black">{error}</p>
            <Button onClick={() => setIsSettingsOpen(true)} className="comic-border bg-yellow-400 text-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Configurar Chave</Button>
          </Card>
        ) : result ? (
          <div className="space-y-8 animate-in zoom-in-95 duration-700">
            <Card className="comic-border bg-primary p-12 text-center shadow-2xl comic-title-page">
              <h2 className="text-6xl md:text-9xl font-black uppercase comic-text text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] leading-none italic">
                {result.title}
              </h2>
            </Card>

            {result.pages.map((page, index) => (
              <Card key={index} className="comic-border bg-white paper-texture comic-page">
                <CardContent className="p-8 md:p-16 flex flex-col items-center justify-center min-h-[500px]">
                  <p className="book-font text-6xl md:text-9xl text-center text-black leading-tight italic font-black">
                    {page.text}
                  </p>
                </CardContent>
              </Card>
            ))}

            <div className="flex flex-wrap gap-4 justify-center no-print pb-24">
              <Button onClick={handlePlayAudio} disabled={isAudioLoading} className="bg-accent text-black comic-border h-auto py-6 px-10 font-black uppercase text-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex-1">
                {isAudioLoading ? <Loader2 className="animate-spin" /> : isPlaying ? <Pause /> : <Volume2 />} {isPlaying ? 'Pausar' : 'Ouvir'}
              </Button>
              {audioUrl && (
                <Button onClick={handleDownloadAudio} className="bg-yellow-500 text-black comic-border h-auto py-6 px-10 font-black uppercase text-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex-1">
                  <Download className="w-6 h-6 mr-2" /> Baixar Áudio
                </Button>
              )}
              <Button onClick={() => window.print()} className="bg-secondary text-white comic-border h-auto py-6 px-10 font-black uppercase text-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex-1">
                <Printer className="w-6 h-6 mr-2" /> PDF
              </Button>
              <Button onClick={restart} variant="outline" className="bg-white text-black comic-border h-auto py-6 px-10 font-black uppercase text-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex-1">
                <RotateCcw className="w-6 h-6 mr-2" /> Novo
              </Button>
            </div>
          </div>
        ) : !selectedTheme ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-2">
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              return (
                <button key={theme.id} onClick={() => setSelectedTheme(theme)} className="comic-border bg-white p-8 text-left hover:bg-yellow-50 transition-all group flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
                  <div className="flex items-center justify-between">
                    <h3 className="text-4xl font-black comic-text uppercase text-black tracking-tighter">{theme.name}</h3>
                    <div className="bg-accent p-3 comic-border -rotate-3 group-hover:rotate-6 transition-transform">
                      <Icon className="w-12 h-12 text-black" />
                    </div>
                  </div>
                  <p className="font-bold text-muted-foreground italic book-font text-xl leading-snug">{theme.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs font-black uppercase text-primary">
                    <span className="bg-primary text-white px-3 py-1 comic-border">{theme.questions.length} PERGUNTAS</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <Card className="comic-border bg-white overflow-hidden shadow-2xl">
            <CardContent className="p-10 md:p-20 space-y-16">
              <div className="flex justify-center mb-4">
                <div className="bg-accent p-6 comic-border -rotate-3 scale-110">
                  <selectedTheme.icon className="w-16 h-16 text-black" />
                </div>
              </div>
              <div className="text-center space-y-4">
                <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Pergunta {currentStep + 1} de {selectedTheme.questions.length}</p>
                <h2 className="text-6xl md:text-9xl font-black book-font text-black leading-tight">
                  {selectedTheme.questions[currentStep]}
                </h2>
              </div>
              <Input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder="Sua resposta bizarra..."
                className="h-32 text-4xl md:text-7xl border-[6px] border-black rounded-none book-font bg-yellow-50 text-center focus:ring-primary shadow-inner font-black"
                autoFocus
              />
              <Button onClick={handleNext} disabled={!currentAnswer.trim()} className="w-full h-auto py-10 bg-primary text-white font-black text-5xl uppercase comic-border shadow-[0_12px_0_0_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none transition-all">
                PRÓXIMO <Send className="ml-6 w-10 h-10" />
              </Button>
              <div className="text-center no-print pt-6">
                 <Button onClick={restart} variant="ghost" className="text-muted-foreground font-black hover:text-black italic text-xl uppercase tracking-widest">
                   Escolher outro tema
                 </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="fixed top-4 right-4 z-50 no-print">
        <Button onClick={() => setIsSettingsOpen(true)} variant="outline" size="icon" className="comic-border bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-12 h-12">
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="comic-border bg-white p-6 md:p-10 max-w-2xl overflow-hidden flex flex-col h-[90vh]">
          <DialogHeader>
            <DialogTitle className="comic-text text-4xl md:text-5xl font-black uppercase text-black italic">Configurações de Elite</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-8 py-4">
              {/* Ajuda Retrátil */}
              <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full h-auto py-4 comic-border bg-accent hover:bg-accent/90 text-black font-black uppercase flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all mb-4">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-6 h-6" /> Como conseguir chave grátis?
                    </span>
                    <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isHelpOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="animate-in slide-in-from-top-4 duration-300">
                  <div className="bg-accent/10 comic-border p-6 space-y-6 relative overflow-hidden mb-6">
                    <div className="absolute -top-4 -right-4 p-4 opacity-10 rotate-12">
                      <Info className="w-32 h-32 text-black" />
                    </div>
                    
                    <h3 className="font-black uppercase text-xl md:text-2xl text-black flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-primary" /> Manual do Super-Herói:
                    </h3>
                    
                    <div className="grid gap-4">
                      {[
                        { step: 1, text: "Acesse o portal oficial:", link: "https://aistudio.google.com/", linkLabel: "Google AI Studio" },
                        { step: 2, text: "Faça login com sua conta Google (é rápido e seguro!)" },
                        { step: 3, text: "No menu lateral esquerdo, clique em 'Get API key'" },
                        { step: 4, text: "Gere seu código único no botão azul." },
                        { step: 5, text: "Copie o código (ele começa com 'AIza...')" },
                        { step: 6, text: "Cole no campo abaixo e salve para liberar a magia!" }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="bg-primary text-white comic-border w-8 h-8 shrink-0 flex items-center justify-center font-black italic -rotate-6">
                            {item.step}
                          </div>
                          <p className="font-bold italic text-base md:text-lg text-black leading-tight">
                            {item.text}
                            {item.link && (
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary underline inline-flex items-center gap-1 hover:text-black transition-colors">
                                {item.linkLabel} <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Campo de Entrada */}
              <div className="space-y-4">
                <label className="font-black uppercase text-black flex items-center gap-2 text-xl italic">
                  <Key className="w-6 h-6 text-primary" /> Sua API Key Gemini
                </label>
                <Input 
                  type="password" 
                  value={userApiKey} 
                  onChange={(e) => setUserApiKey(e.target.value)} 
                  placeholder="AIza..."
                  className="border-[6px] border-black h-24 text-3xl md:text-4xl rounded-none font-black bg-yellow-50 focus:ring-primary shadow-inner" 
                />
                <p className="text-sm md:text-base font-bold text-muted-foreground italic leading-tight">
                  Usar sua própria chave evita erros de cota e garante que suas histórias nunca parem de ser geradas!
                </p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-8">
            <Button 
              onClick={() => { saveApiKey(userApiKey); setIsSettingsOpen(false); }} 
              className="w-full bg-secondary text-white font-black h-24 text-3xl md:text-4xl uppercase comic-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              SALVAR MINHA CHAVE!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
