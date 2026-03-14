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
  RefreshCw,
  Image as ImageIcon,
  ArrowRight,
  ChevronLeft,
  Store,
  Calendar,
  Layers
} from 'lucide-react';
import { generateAdScript, type GenerateAdScriptOutput } from '@/ai/flows/generate-ad-script';
import { extractBenefits } from '@/ai/flows/extract-benefits';
import { createProfessionalAdImage } from '@/ai/flows/create-professional-ad-image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const STEPS = [
  { id: 1, name: 'Identificar', icon: Search },
  { id: 2, name: 'Direção', icon: Layout },
  { id: 3, name: 'Finalizar', icon: Sparkles },
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
      setProductName(result.productName);
      setBrandVibe(result.brandVibe);
      toast({ title: "Análise Concluída", description: "Identificamos a essência do seu produto." });
    } catch (e) {
      toast({ title: "Erro na análise", description: "O site pode estar bloqueando o acesso.", variant: "destructive" });
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
      
      // 2. Gera a imagem visual
      setGeneratingImage(true);
      const image = await createProfessionalAdImage({
        prompt: script.campaignBriefing.dallePrompt,
        productImage: productImage || undefined,
        platform
      });
      setFinalImageUrl(image.imageUrl);
      
      toast({ title: "Sucesso!", description: "Sua campanha de elite está pronta." });
    } catch (error: any) {
      toast({ title: "Erro na geração", description: error.message, variant: "destructive" });
      setStep(2);
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Stepper Header */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-8 glass px-8 py-4 rounded-full">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step >= s.id;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`p-2 rounded-full transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-muted-foreground'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${active ? 'text-white' : 'text-muted-foreground'}`}>{s.name}</span>
                {s.id < 3 && <div className={`w-8 h-px ${step > s.id ? 'bg-primary' : 'bg-white/10'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="glass border-white/5 premium-shadow rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-12 space-y-10 border-r border-white/5">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1">PASSO 01</Badge>
                  <h2 className="text-4xl font-headline font-bold text-white italic">O que vamos anunciar?</h2>
                  <p className="text-muted-foreground">Insira o link do seu produto ou descreva-o manualmente para que nossa IA entenda sua essência.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1">Link do Produto (URL)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://sualoja.com/produto" 
                        value={productUrl} 
                        onChange={(e) => setProductUrl(e.target.value)}
                        className="h-14 bg-white/5 border-white/10 rounded-2xl"
                      />
                      <Button onClick={handleExtract} disabled={extracting || !productUrl} className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/80">
                        {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1">Nome do Produto</Label>
                    <Input placeholder="Ex: Relógio Lux Noir" value={productName} onChange={(e) => setProductName(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1">Diferenciais e Benefícios</Label>
                    <Textarea 
                      placeholder="Quais os pontos fortes?" 
                      value={benefits} 
                      onChange={(e) => setBenefits(e.target.value)}
                      className="min-h-[140px] bg-white/5 border-white/10 rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="p-12 bg-white/[0.02] flex flex-col justify-between">
                <div className="space-y-8">
                  <Label className="text-xs font-bold uppercase tracking-widest ml-1">Foto Real (Opcional - Recomendado)</Label>
                  {!productImage ? (
                    <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all group">
                      <div className="bg-white/5 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-white uppercase tracking-widest">Subir Foto do Produto</p>
                      <p className="text-[10px] text-muted-foreground mt-2">Nossa IA manterá o produto real no cenário.</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-primary/20">
                      <img src={productImage} alt="Preview" className="w-full h-full object-contain p-8 bg-black/40" />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        onClick={() => setProductImage(null)} 
                        className="absolute top-4 right-4 rounded-xl shadow-xl"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-primary/90">PRODUTO IDENTIFICADO</Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={() => setStep(2)} className="w-full bg-primary h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 mt-8">
                  PRÓXIMO PASSO <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="p-12 space-y-10 border-r border-white/5">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1">PASSO 02</Badge>
                  <h2 className="text-4xl font-headline font-bold text-white italic">Direção Criativa</h2>
                  <p className="text-muted-foreground">Como deve ser a estética visual e o contexto da sua campanha?</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1">Estilo Visual</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {TEMAS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`text-left p-6 rounded-3xl border-2 transition-all duration-300 ${theme === t.id ? 'border-primary bg-primary/10 shadow-lg' : 'border-white/5 hover:border-white/20'}`}
                        >
                          <div className="font-bold text-sm text-white">{t.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1">Evento Sazonal (Opcional)</Label>
                    <Select value={event} onValueChange={setEvent}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EVENTOS.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-12 bg-white/[0.02] space-y-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1">Formato do Criativo</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLATAFORMAS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest ml-1">Chamada / Oferta Especial</Label>
                    <Input 
                      placeholder="Ex: 20% OFF usando o cupom BLACK24" 
                      value={promoText} 
                      onChange={(e) => setPromoText(e.target.value)}
                      className="h-14 bg-white/5 border-white/10 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-12">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl border-white/10"><ChevronLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                  <Button onClick={handleCreate} className="flex-[2] bg-primary h-14 font-bold rounded-2xl shadow-xl shadow-primary/20">
                    <Wand2 className="w-5 h-5 mr-2" /> GERAR CAMPANHA DE ELITE
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-12 space-y-12 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-[0.3em] px-6 py-2">Pronto para Anunciar</Badge>
                <h2 className="text-5xl font-headline font-bold text-white italic tracking-tight">Resultado da Direção de Arte</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-black/60 rounded-[3rem] border border-white/5 overflow-hidden relative shadow-2xl flex items-center justify-center aspect-[4/5]">
                  {generatingImage ? (
                    <div className="text-center space-y-6">
                      <div className="relative">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto opacity-40" />
                        <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-primary uppercase tracking-widest">Compondo Arte Final...</p>
                        <p className="text-[10px] text-muted-foreground italic">Processando texturas e iluminação 8k.</p>
                      </div>
                    </div>
                  ) : finalImageUrl ? (
                    <img src={finalImageUrl} alt="Resultado Final" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center opacity-20"><ImageIcon className="w-20 h-20 mx-auto" /></div>
                  )}

                  {finalImageUrl && (
                    <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black to-transparent">
                      <Button onClick={() => window.open(finalImageUrl)} className="w-full bg-primary h-14 font-bold rounded-2xl">
                        <Download className="w-4 h-4 mr-2" /> BAIXAR CRIATIVO
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02]"><Zap className="w-40 h-40 text-primary" /></div>
                    
                    <div className="space-y-4 relative">
                      <Label className="text-[10px] font-bold text-primary uppercase tracking-widest">Headline de Impacto</Label>
                      <h3 className="text-3xl font-bold text-white leading-tight italic">{scriptResult?.campaignBriefing.copywriting.headline}</h3>
                    </div>

                    <div className="space-y-4 relative">
                      <Label className="text-[10px] font-bold text-primary uppercase tracking-widest">Legenda Persuasiva</Label>
                      <p className="text-muted-foreground leading-relaxed text-lg font-body italic">{scriptResult?.campaignBriefing.copywriting.description}</p>
                    </div>

                    <div className="pt-6 border-t border-white/5 relative">
                      <Label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 block">Call to Action</Label>
                      <div className="bg-primary/10 text-primary border border-primary/20 py-4 px-6 rounded-2xl text-center font-bold tracking-widest uppercase text-xs italic">
                        {scriptResult?.campaignBriefing.copywriting.callToAction}
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => {setStep(1); setFinalImageUrl(null);}} className="w-full h-14 rounded-2xl border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest">
                    CRIAR NOVO ANÚNCIO
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
