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
  Info
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

const THEMES = [
  { 
    id: 'classic', 
    name: 'Aventura Clássica', 
    icon: Sword, 
    description: 'O herói contra o vilão em um lugar estranho.', 
    questions: [
      "Quem é o herói?", 
      "Qual o trabalho dele?", 
      "Onde ele vive?", 
      "O que ele carrega na mochila?", 
      "Quem apareceu de repente?", 
      "Como essa loucura terminou?"
    ] 
  },
  { 
    id: 'cooking', 
    name: 'Cozinha Maluca', 
    icon: Utensils, 
    description: 'Desastres culinários dignos de um crítico.', 
    questions: [
      "Quem é o cozinheiro?", 
      "Nome do restaurante?", 
      "Qual o chapéu que ele usa?", 
      "Qual o prato principal?", 
      "Qual ingrediente bizarro usou?", 
      "Quem era o crítico famoso?", 
      "Como o restaurante foi salvo?"
    ] 
  },
  { 
    id: 'western', 
    name: 'Velho Oeste', 
    icon: Shield, 
    description: 'Duelos, xerifes e muita poeira.', 
    questions: [
      "Quem é o xerife medroso?", 
      "Qual o nome da cidade?", 
      "O que ele carrega no coldre?", 
      "Qual o nome do cavalo?", 
      "Quem é o bandido procurado?", 
      "O que o bandido roubou?", 
      "Onde foi o grande duelo?", 
      "O duelo foi decidido com o quê?", 
      "O que o pianista tocou?", 
      "Qual o destino do xerife?"
    ] 
  },
  { 
    id: 'horror', 
    name: 'Mansão Assombrada', 
    icon: Ghost, 
    description: 'Sustos, mistérios e fantasmas atrapalhados.', 
    questions: [
      "Quem entrou na mansão?", 
      "Qual o nome da mansão?", 
      "O que a pessoa buscava?", 
      "Qual era a cor da lanterna?", 
      "Qual era o cheiro do corredor?", 
      "Que barulho estranho ouviu?", 
      "O que tinha no quadro da parede?", 
      "Quem era o fantasma?", 
      "O que o fantasma queria?", 
      "Qual o segredo do porão?", 
      "Como a pessoa fugiu?", 
      "O que ela nunca mais esqueceu?"
    ] 
  },
  { 
    id: 'superhero', 
    name: 'Super-Heróis', 
    icon: Zap, 
    description: 'Heróis com poderes completamente inúteis.', 
    questions: [
      "Nome do herói?", 
      "Qual o disfarce dele?", 
      "Qual o poder inútil?", 
      "Qual o som que ele faz ao voar?", 
      "Qual o nome do ajudante?", 
      "Qual o ponto fraco?", 
      "Quem é o arqui-inimigo?", 
      "Qual o plano maligno do vilão?", 
      "Onde foi a batalha final?", 
      "Qual o nome do golpe especial?", 
      "O que a cidade deu de presente?", 
      "Qual a frase de efeito?",
      "Quem apareceu para ajudar no fim?"
    ] 
  },
  { 
    id: 'scifi', 
    name: 'Espacial', 
    icon: Rocket, 
    description: 'Confusões intergalácticas em planetas distantes.', 
    questions: [
      "Nome da nave?", 
      "Quem é o capitão?", 
      "Em qual planeta pousaram?", 
      "O que usam como combustível?", 
      "Qual o som do motor?", 
      "Como era o alienígena?", 
      "O que o alien estava comendo?", 
      "O que o robô da nave disse?", 
      "Qual a lei mais estranha desse planeta?", 
      "Houve uma emergência de quê?", 
      "Como escaparam do buraco negro?", 
      "Qual foi a lição intergaláctica?",
      "Para onde a nave foi agora?",
      "Quem era o passageiro clandestino?",
      "Qual a cor do laser de emergência?"
    ] 
  },
  { 
    id: 'magic', 
    name: 'Escola de Magia', 
    icon: Wand2, 
    description: 'Feitiços que deram muito errado.', 
    questions: [
      "Nome da escola?", 
      "Quem é o diretor?", 
      "De que é feita a varinha?", 
      "Qual animal de estimação?", 
      "Qual feitiço deu errado?", 
      "O que o feitiço transformou?", 
      "Qual o nome da poção nojenta?", 
      "O que tinha dentro do caldeirão?", 
      "Quem é o rival do herói?", 
      "Qual a aventura proibida?", 
      "Como consertaram a magia?", 
      "Qual foi o banquete final?",
      "Qual o nome do livro proibido?",
      "Onde eles se esconderam do monitor?",
      "Qual o som da vassoura voadora?",
      "Quem ganhou a taça das casas?"
    ] 
  },
  { 
    id: 'drama', 
    name: 'Novela Mexicana', 
    icon: Heart, 
    description: 'Revelações bombásticas e dramas exagerados.', 
    questions: [
      "Quem é a protagonista?", 
      "Ela é rica ou pobre?",
      "Onde ela trabalha?", 
      "Quem é o grande vilão amargurado?", 
      "Qual o segredo obscuro do passado?", 
      "Qual o nome do cachorro que viu tudo?", 
      "O que houve de errado no casamento?", 
      "Qual a frase antes do desmaio?", 
      "Quem é o herdeiro perdido?", 
      "Qual a cor do vestido de noiva?",
      "Quem interrompeu a cerimônia?",
      "Qual o nome da herança disputada?",
      "Quem era o gêmeo malvado?",
      "Qual o tapa mais dramático?",
      "Para onde ela fugiu chorando?",
      "Qual a revelação final bombástica?",
      "Como foi o beijo apaixonado?",
      "Qual la última frase antes dos créditos?"
    ] 
  }
].sort((a, b) => a.questions.length - b.questions.length);

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
    link.download = `${result.title.replace(/\s+/g, '-').toLowerCase()}.wav`;
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
            {/* Capa do Gibi */}
            <Card className="comic-border bg-primary p-6 md:p-12 text-center shadow-2xl comic-title-page overflow-hidden relative">
              <div className="hidden print:flex print:items-center print:justify-between print:w-full print:absolute print:top-8 print:px-12 print:border-b-4 print:border-white print:pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.png?v=1" alt="Logo" className="w-12 h-12" />
                  <span className="comic-text text-2xl text-white">Conto Maluco AI</span>
                </div>
                <div className="text-sm text-white/80 italic font-black uppercase">Edição Especial</div>
              </div>
              
              <h2 className="text-3xl md:text-8xl lg:text-9xl font-black uppercase comic-text text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] leading-tight italic break-words whitespace-normal px-2 overflow-wrap-anywhere">
                {result.title}
              </h2>

              <div className="hidden print:flex print:items-center print:justify-between print:w-full print:absolute print:bottom-8 print:px-12 print:border-t print:border-white/40 print:pt-4 text-white/80">
                <span className="text-xs">https://conto-maluco-ai.vercel.app</span>
                <span className="text-xs italic font-bold">CAPA DO GIBI</span>
              </div>
            </Card>

            {/* Páginas Internas */}
            {result.pages.map((page, index) => (
              <Card key={index} className="comic-border bg-white paper-texture comic-page relative overflow-hidden">
                <div className="hidden print:flex print:items-center print:justify-between print:w-full print:absolute print:top-8 print:px-12 print:border-b-4 print:border-black print:pb-4">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png?v=1" alt="Logo" className="w-12 h-12" />
                    <span className="comic-text text-2xl">Conto Maluco AI</span>
                  </div>
                  <div className="text-sm italic font-black uppercase">Gibi Bizarro</div>
                </div>

                <CardContent className="p-8 md:p-16 flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] w-full">
                  <p className="book-font text-3xl md:text-7xl lg:text-8xl text-center text-black leading-tight italic font-black break-words w-full overflow-wrap-anywhere">
                    {page.text}
                  </p>
                  <span className="page-number no-print mt-12 block text-center text-muted-foreground font-black uppercase tracking-widest text-sm md:text-base">
                    Página {index + 1} de {result.pages.length}
                  </span>
                </CardContent>

                <div className="hidden print:flex print:items-center print:justify-between print:w-full print:absolute print:bottom-8 print:px-12 print:border-t print:border-black/20 print:pt-4 text-black/60">
                  <span className="text-xs">https://conto-maluco-ai.vercel.app</span>
                  <span className="text-sm font-black">PÁGINA {index + 1}</span>
                </div>
              </Card>
            ))}

            <div className="flex flex-wrap gap-4 justify-center no-print pb-24 px-2">
              <Button onClick={handlePlayAudio} disabled={isAudioLoading} className="bg-accent text-black comic-border h-auto py-3 md:py-5 px-6 md:px-10 font-black uppercase text-xl md:text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex-1 min-w-[140px]">
                {isAudioLoading ? <Loader2 className="animate-spin" /> : isPlaying ? <Pause /> : <Volume2 />} {isPlaying ? 'Pausar' : 'Ouvir'}
              </Button>
              {audioUrl && (
                <Button onClick={handleDownloadAudio} className="bg-yellow-500 text-black comic-border h-auto py-3 md:py-5 px-6 md:px-10 font-black uppercase text-xl md:text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex-1 min-w-[140px]">
                  <Download className="w-5 h-5 md:w-6 md:h-6 mr-2" /> Baixar
                </Button>
              )}
              <Button onClick={() => window.print()} className="bg-secondary text-white comic-border h-auto py-3 md:py-5 px-6 md:px-10 font-black uppercase text-xl md:text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex-1 min-w-[140px]">
                <Printer className="w-5 h-5 md:w-6 md:h-6 mr-2" /> PDF
              </Button>
              <Button onClick={restart} variant="outline" className="bg-white text-black comic-border h-auto py-3 md:py-5 px-6 md:px-10 font-black uppercase text-xl md:text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex-1 min-w-[140px]">
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 mr-2" /> Novo
              </Button>
            </div>
          </div>
        ) : !selectedTheme ? (
          <div className="space-y-12">
            {!userApiKey && (
              <div className="mx-2 bg-yellow-100 border-4 border-black p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 comic-border rotate-3 shrink-0">
                    <Zap className="text-white w-6 h-6" />
                  </div>
                  <p className="font-bold text-black italic text-sm md:text-base leading-tight">
                    🚀 <span className="uppercase font-black">Histórias Infinitas:</span> Crie sua chave API gratuita e salve no app antes de começar para evitar erros!
                  </p>
                </div>
                <Button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="comic-border bg-white text-black font-black uppercase text-xs h-auto py-2 px-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all hover:bg-yellow-400"
                >
                  <Key className="w-4 h-4 mr-2" /> CONFIGURAR AGORA
                </Button>
              </div>
            )}

            <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700 px-2">
              <h2 className="text-4xl md:text-6xl font-black comic-text text-black uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
                QUAL CONFUSÃO CRIAREMOS HOJE?
              </h2>
              <p className="text-xl md:text-2xl font-bold text-primary italic book-font">
                Escolha o seu gênero literário favorito
              </p>
            </div>
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
                      <span className="bg-primary text-white px-3 py-1 comic-border">
                        {theme.questions.length} PERGUNTAS
                      </span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <Card className="comic-border bg-white overflow-hidden shadow-2xl mx-2">
            <CardContent className="p-6 md:p-12 space-y-6 md:space-y-10">
              <div className="flex justify-center mb-2">
                <div className="bg-accent p-4 md:p-6 comic-border -rotate-3 scale-110">
                  <selectedTheme.icon className="w-12 h-12 md:w-16 md:h-16 text-black" />
                </div>
              </div>
              <div className="text-center space-y-4">
                <p className="text-[10px] md:text-sm font-black text-primary uppercase tracking-[0.3em]">Pergunta {currentStep + 1} de {selectedTheme.questions.length}</p>
                <h2 className="text-2xl md:text-5xl lg:text-7xl font-black book-font text-black leading-tight italic break-words px-2 overflow-wrap-anywhere">
                  {selectedTheme.questions[currentStep]}
                </h2>
              </div>
              <Input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder="Sua resposta bizarra..."
                className="h-12 md:h-24 text-xl md:text-3xl lg:text-5xl border-[4px] md:border-[6px] border-black rounded-none book-font bg-yellow-50 text-center focus:ring-primary shadow-inner font-black italic px-4"
                autoFocus
              />
              <Button onClick={handleNext} disabled={!currentAnswer.trim()} className="w-full h-12 md:h-20 bg-primary text-white font-black text-xl md:text-4xl uppercase comic-border shadow-[0_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all comic-text">
                PRÓXIMO <Send className="ml-2 md:ml-4 w-5 h-5 md:w-10 md:h-10" />
              </Button>
              <div className="text-center no-print pt-2 md:pt-4">
                 <Button onClick={restart} variant="ghost" className="text-muted-foreground font-black hover:text-black italic text-xs md:text-lg uppercase tracking-widest">
                   Escolher outro tema
                 </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="fixed top-4 right-4 z-[100] no-print">
        <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" size="icon" className="w-10 h-10 md:w-12 md:h-12 hover:bg-transparent hover:scale-110 transition-transform p-0 border-none bg-transparent shadow-none">
          <Settings className="w-6 h-6 md:w-8 md:h-8 text-black/40 hover:text-black transition-colors" />
        </Button>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="comic-border bg-white p-4 md:p-6 w-[95vw] max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="mb-2 md:mb-4">
            <DialogTitle className="comic-text text-xl md:text-3xl font-black uppercase text-black italic text-center md:text-left">
              Configurações
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 pb-4">
              <div>
                <InstructionManual />
              </div>

              <div className="flex flex-col justify-center space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="font-black uppercase text-black flex items-center gap-2 text-sm md:text-lg italic">
                    <Key className="w-4 h-4 md:w-6 md:h-6 text-primary" /> Sua API Key Gemini
                  </label>
                  <Input 
                    type="password" 
                    value={userApiKey} 
                    onChange={(e) => setUserApiKey(e.target.value)} 
                    placeholder="AIza..."
                    className="border-[3px] md:border-[4px] border-black h-10 md:h-14 text-sm md:text-lg rounded-none font-black bg-yellow-50 focus:ring-primary shadow-inner italic" 
                  />
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground italic leading-tight">
                    Usar sua própria chave evita erros de cota e garante histórias infinitas!
                  </p>
                </div>

                <Button 
                  onClick={() => { saveApiKey(userApiKey); setIsSettingsOpen(false); }} 
                  className="w-full bg-secondary text-white font-black h-12 md:h-16 text-sm md:text-xl uppercase comic-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                >
                  SALVAR CHAVE!
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InstructionManual() {
  return (
    <div className="bg-accent/10 comic-border p-3 md:p-5 space-y-3 md:space-y-4 relative overflow-hidden">
      <div className="absolute -top-2 -right-2 p-2 opacity-5 rotate-12">
        <Info className="w-16 h-16 md:w-24 md:h-24 text-black" />
      </div>
      
      <h3 className="font-black uppercase text-sm md:text-lg text-black flex items-center gap-2">
        <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-primary" /> Passo a Passo:
      </h3>
      
      <div className="grid gap-2">
        {[
          { step: 1, text: "Acesse:", link: "https://aistudio.google.com/", linkLabel: "AI Studio" },
          { step: 2, text: "Faça login com Google" },
          { step: 3, text: "Clique em 'Get API key'" },
          { step: 4, text: "Gere sua chave gratuita" },
          { step: 5, text: "Copie o código 'AIza...'" },
          { step: 6, text: "Cole e salve aqui!" }
        ].map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="bg-primary text-white comic-border w-5 h-5 md:w-7 md:h-7 shrink-0 flex items-center justify-center font-black italic -rotate-6 text-[10px] md:text-sm">
              {item.step}
            </div>
            <p className="font-bold italic text-[11px] md:text-sm text-black leading-tight">
              {item.text}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary underline inline-flex items-center gap-0.5 hover:text-black transition-colors">
                   {item.linkLabel}
                </a>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
