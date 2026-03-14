'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Wand2, 
  Search, 
  Upload, 
  X, 
  Loader2, 
  Download, 
  Zap, 
  Sparkles, 
  Layout, 
  Image as ImageIcon,
  ArrowRight,
  ChevronLeft,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { generateAdScript, type GenerateAdScriptOutput } from '@/ai/flows/generate-ad-script';
import { extractBenefits } from '@/ai/flows/extract-benefits';
import { createProfessionalAdImage } from '@/ai/flows/create-professional-ad-image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const STEPS = [
  { id: 1, name: 'Produto', icon: Search },
  { id: 2, name: 'Estilo', icon: Layout },
  { id: 3, name: 'Gerar', icon: Sparkles },
];

const TEMAS = [
  { id: 'Luxury-Premium', name: 'Luxo Comercial', desc: 'Estética Apple/Rolex' },
  { id: 'Cinematic-Viral', name: 'Cinematográfico', desc: 'Dramático e Impactante' },
  { id: 'Minimalist-Clean', name: 'Minimalista', desc: 'Foco no essencial' },
  { id: 'Tech-Neon', name: 'Futurista / Tech', desc: 'Luzes neon e reflexos' },
];

const EVENTOS = [
  { id: 'None', name: 'Nenhum / Padrão' },
  { id: 'Black-Friday', name: 'Black Friday (Neon & Dark)' },
  { id: 'Christmas', name: 'Natal (Ouro & Vermelho)' },
  { id: 'New-Year', name: 'Ano Novo (Glamour & Brilho)' },
  { id: 'Summer-Sales', name: 'Verão (Quente & Vibrante)' },
];

const PLATAFORMAS = [
  { id: 'Reels-Story', name: 'Story / TikTok (9:16)' },
  { id: 'Insta-FB-Feed', name: 'Feed Quadrado (1:1)' },
  { id: 'Google-Banner', name: 'Banner Horizontal (16:9)' },
];

export function AdGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  
  // States do Produto
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [benefits, setBenefits] = useState('');
  const [brandVibe, setBrandVibe] = useState('');
  
  // States da Campanha
  const [theme, setTheme] = useState('Luxury-Premium');
  const [event, setEvent] = useState('None');
  const [platform, setPlatform] = useState('Reels-Story');
  const [promoText, setPromoText] = useState('');
  
  // Resultados
  const [scriptResult, setScriptResult] = useState<GenerateAdScriptOutput | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 150 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "O limite é 150MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!productUrl) return;
    setExtracting(true);
    try {
      const result = await extractBenefits({ url: productUrl });
      setBenefits(result.benefits);
      if (result.productName) setProductName(result.productName);
      setBrandVibe(result.brandVibe);
      toast({ title: "Análise Concluída", description: "Identificamos a essência do seu produto." });
    } catch (e) {
      toast({ title: "Instabilidade na análise", description: "Não conseguimos ler este link automaticamente.", variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const handleCreate = async () => {
    if (!productName) {
      toast({ title: "Nome faltante", description: "Dê um nome ao seu produto.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setStep(3);
    try {
      // 1. Gera o script e o prompt maestro
      const script = await generateAdScript({
        productName,
        productUrl: productUrl || undefined,
        theme: `${theme} (Marca: ${brandVibe})`,
        platform,
        promoText: promoText || undefined,
        eventDate: event !== 'None' ? event : undefined,
        productBenefits: benefits || undefined,
      });
      setScriptResult(script);
      
      // 2. Gera a imagem visual profissional
      setGeneratingImage(true);
      const image = await createProfessionalAdImage({
        prompt: script.campaignBriefing.dallePrompt,
        productImage: productImage || undefined,
        platform
      });
      setFinalImageUrl(image.imageUrl);
      
      toast({ title: "Campanha Criada!", description: "Sua peça publicitária de elite está pronta." });
    } catch (error: any) {
      toast({ title: "Erro na geração", description: "Falha ao conectar com a IA. Tente novamente.", variant: "destructive" });
      setStep(2);
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
      {/* Stepper Premium */}
      <div className="flex justify-center">
        <div className="flex items-center gap-6 glass px-8 py-4 rounded-full border-white/10 shadow-2xl">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step >= s.id;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`p-2 rounded-full transition-all duration-500 ${active ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/40' : 'bg-white/5 text-muted-foreground'}`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block ${active ? 'text-white' : 'text-muted-foreground'}`}>{s.name}</span>
                {s.id < 3 && <div className={`w-12 h-px transition-colors duration-500 ${step > s.id ? 'bg-primary' : 'bg-white/10'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="glass border-white/5 premium-shadow rounded-[3rem] overflow-hidden border-t border-l border-white/10">
        <CardContent className="p-0">
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 animate-in fade-in duration-500">
              <div className="p-12 space-y-10 border-r border-white/5">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1">ETAPA 01</Badge>
                  <h2 className="text-5xl font-headline font-bold text-white italic tracking-tight">O que vamos anunciar?</h2>
                  <p className="text-muted-foreground text-lg italic">O AdVision AI interpreta seu link ou imagem para extrair diferenciais de luxo automaticamente.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary ml-1">Analisar Link do Produto</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://sualoja.com/produto-luxo" 
                        value={productUrl} 
                        onChange={(e) => setProductUrl(e.target.value)}
                        className="h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary/50 text-white"
                      />
                      <Button onClick={handleExtract} disabled={extracting || !productUrl} className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/80 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                        {extracting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary ml-1">Nome Comercial</Label>
                    <Input placeholder="Ex: Relógio Noir Edition" value={productName} onChange={(e) => setProductName(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-2xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary ml-1">Diferenciais Estratégicos</Label>
                    <Textarea 
                      placeholder="Descreva o que torna seu produto único..." 
                      value={benefits} 
                      onChange={(e) => setBenefits(e.target.value)}
                      className="min-h-[160px] bg-white/5 border-white/10 rounded-[2rem] p-6 focus:ring-primary text-white italic"
                    />
                  </div>
                </div>
              </div>

              <div className="p-12 bg-white/[0.02] flex flex-col justify-between">
                <div className="space-y-8 text-center lg:text-left">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary ml-1">Foto Real (Recomendado)</Label>
                    <p className="text-xs text-muted-foreground italic">Nossa IA manterá seu produto real integrando-o ao cenário de luxo.</p>
                  </div>
                  
                  {!productImage ? (
                    <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-white/10 rounded-[3rem] cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all group relative overflow-hidden">
                      <div className="bg-white/5 p-8 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-white/5">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-white uppercase tracking-widest">Enviar Foto Original</p>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">Formatos: JPG, PNG até 150MB</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-primary/30 shadow-2xl group">
                      <img src={productImage} alt="Preview" className="w-full h-full object-contain p-12 bg-black/60" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          size="lg" 
                          variant="destructive" 
                          onClick={() => setProductImage(null)} 
                          className="rounded-full px-8 shadow-2xl"
                        >
                          <X className="w-5 h-5 mr-2" /> REMOVER
                        </Button>
                      </div>
                      <div className="absolute bottom-6 left-6">
                        <Badge className="bg-primary px-4 py-1 text-[10px] tracking-widest">PRODUTO IDENTIFICADO</Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={() => setStep(2)} className="w-full bg-primary h-16 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/30 mt-8 hover:scale-[1.02] transition-transform">
                  DEFINIR DIREÇÃO DE ARTE <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 animate-in slide-in-from-right duration-700">
              <div className="p-12 space-y-10 border-r border-white/5">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1">ETAPA 02</Badge>
                  <h2 className="text-5xl font-headline font-bold text-white italic tracking-tight">Direção de Arte</h2>
                  <p className="text-muted-foreground text-lg italic">Escolha a estética visual e o contexto sazonal da sua campanha.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary ml-1">Estilo Visual Maestro</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {TEMAS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`text-left p-6 rounded-[2rem] border-2 transition-all duration-500 relative group overflow-hidden ${theme === t.id ? 'border-primary bg-primary/10 shadow-2xl scale-[1.02]' : 'border-white/5 hover:border-white/20'}`}
                        >
                          {theme === t.id && <div className="absolute top-4 right-4"><CheckCircle2 className="w-4 h-4 text-primary" /></div>}
                          <div className={`font-bold text-sm transition-colors ${theme === t.id ? 'text-white' : 'text-muted-foreground group-hover:text-white'}`}>{t.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-2 italic">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary ml-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Temas Sazonais (Opcional)
                    </Label>
                    <Select value={event} onValueChange={setEvent}>
                      <SelectTrigger className="h-16 rounded-2xl bg-white/5 border-white/10 text-white italic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-white/10 rounded-2xl">
                        {EVENTOS.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-12 bg-white/[0.02] space-y-10 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary ml-1 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Formato de Entrega
                    </Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="h-16 rounded-2xl bg-white/5 border-white/10 text-white italic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-white/10 rounded-2xl">
                        {PLATAFORMAS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary ml-1">Oferta Irresistível</Label>
                    <Input 
                      placeholder="Ex: 30% OFF com cupom LUXO30" 
                      value={promoText} 
                      onChange={(e) => setPromoText(e.target.value)}
                      className="h-16 bg-white/5 border-white/10 rounded-2xl text-white italic"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-12">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest"><ChevronLeft className="w-4 h-4 mr-2" /> VOLTAR</Button>
                  <Button onClick={handleCreate} className="flex-[2] bg-primary h-16 font-bold rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02]">
                    <Wand2 className="w-6 h-6 mr-2" /> CRIAR CAMPANHA DE ELITE
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-12 space-y-12 animate-in zoom-in-95 duration-700">
              <div className="text-center space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-[0.4em] px-8 py-2 text-[10px] font-bold">Arte Finalizada</Badge>
                <h2 className="text-6xl font-headline font-bold text-white italic tracking-tighter">Sua Obra de Arte Publicitária</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-black/80 rounded-[4rem] border border-white/5 overflow-hidden relative shadow-2xl flex items-center justify-center aspect-[4/5] group">
                  {generatingImage ? (
                    <div className="text-center space-y-8 p-12">
                      <div className="relative inline-block">
                        <Loader2 className="w-24 h-24 text-primary animate-spin opacity-40" />
                        <Zap className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-lg font-bold text-primary uppercase tracking-[0.3em] animate-pulse">Compondo Arte Final...</p>
                        <p className="text-xs text-muted-foreground italic max-w-xs mx-auto">Renderizando iluminação de estúdio e texturas cinematográficas em 8k.</p>
                      </div>
                      <Progress value={generatingImage ? 65 : 100} className="h-1 w-48 mx-auto bg-white/5" />
                    </div>
                  ) : finalImageUrl ? (
                    <>
                      <img src={finalImageUrl} alt="Resultado Final" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-10 inset-x-10">
                        <Button onClick={() => window.open(finalImageUrl)} className="w-full bg-primary h-16 font-bold rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                          <Download className="w-5 h-5 mr-3" /> BAIXAR CRIATIVO DE ELITE
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center opacity-20"><ImageIcon className="w-24 h-24 mx-auto" /></div>
                  )}
                </div>

                <div className="space-y-8 flex flex-col justify-center">
                  <div className="p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/5 space-y-10 relative overflow-hidden backdrop-blur-3xl">
                    <div className="absolute -top-20 -right-20 p-8 opacity-[0.03] rotate-12"><Sparkles className="w-80 h-80 text-primary" /></div>
                    
                    <div className="space-y-4 relative">
                      <Label className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Headline de Impacto</Label>
                      <h3 className="text-4xl font-headline font-bold text-white leading-tight italic tracking-tight">{scriptResult?.campaignBriefing.copywriting.headline}</h3>
                    </div>

                    <div className="space-y-4 relative">
                      <Label className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Legenda Persuasiva</Label>
                      <p className="text-muted-foreground leading-relaxed text-xl font-body italic">{scriptResult?.campaignBriefing.copywriting.description}</p>
                    </div>

                    <div className="pt-8 border-t border-white/10 relative">
                      <Label className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-4 block">Call to Action (CTA)</Label>
                      <div className="bg-primary/20 text-primary border border-primary/40 py-5 px-8 rounded-3xl text-center font-bold tracking-[0.3em] uppercase text-sm italic shadow-inner">
                        {scriptResult?.campaignBriefing.copywriting.callToAction}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => {setStep(1); setFinalImageUrl(null);}} className="flex-1 h-16 rounded-2xl border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                      INICIAR NOVA CRIAÇÃO
                    </Button>
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em]">
                      ADAPTAR FORMATO
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
