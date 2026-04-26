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
  Ghost,
  Rocket,
  Heart,
  Sword,
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
  {
    id: 'classic',
    name: 'Aventura Clássica',
    icon: Sword,
    description: 'O herói contra o vilão em um lugar estranho.',
    questions: [
      "Quem é o herói ou heroína dessa aventura?",
      "Onde esse personagem vive (um lugar bem estranho)?",
      "O que ele(a) faz para passar o tempo (algo bizarro)?",
      "Quem apareceu para atrapalhar tudo?",
      "O que esse intruso gritou bem alto?",
      "Como essa confusão terminou de um jeito maluco?",
    ]
  },
  {
    id: 'scifi',
    name: 'Odisseia Espacial',
    icon: Rocket,
    description: 'Confusões intergalácticas e tecnologia quebrada.',
    questions: [
      "Qual o nome da sua nave espacial capenga?",
      "Para qual planeta bizarro você está viajando?",
      "Qual o combustível dessa nave (não é gasolina)?",
      "Qual o primeiro alienígena que você encontrou ao pousar?",
      "O que esse alienígena estava comendo?",
      "O que aconteceu quando você tentou dizer 'olá'?",
      "Qual botão você apertou por engano na nave?",
      "Qual foi a mensagem de erro que apareceu na tela?",
      "Quem veio ao seu resgate pilotando um foguete?",
      "Como vocês escaparam do buraco negro de queijo?",
    ]
  },
  {
    id: 'horror',
    name: 'Mistério na Mansão',
    icon: Ghost,
    description: 'Um susto atrás do outro (ou quase isso).',
    questions: [
      "Quem é o medroso que resolveu entrar na mansão?",
      "Qual o nome da mansão abandonada?",
      "O que você estava procurando lá dentro?",
      "Qual o cheiro que tinha no corredor principal?",
      "Que barulho estranho veio do porão?",
      "Qual o nome do fantasma que apareceu de repente?",
      "O que o fantasma estava vestindo?",
      "O que você usou para se defender (algo inútil)?",
      "Qual foi a sua reação mais ridícula ao levar um susto?",
      "Como o mistério foi resolvido de forma decepcionante?",
      "Qual o segredo bobo que o fantasma escondia?",
      "Onde você foi parar depois de sair correndo?",
    ]
  },
  {
    id: 'drama',
    name: 'Novela Mexicana',
    icon: Heart,
    description: 'Drama, traição, café e revelações bombásticas.',
    questions: [
      "Quem é a protagonista sofrida com um nome enorme?",
      "Quem é o vilão rico que usa um bigode falso?",
      "Qual o nome da fazenda de café onde tudo acontece?",
      "Qual o segredo que a protagonista guardou por 20 anos?",
      "O que aconteceu no casamento que foi interrompido?",
      "Qual a frase dramática que alguém gritou antes de desmaiar?",
      "Quem é o herdeiro perdido que ninguém conhecia?",
      "Qual o objeto de ouro que foi roubado?",
      "Por que o café da fazenda é azul?",
      "O que o vilão colocou no suco da protagonista?",
      "Onde os dois rivais se enfrentaram com tapas?",
      "Qual a marca de nascença estranha que prova quem é quem?",
      "Quem voltou da morte com amnésia?",
      "O que estava escrito na carta misteriosa?",
      "Qual o nome do cachorro que sabe de toda a verdade?",
      "Como foi a cena final de choro na chuva?",
      "Quem se casou com quem no final das contas?",
      "Qual foi a última palavra dita no último episódio?",
    ]
  },
  {
    id: 'western',
    name: 'Velho Oeste',
    icon: Shield,
    description: 'Duelos ao meio-dia e xerifes medrosos.',
    questions: [
      "Quem é o xerife mais medroso da cidade?",
      "Qual o nome da cidade poeirenta onde ninguém toma banho?",
      "O que o xerife carrega no lugar da estrela de metal?",
      "Quem é o bandido que roubou o banco de algodão doce?",
      "Qual o apelido terrível desse bandido?",
      "O que eles usaram no duelo ao meio-dia (não era arma)?",
      "O que o perdedor teve que gritar enquanto fugia?",
      "Como a cidade comemorou a paz de um jeito estranho?",
    ]
  },
  {
    id: 'superhero',
    name: 'Super-Heróis',
    icon: Zap,
    description: 'Poderes inúteis e vilões com planos bobos.',
    questions: [
      "Qual o nome artístico do seu herói ou heroína?",
      "Qual o seu disfarce bizarro no dia a dia?",
      "Qual o seu superpoder totalmente inútil?",
      "Qual o seu ponto fraco ridículo?",
      "Qual o nome da sua base secreta (que não é nada secreta)?",
      "Quem é o vilão que quer dominar o mundo com buchos?",
      "Qual o plano maligno do vilão?",
      "O que o vilão usa como uniforme?",
      "Qual a frase de efeito que você grita ao entrar em ação?",
      "Qual veículo maluco você usa para se locomover?",
      "O que aconteceu na primeira batalha épica?",
      "Quem veio te ajudar e acabou atrapalhando?",
      "Qual objeto foi destruído durante a luta?",
      "Como vocês fizeram as pazes no final?",
    ]
  },
  {
    id: 'magic',
    name: 'Escola de Magia',
    icon: Wand2,
    description: 'Feitiços que dão errado e poções nojentas.',
    questions: [
      "Qual o nome da sua escola de magia escondida?",
      "Qual o formato da sua varinha mágica?",
      "Qual o seu feitiço favorito que nunca funciona?",
      "Qual animal de estimação estranho você levou para a aula?",
      "Qual o nome do professor mais rabugento da escola?",
      "O que ele estava ensinando quando tudo explodiu?",
      "Qual ingrediente nojento você colocou na poção por engano?",
      "Qual foi o efeito colateral dessa poção em você?",
      "O que o troféu da escola começou a dizer para todo mundo?",
      "Onde você se escondeu para não levar bronca?",
      "Como você salvou a escola usando apenas um sapato?",
    ]
  },
  {
    id: 'cooking',
    name: 'Culinária Maluca',
    icon: Utensils,
    description: 'Desastres na cozinha e jurados bravos.',
    questions: [
      "Quem é o cozinheiro que se acha o melhor do mundo?",
      "Qual o nome do restaurante mais chique e estranho da cidade?",
      "Qual o prato principal que ele estava tentando inventar?",
      "Qual ingrediente bizarro ele encontrou na geladeira?",
      "O que ele usou para mexer a comida (não era colher)?",
      "Qual o nome do crítico gastronômico que veio avaliar?",
      "Qual foi a reação do crítico ao dar a primeira garfada?",
      "O que o cozinheiro fez para tentar disfarçar o gosto ruim?",
      "Qual nota o restaurante recebeu no final dessa bagunça?",
    ]
  }
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
    toast({ title: "Chave Salva!", description: "Sua chave foi configurada com sucesso." });
    
    if (error && selectedTheme && answers.length === selectedTheme.questions.length) {
      processFinalStory(answers, trimmedKey);
    }
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

  const processFinalStory = async (finalAnswers: string[], forcedKey?: string) => {
    setIsFinalizing(true);
    setError(null);
    setResult(null);
    setAudioUrl(null);

    const apiKeyToUse = forcedKey || userApiKey;
    const isUsingUserKey = apiKeyToUse && apiKeyToUse.length > 20;

    try {
      const story = await generateCrazyStory({ 
        answers: finalAnswers,
        userApiKey: apiKeyToUse || undefined
      });
      setResult(story);
      setIsFinalizing(false);
      toast({ title: "História Criada!", description: "Prepare-se para rir muito!" });
    } catch (err: any) {
      console.error("Erro na geração:", err);
      if (isUsingUserKey) {
        setError("Eita! Parece que sua própria chave de API também atingiu o limite ou é inválida.");
      } else if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError("As requisições gratuitas do app acabaram. Insira sua própria chave Gemini para continuar.");
      } else {
        setError("Ocorreu um erro ao conectar com o Gemini 2.5 Flash.");
      }
      setIsFinalizing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (audioUrl) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    if (!result) return;

    setIsAudioLoading(true);
    try {
      const fullText = `${result.title}. ${result.pages.map(p => p.text).join(' ')}`;
      const audioResponse = await generateStoryAudio({ 
        text: fullText,
        userApiKey: userApiKey || undefined
      });
      setAudioUrl(audioResponse.media);
      setIsPlaying(true);
      toast({ title: "Áudio Pronto!", description: "Aumente o som para ouvir sua história." });
    } catch (err) {
      toast({ title: "Erro no Áudio", description: "Não conseguimos gerar a narração agora.", variant: "destructive" });
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioUrl || !result) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${result.title.replace(/\s+/g, '_')}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Iniciado!", description: "Sua história foi salva como áudio." });
  };

  const restart = () => {
    setSelectedTheme(null);
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer('');
    setResult(null);
    setError(null);
    setIsFinalizing(false);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <audio 
        ref={audioRef} 
        src={audioUrl || undefined} 
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {userApiKey && userApiKey.length > 20 && !result && !isFinalizing && (
        <div className="flex justify-center no-print">
          <div className="bg-green-100 text-green-700 border-2 border-green-500 px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase flex items-center gap-2 animate-bounce">
            <UserCheck className="w-3 h-3 md:w-4 md:h-4" /> Usando sua Chave Pessoal
          </div>
        </div>
      )}

      <div className="min-h-[300px] md:min-h-[400px]">
        {isFinalizing ? (
          <Card className="comic-border p-8 md:p-12 text-center space-y-6 bg-white animate-in fade-in zoom-in-95 duration-500 mx-2">
            <div className="relative inline-block">
              <Loader2 className="w-16 h-16 md:w-24 md:h-24 animate-spin text-primary mx-auto opacity-20" />
              <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-xl md:text-3xl font-black comic-text text-black uppercase leading-tight">Gemini 2.5 está escrevendo...</h2>
            <p className="italic text-muted-foreground font-bold text-sm md:text-lg">Transformando suas respostas em um conto épico!</p>
          </Card>
        ) : error ? (
          <Card className="comic-border p-8 md:p-12 text-center space-y-6 bg-white border-destructive mx-2">
            <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-destructive mx-auto" />
            <h2 className="text-xl md:text-2xl font-black comic-text text-black uppercase">Cota Esgotada!</h2>
            <p className="font-bold text-muted-foreground text-sm md:text-lg">{error}</p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Button 
                variant="outline" 
                onClick={() => setIsSettingsOpen(true)} 
                className="comic-border h-auto py-3 md:py-4 px-4 font-bold flex gap-2 justify-center items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-lg hover:bg-yellow-50 whitespace-normal text-center"
              >
                <Key className="w-5 h-5 text-primary shrink-0" /> Configurar Chave
              </Button>
              <Button 
                onClick={() => processFinalStory(answers)} 
                className="comic-border bg-primary hover:bg-primary/90 h-auto py-3 md:py-4 px-4 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-base md:text-xl whitespace-normal text-center"
              >
                Tentar Novamente
              </Button>
            </div>
          </Card>
        ) : result ? (
          <div className="space-y-8 md:space-y-12 animate-in zoom-in-95 duration-700 px-2 md:px-0">
            <Card className="comic-border bg-primary p-8 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] md:min-h-[500px] comic-title-page">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] no-print"></div>
              <h2 className="text-4xl md:text-8xl font-black uppercase comic-text text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] relative z-10 break-words leading-tight max-w-full print:text-black print:drop-shadow-none">
                {result.title}
              </h2>
              <div className="mt-8 md:mt-12 relative z-10 no-print">
                <span className="bg-yellow-400 border-[3px] md:border-6 border-black px-6 md:px-12 py-3 md:py-5 font-black text-xl md:text-4xl rotate-3 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black uppercase">
                  CONTOS BIZARROS AI
                </span>
              </div>
            </Card>

            <div className="space-y-8 md:space-y-12">
              {result.pages.map((page, index) => (
                <Card key={index} className="comic-border bg-white overflow-hidden shadow-2xl relative paper-texture comic-page">
                  <CardContent className="p-8 md:p-24 flex flex-col items-center gap-10 min-h-[500px] md:min-h-[700px] justify-center">
                    <div className="absolute top-6 left-6 bg-yellow-400 border-[4px] border-black px-4 md:px-10 py-2 md:py-4 font-black text-lg md:text-3xl -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 no-print">
                      CAPÍTULO {index + 1}
                    </div>
                    
                    <div className="w-full max-w-4xl p-8 md:p-16 bg-white border-[6px] border-black relative shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] print:border-none print:shadow-none comic-caption">
                      <p className="book-font text-3xl md:text-6xl text-center text-black leading-tight italic font-black print:not-italic print:text-4xl print:text-left">
                        {page.text}
                      </p>
                    </div>
                    <span className="hidden print:block page-number">- Pág. {index + 1} -</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 justify-center no-print pb-24 items-stretch">
              <Button 
                onClick={handlePlayAudio} 
                disabled={isAudioLoading}
                className="bg-accent hover:bg-accent/90 text-black comic-border h-auto py-5 md:py-8 px-6 md:px-10 font-black uppercase text-xl md:text-3xl shadow-2xl hover:scale-105 transition-all active:scale-95 text-center flex-1 min-w-[200px]"
              >
                {isAudioLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin mr-3" />
                ) : isPlaying ? (
                  <><Pause className="w-8 h-8 md:w-10 md:h-10 mr-3" /> Pausar</>
                ) : (
                  <><Volume2 className="w-8 h-8 md:w-10 md:h-10 mr-3" /> Ouvir</>
                )}
              </Button>

              {audioUrl && (
                <Button 
                  onClick={handleDownloadAudio} 
                  className="bg-yellow-500 hover:bg-yellow-600 text-black comic-border h-auto py-5 md:py-8 px-6 md:px-10 font-black uppercase text-xl md:text-3xl shadow-2xl hover:scale-105 transition-all active:scale-95 text-center flex-1 min-w-[200px]"
                >
                  <Download className="w-8 h-8 md:w-10 md:h-10 mr-3" /> Áudio
                </Button>
              )}

              <Button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/90 text-white comic-border h-auto py-5 md:py-8 px-6 md:px-10 font-black uppercase text-xl md:text-3xl shadow-2xl hover:scale-105 transition-all active:scale-95 text-center flex-1 min-w-[200px]">
                <Printer className="w-8 h-8 md:w-10 md:h-10 mr-3" /> PDF
              </Button>
              
              <Button onClick={restart} variant="outline" className="comic-border h-auto py-5 md:py-8 px-6 md:px-10 font-black uppercase text-xl md:text-3xl bg-white hover:bg-gray-50 shadow-2xl hover:scale-105 transition-all active:scale-95 text-center flex-1 min-w-[200px]">
                <RotateCcw className="w-8 h-8 md:w-10 md:h-10 mr-3" /> Novo
              </Button>
            </div>
          </div>
        ) : !selectedTheme ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2">
            <div className="sm:col-span-2 text-center space-y-2 md:space-y-4 mb-4">
              <h2 className="text-2xl md:text-4xl font-black comic-text uppercase text-black leading-tight">Qual confusão criaremos hoje?</h2>
              <p className="font-bold text-primary italic text-sm md:text-lg">Escolha o seu gênero literário favorito!</p>
            </div>
            {THEMES.map((theme) => {
              const ThemeIcon = theme.icon;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className="comic-border bg-white p-6 md:p-8 text-left hover:bg-yellow-50 transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-primary p-4 md:p-6 rotate-12 group-hover:rotate-0 transition-transform">
                    <ThemeIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-black comic-text uppercase text-black pr-10">{theme.name}</h3>
                  <p className="font-bold text-muted-foreground italic text-xs md:text-lg leading-snug book-font">{theme.description}</p>
                  <div className="mt-2 flex items-center gap-2 font-black uppercase text-[10px] md:text-xs bg-accent inline-flex px-2 py-1 border-2 border-black w-fit">
                    <BookOpen className="w-3 h-3" /> {theme.questions.length} Perguntas
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <Card className="comic-border bg-white overflow-hidden shadow-2xl relative mx-2">
            <div className="bg-secondary p-3 md:p-6 text-white flex justify-between items-center border-b-[4px] border-black">
              <span className="font-black uppercase tracking-widest text-[10px] md:text-lg flex items-center gap-2 md:gap-3">
                <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-accent" /> {selectedTheme.name} ({currentStep + 1}/{selectedTheme.questions.length})
              </span>
              <div className="flex items-center gap-1 md:gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="text-white hover:bg-white/20 h-8 w-8 md:h-12 md:w-12">
                  <Settings className="w-5 h-5 md:w-8 md:h-8" />
                </Button>
                <Button variant="ghost" size="icon" onClick={restart} className="text-white hover:bg-white/20 h-8 w-8 md:h-12 md:w-12">
                  <RotateCcw className="w-5 h-5 md:w-8 md:h-8" />
                </Button>
              </div>
            </div>
            <CardContent className="p-6 md:p-20 space-y-8 md:space-y-12">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-3xl font-bold book-font text-center text-black leading-tight">
                  {selectedTheme.questions[currentStep]}
                </h2>
              </div>
              
              <div className="space-y-8 md:space-y-10 max-w-4xl mx-auto">
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="Escreva sua resposta..."
                  className="h-14 md:h-20 text-base md:text-2xl border-[4px] md:border-[6px] border-black rounded-none book-font bg-yellow-50/50 text-center focus-visible:ring-0 focus:border-primary transition-colors"
                  autoFocus
                />
                <Button 
                  onClick={handleNext} 
                  disabled={!currentAnswer.trim()}
                  className="w-full h-auto py-4 md:py-8 bg-primary hover:bg-primary/90 text-white font-black text-xl md:text-3xl uppercase comic-border transition-all shadow-[0_8px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-[0_4px_0_0_rgba(0,0,0,1)] whitespace-normal"
                >
                  PRÓXIMO <Send className="w-6 h-6 md:w-10 md:h-10 ml-2 md:ml-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="comic-border bg-white p-6 md:p-10 max-w-xl mx-2">
          <DialogHeader className="space-y-3">
            <DialogTitle className="comic-text text-xl md:text-3xl font-black uppercase flex items-center gap-3 text-black">
              <Key className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Chave Gemini
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground text-sm md:text-lg leading-tight">
              Use sua própria chave do <strong>Google AI Studio</strong> para continuar criando sem limites.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 md:py-8">
            <div className="space-y-2">
              <label className="text-sm md:text-lg font-black uppercase tracking-widest text-black">API Key</label>
              <Input 
                type="password" 
                placeholder="Cole sua chave AIza..." 
                value={userApiKey} 
                onChange={(e) => setUserApiKey(e.target.value)}
                className="border-[3px] md:border-4 border-black rounded-none comic-text h-12 md:h-16 text-lg md:text-2xl bg-yellow-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => { saveApiKey(userApiKey); setIsSettingsOpen(false); }} 
              className="comic-border bg-secondary hover:bg-secondary/90 w-full font-black uppercase text-white h-auto py-3 md:py-4 text-lg md:text-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
