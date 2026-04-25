'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateCrazyStory, type StoryOutput } from '@/ai/flows/generate-crazy-story';
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
  ChevronRight,
  Ghost,
  Rocket,
  Heart,
  Sword,
  Shield,
  Zap,
  Wand2,
  Utensils
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

  const restart = () => {
    setSelectedTheme(null);
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
                className="comic-border h-auto py-4 px-6 font-bold flex gap-2 justify-center items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg hover:bg-yellow-50 whitespace-normal text-center"
              >
                <Key className="w-6 h-6 text-primary shrink-0" /> {userApiKey ? "Atualizar Minha Chave" : "Configurar Minha Chave"}
              </Button>
              <Button 
                onClick={() => processFinalStory(answers)} 
                className="comic-border bg-primary hover:bg-primary/90 h-auto py-4 px-6 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xl whitespace-normal text-center"
              >
                Tentar Novamente
              </Button>
            </div>
          </Card>
        ) : result ? (
          <div className="space-y-12 animate-in zoom-in-95 duration-700">
            <Card className="comic-border bg-primary p-12 text-center no-print shadow-2xl relative overflow-hidden comic-title-page">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
              <h2 className="text-5xl md:text-8xl font-black uppercase comic-text text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] relative z-10 break-words">
                {result.title}
              </h2>
              <div className="mt-8 relative z-10">
                <span className="bg-yellow-400 border-4 border-black px-8 py-3 font-black text-2xl rotate-3 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black uppercase">
                  GIBI DE COLECIONADOR
                </span>
              </div>
            </Card>

            <div className="space-y-8">
              {result.pages.map((page, index) => (
                <Card key={index} className="comic-border bg-white overflow-hidden shadow-2xl comic-page print:page-break-after-always relative paper-texture">
                  <CardContent className="p-8 md:p-16 flex flex-col items-center gap-6 min-h-[600px] justify-center">
                    <div className="absolute top-6 left-6 bg-yellow-400 border-4 border-black px-6 py-2 font-black text-2xl -rotate-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] z-20">
                      PÁG. {index + 1}
                    </div>
                    
                    <div className="w-full max-w-4xl p-10 bg-white border-[6px] border-black relative shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
                      <div className="absolute -top-6 -right-6 bg-primary border-4 border-black p-4 rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <p className="comic-text text-2xl md:text-4xl text-center text-black leading-tight italic font-black uppercase whitespace-pre-wrap">
                        {page.text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center no-print pb-24">
              <Button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/90 text-white comic-border h-auto py-6 px-12 font-black uppercase text-2xl shadow-2xl hover:scale-105 transition-all active:scale-95 whitespace-normal text-center max-w-xs">
                <Printer className="w-8 h-8 mr-4 inline" /> Baixar Gibi (PDF)
              </Button>
              <Button onClick={restart} variant="outline" className="comic-border h-auto py-6 px-12 font-black uppercase text-2xl bg-white hover:bg-gray-50 shadow-2xl hover:scale-105 transition-all active:scale-95 whitespace-normal text-center max-w-xs">
                <RotateCcw className="w-8 h-8 mr-4 inline" /> Novo Conto
              </Button>
            </div>
          </div>
        ) : !selectedTheme ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="md:col-span-2 text-center space-y-4 mb-4">
              <h2 className="text-4xl font-black comic-text uppercase text-black">Escolha seu Gênero!</h2>
              <p className="font-bold text-primary italic text-lg">Qual tipo de confusão você quer criar hoje?</p>
            </div>
            {THEMES.map((theme) => {
              const ThemeIcon = theme.icon;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className="comic-border bg-white p-8 text-left hover:bg-yellow-50 transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col gap-4 relative overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 bg-primary p-6 rotate-12 group-hover:rotate-0 transition-transform">
                    <ThemeIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-black comic-text uppercase text-black">{theme.name}</h3>
                  <p className="font-bold text-muted-foreground italic text-lg">{theme.description}</p>
                  <div className="mt-4 flex items-center gap-2 font-black uppercase text-xs bg-accent inline-flex px-3 py-1 border-2 border-black w-fit">
                    <BookOpen className="w-3 h-3" /> {theme.questions.length} Perguntas
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <Card className="comic-border bg-white overflow-hidden shadow-2xl relative">
            <div className="bg-secondary p-4 md:p-6 text-white flex justify-between items-center border-b-4 border-black">
              <span className="font-black uppercase tracking-widest text-sm md:text-lg flex items-center gap-3">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-accent" /> {selectedTheme.name} ({currentStep + 1}/{selectedTheme.questions.length})
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12">
                  <Settings className="w-6 h-6 md:w-8 md:h-8" />
                </Button>
                <Button variant="ghost" size="icon" onClick={restart} className="text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12">
                  <RotateCcw className="w-6 h-6 md:w-8 md:h-8" />
                </Button>
              </div>
            </div>
            <CardContent className="p-8 md:p-20 space-y-12">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black comic-text text-center text-black leading-tight drop-shadow-sm uppercase">
                  {selectedTheme.questions[currentStep]}
                </h2>
              </div>
              
              <div className="space-y-10 max-w-4xl mx-auto">
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="Escreva algo absurdo..."
                  className="h-16 md:h-20 text-lg md:text-2xl border-[6px] border-black rounded-none comic-text bg-yellow-50/50 text-center focus-visible:ring-0 focus:border-primary transition-colors placeholder:opacity-30"
                  autoFocus
                />
                <Button 
                  onClick={handleNext} 
                  disabled={!currentAnswer.trim()}
                  className="w-full h-auto py-6 md:py-8 bg-primary hover:bg-primary/90 text-white font-black text-2xl md:text-4xl uppercase comic-border transition-all shadow-[0_12px_0_0_rgba(0,0,0,1)] hover:translate-y-[-4px] active:translate-y-[8px] active:shadow-none whitespace-normal text-center"
                >
                  PRÓXIMO <Send className="w-8 h-8 md:w-12 md:h-12 ml-4 inline" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="comic-border bg-white p-6 md:p-10 max-w-xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="comic-text text-2xl md:text-3xl font-black uppercase flex items-center gap-3 text-black">
              <Key className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Chave Gemini
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground text-md md:text-lg leading-tight">
              Use sua própria chave do <strong>Google AI Studio</strong> para ignorar os limites do app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6 md:py-8">
            <div className="space-y-3">
              <label className="text-md md:text-lg font-black uppercase tracking-widest text-black">API Key (Gemini 2.5 Flash)</label>
              <Input 
                type="password" 
                placeholder="Cole sua chave AIza..." 
                value={userApiKey} 
                onChange={(e) => setUserApiKey(e.target.value)}
                className="border-4 border-black rounded-none comic-text h-14 md:h-16 text-xl md:text-2xl bg-yellow-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => { saveApiKey(userApiKey); setIsSettingsOpen(false); }} 
              className="comic-border bg-secondary hover:bg-secondary/90 w-full font-black uppercase text-white h-auto py-4 md:py-6 text-xl md:text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all whitespace-normal text-center"
            >
              Salvar e Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}