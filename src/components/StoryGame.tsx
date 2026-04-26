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
  UserCheck,
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
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
            <h2 className="text-3xl font-black comic-text uppercase text-black">Escrevendo sua loucura...</h2>
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
              <h2 className="text-5xl md:text-8xl font-black uppercase comic-text text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-2">
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              return (
                <button key={theme.id} onClick={() => setSelectedTheme(theme)} className="comic-border bg-white p-8 text-left hover:bg-yellow-50 transition-all group flex flex-col gap-3 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black comic-text uppercase text-black">{theme.name}</h3>
                    <Icon className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
                  </div>
                  <p className="font-bold text-muted-foreground italic book-font text-lg">{theme.description}</p>
                </button>
              )
            })}
          </div>
        ) : (
          <Card className="comic-border bg-white overflow-hidden shadow-2xl">
            <CardContent className="p-10 md:p-20 space-y-12">
              <div className="flex justify-center mb-4">
                <div className="bg-accent p-4 comic-border -rotate-3">
                  <selectedTheme.icon className="w-12 h-12 text-black" />
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold book-font text-center text-black">
                {selectedTheme.questions[currentStep]}
              </h2>
              <Input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder="Sua resposta bizarra..."
                className="h-24 text-3xl border-4 border-black rounded-none book-font bg-yellow-50 text-center focus:ring-primary"
                autoFocus
              />
              <Button onClick={handleNext} disabled={!currentAnswer.trim()} className="w-full h-auto py-8 bg-primary text-white font-black text-4xl uppercase comic-border shadow-[0_10px_0_0_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none transition-all">
                PRÓXIMO <Send className="ml-4" />
              </Button>
              <div className="text-center no-print">
                 <Button onClick={restart} variant="ghost" className="text-muted-foreground font-bold hover:text-black italic">
                   Escolher outro tema
                 </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="fixed top-4 right-4 z-50 no-print">
        <Button onClick={() => setIsSettingsOpen(true)} variant="outline" size="icon" className="comic-border bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="comic-border bg-white p-10 max-w-md">
          <DialogHeader>
            <DialogTitle className="comic-text text-3xl font-black uppercase text-black">Configurações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="font-black uppercase text-black flex items-center gap-2">
              <Key className="w-4 h-4" /> Sua API Key Gemini
            </label>
            <Input type="password" value={userApiKey} onChange={(e) => setUserApiKey(e.target.value)} className="border-4 border-black h-16 text-xl rounded-none" />
            <p className="text-xs font-bold text-muted-foreground italic">Use sua chave para evitar erros de cota e garantir a diversão!</p>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={() => { saveApiKey(userApiKey); setIsSettingsOpen(false); }} className="w-full bg-secondary text-white font-black h-16 text-2xl comic-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">Salvar Chave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
