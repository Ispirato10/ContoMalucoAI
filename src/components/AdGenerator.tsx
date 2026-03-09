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
  Globe, 
  Sparkles, 
  Download, 
  RefreshCw, 
  X, 
  Upload, 
  Calendar, 
  Ticket, 
  Megaphone, 
  Layout, 
  CheckCircle2,
  Copy,
  Info,
  Lightbulb,
  Zap,
  Search,
  Loader2
} from 'lucide-react';
import { generateAdScript, type GenerateAdScriptOutput } from '@/ai/flows/generate-ad-script';
import { extractBenefits } from '@/ai/flows/extract-benefits';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const TEMAS = [
  { id: 'Luxury-Premium', name: 'Luxo Comercial', desc: 'Estética Apple/Rolex, iluminação de estúdio' },
  { id: 'Cinematic-Viral', name: 'Cinematográfico Viral', desc: 'Dramático, cores ricas, movimento e energia' },
  { id: 'Tech-Futuristic', name: 'Tech / Futurista', desc: 'Neon, interfaces flutuantes e luz volumétrica' },
  { id: 'Organic-Nature', name: 'Orgânico / Premium', desc: 'Elementos naturais reais e luz solar suave' },
  { id: 'Fashion-Editorial', name: 'Editorial de Moda', desc: 'Grãos de filme, sombras duras e alto estilo' },
  { id: 'Modern-Clean', name: 'Moderno & Atraente', desc: 'Composições limpas mas impactantes' },
];

const EVENTOS = [
  { id: 'Standard', name: 'Sem Evento Específico' },
  { id: 'Christmas', name: 'Natal (Cenário Natalino de Luxo)' },
  { id: 'New Year', name: 'Ano Novo (Champagne e Brilho)' },
  { id: 'Black Friday', name: 'Black Friday (Energia e Ofertas)' },
  { id: 'Valentines', name: 'Dia dos Namorados (Romance Elegante)' },
  { id: 'Mothers Day', name: 'Dia das Mães' },
  { id: 'Fathers Day', name: 'Dia dos Pais' },
  { id: 'Halloween', name: 'Halloween (Estética Sombria Luxuosa)' },
  { id: 'Summer', name: 'Lançamento de Verão (Sol e Calor)' },
  { id: 'Winter', name: 'Lançamento de Inverno (Aconchego e Neve)' },
];

const PLATAFORMAS = [
  { id: 'Instagram Reels/Story', name: 'Reels / Stories (9:16)' },
  { id: 'Instagram/FB Feed', name: 'Feed Quadrado (1:1)' },
  { id: 'TikTok Ad', name: 'TikTok Viral (9:16)' },
  { id: 'Google Display', name: 'Banner Horizontal (16:9)' },
  { id: 'YouTube Community', name: 'YouTube / WhatsApp' },
];

export function AdGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  
  // Form State
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [theme, setTheme] = useState('Luxury-Premium');
  const [platform, setPlatform] = useState('Instagram Reels/Story');
  const [couponCode, setCouponCode] = useState('');
  const [promoText, setPromoText] = useState('');
  const [targetWebsite, setTargetWebsite] = useState('');
  const [eventDate, setEventDate] = useState('Standard');
  const [benefits, setBenefits] = useState('');
  
  const [scriptResult, setScriptResult] = useState<GenerateAdScriptOutput | null>(null);

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

  const handleExtractBenefits = async () => {
    if (!productUrl) {
      toast({ title: "URL Necessária", description: "Insira o link do produto para analisar.", variant: "destructive" });
      return;
    }
    setExtracting(true);
    try {
      const result = await extractBenefits({ url: productUrl });
      setBenefits(result.benefits);
      if (result.productName) {
        setProductName(result.productName);
      }
      toast({ title: "Análise Concluída", description: "Nome e diferenciais extraídos com sucesso do site." });
    } catch (error: any) {
      toast({ title: "Erro na análise", description: "Não foi possível extrair informações automaticamente.", variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!productName) {
      toast({ title: "Campo obrigatório", description: "Informe o nome do produto.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await generateAdScript({
        productName,
        productUrl: productUrl || undefined,
        theme,
        platform,
        couponCode: couponCode || undefined,
        promoText: promoText || undefined,
        targetWebsite: targetWebsite || undefined,
        eventDate: eventDate !== 'Standard' ? eventDate : undefined,
        productBenefits: benefits || undefined,
      });
      setScriptResult(result);
      setStep(step + 1);
      toast({ title: "Estratégia Gerada!", description: "Análise de benefícios e briefing concluídos." });
    } catch (error: any) {
      toast({ title: "Erro na geração", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!scriptResult) return;
    const blob = new Blob([JSON.stringify(scriptResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AD-BRIEFING-${productName.toUpperCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPrompt = () => {
    if (!scriptResult) return;
    navigator.clipboard.writeText(scriptResult.campaignBriefing.dallePrompt);
    toast({ title: "Copiado!", description: "O Prompt Maestro está na sua área de transferência." });
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card className="bg-card border-border shadow-2xl overflow-hidden border-t-4 border-t-accent">
        <div className="bg-primary/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2.5 rounded-xl shadow-lg shadow-accent/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-2xl text-white tracking-tight uppercase italic">DIRETOR DE ARTE IA</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-accent border-accent/30 font-bold uppercase tracking-widest bg-accent/5">Briefings de Elite</Badge>
                <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30 font-bold uppercase tracking-widest bg-green-400/5">Gemini 2.5 Analysis</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full transition-all duration-500 ${
                step >= s ? 'bg-accent' : 'bg-muted'
              }`} />
            ))}
          </div>
        </div>

        <CardContent className="p-8">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold text-accent uppercase tracking-tighter">BASE DE CONHECIMENTO IA</span>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-none text-[9px] font-bold">ANÁLISE DE URL</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-white/90">URL do Produto (Opcional)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://loja.com/seu-produto-aqui"
                        value={productUrl}
                        onChange={(e) => setProductUrl(e.target.value)}
                        className="bg-background border-accent/40 h-12 focus:ring-accent"
                      />
                      <Button 
                        variant="secondary" 
                        onClick={handleExtractBenefits} 
                        disabled={extracting || !productUrl}
                        className="h-12 px-4 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/20"
                      >
                        {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight italic">O Gemini lerá o site e preencherá o Nome e os Diferenciais automaticamente.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center justify-between">
                      Nome do Produto
                      {extracting && <Badge variant="outline" className="animate-pulse text-[9px] border-accent text-accent">IDENTIFICANDO...</Badge>}
                    </Label>
                    <Input
                      placeholder="Ex: Tênis Elite Runner X1"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="h-12 bg-background/50 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" /> 
                        Diferenciais & Benefícios
                      </span>
                      {extracting && <Badge variant="outline" className="animate-pulse text-[9px] border-accent text-accent">EXTRAINDO...</Badge>}
                    </Label>
                    <Textarea
                      placeholder="Os benefícios extraídos aparecerão aqui. Você pode editar ou adicionar mais."
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="min-h-[180px] bg-background/50 resize-none font-body border-border leading-relaxed"
                    />
                    <p className="text-[10px] text-muted-foreground italic leading-tight">Estes pontos serão transformados em elementos visuais de alto impacto no anúncio.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="font-bold text-white/90">Imagem Real do Produto (Referência)</Label>
                {!productImage ? (
                  <label className="flex flex-col items-center justify-center w-full min-h-[360px] border-2 border-dashed border-border/60 rounded-3xl cursor-pointer hover:bg-accent/5 transition-all group bg-background/20">
                    <div className="bg-muted p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <p className="text-sm font-bold text-white">Carregue a foto do seu produto</p>
                    <p className="text-xs text-muted-foreground mt-2 px-10 text-center italic">Necessário para que a IA integre seu produto real ao cenário criado.</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border border-border aspect-square bg-background/50 group shadow-inner">
                    <img src={productImage} alt="Produto" className="w-full h-full object-contain p-8" />
                    <button
                      onClick={() => setProductImage(null)}
                      className="absolute top-6 right-6 p-2.5 bg-destructive/90 hover:bg-destructive rounded-full text-white shadow-2xl transition-all hover:rotate-90"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-6 left-6 right-6">
                       <Badge className="bg-black/60 backdrop-blur-md border-white/20 text-[10px] w-full justify-center py-2 uppercase tracking-widest">Foto de Referência Ativa</Badge>
                    </div>
                  </div>
                )}
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full bg-accent hover:bg-accent/90 h-14 text-lg font-bold shadow-xl shadow-accent/20 transition-all uppercase italic"
                >
                  Próximo: Personalizar Campanha
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 font-bold text-white">
                    <Sparkles className="w-4 h-4 text-accent" /> DIREÇÃO DE ARTE (ESTILO VISUAL)
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TEMAS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                          theme === t.id 
                            ? 'bg-accent/10 border-accent ring-2 ring-accent/20' 
                            : 'bg-background/50 border-border hover:border-accent/40'
                        }`}
                      >
                        <div className="font-bold text-sm text-white">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight mt-1 italic">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2 font-bold text-white">
                    <Calendar className="w-4 h-4 text-accent" /> EVENTO OU DATA COMEMORATIVA
                  </Label>
                  <Select value={eventDate} onValueChange={setEventDate}>
                    <SelectTrigger className="h-12 bg-background/50 border-border rounded-xl">
                      <SelectValue placeholder="Escolha um evento sazonal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENTOS.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground italic">A IA criará um cenário comercial fundindo o estilo visual com este evento.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold"><Layout className="w-4 h-4 text-accent" /> Formato do Anúncio</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-12 bg-background/50 border-border rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATAFORMAS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold"><Ticket className="w-4 h-4 text-accent" /> Cupom</Label>
                    <Input placeholder="Ex: PROMO50" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="bg-background/50 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold"><Globe className="w-4 h-4 text-accent" /> Website</Label>
                    <Input placeholder="www.loja.com" value={targetWebsite} onChange={(e) => setTargetWebsite(e.target.value)} className="bg-background/50 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold"><Megaphone className="w-4 h-4 text-accent" /> Oferta / Texto Viral</Label>
                  <Input 
                    placeholder="Ex: O segredo para uma pele perfeita agora em oferta..." 
                    value={promoText} 
                    onChange={(e) => setPromoText(e.target.value)} 
                    className="bg-background/50 h-14 rounded-xl" 
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 border-border font-bold rounded-2xl">Voltar</Button>
                  <Button 
                    onClick={handleGenerateScript} 
                    disabled={loading} 
                    className="flex-[2] bg-accent hover:bg-accent/90 h-14 font-bold shadow-xl shadow-accent/20 rounded-2xl uppercase italic"
                  >
                    {loading ? <RefreshCw className="w-6 h-6 animate-spin mr-2" /> : <Wand2 className="w-6 h-6 mr-2" />}
                    {loading ? 'FUNDINDO DNA & ARTE...' : 'GERAR BRIEFING MAESTRO'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && scriptResult && (
            <div className="space-y-8 animate-in zoom-in-95 duration-700">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-green-500/10 p-5 rounded-full ring-8 ring-green-500/5">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-4xl font-headline font-bold text-white italic underline decoration-accent/30 underline-offset-8 uppercase">ESTRATÉGIA DE ELITE CONCLUÍDA</h2>
                <p className="text-muted-foreground max-w-2xl font-body text-lg">
                  Fundimos o estilo <span className="text-accent font-bold">"{theme}"</span> com <span className="text-accent font-bold">"{eventDate}"</span>. A IA extraiu benefícios informativos para o anúncio viral.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-background/80 rounded-3xl border border-border overflow-hidden shadow-2xl">
                    <div className="bg-muted p-5 flex items-center justify-between border-b border-border">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PROMPT MAESTRO (INGLÊS / DALL-E 3)</span>
                      </div>
                      <Button variant="secondary" size="sm" onClick={copyPrompt} className="h-9 gap-2 font-bold text-xs uppercase italic rounded-xl px-4">
                        <Copy className="w-3.5 h-3.5" /> COPIAR PROMPT
                      </Button>
                    </div>
                    <div className="p-8">
                      <p className="text-lg text-white leading-relaxed italic font-body">
                        "{scriptResult.campaignBriefing.dallePrompt}"
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-accent/5 border-accent/20 rounded-2xl">
                    <Info className="h-5 w-5 text-accent" />
                    <AlertTitle className="text-accent font-bold uppercase text-xs tracking-widest">GUIA DE CRIAÇÃO DO ANÚNCIO</AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
                      1. Abra o **ChatGPT Plus** (DALL-E 3).<br/>
                      2. **ANEXE A FOTO** do seu produto que você carregou aqui.<br/>
                      3. **COLE O PROMPT MAESTRO** acima.<br/>
                      4. A IA criará o anúncio comercial unindo seu produto ao cenário temático com alta fidelidade.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-muted/30 rounded-3xl border border-border p-8 space-y-6">
                    <h4 className="font-bold text-white text-xl flex items-center gap-2 italic uppercase tracking-tight">COPYWRITING DA CAMPANHA</h4>
                    <div className="space-y-5">
                      <div className="p-5 bg-background/50 rounded-2xl border border-border/50">
                        <div className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5"><Sparkles className="w-3 h-3"/> HEADLINE VIRAL</div>
                        <div className="text-lg text-white font-bold leading-tight">{scriptResult.campaignBriefing.copywriting.headline}</div>
                      </div>
                      <div className="p-5 bg-background/50 rounded-2xl border border-border/50">
                        <div className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1.5">LEGENDA INFORMATIVA</div>
                        <div className="text-sm text-muted-foreground italic leading-relaxed">{scriptResult.campaignBriefing.copywriting.description}</div>
                      </div>
                      <div className="p-5 bg-accent/10 rounded-2xl border border-accent/20">
                        <div className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1.5">BOTÃO / CTA</div>
                        <div className="text-sm text-white font-bold uppercase tracking-widest">{scriptResult.campaignBriefing.copywriting.callToAction}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button onClick={downloadJson} className="w-full bg-accent hover:bg-accent/90 h-16 text-lg font-bold shadow-2xl italic uppercase rounded-2xl">
                      <Download className="w-6 h-6 mr-2" /> BAIXAR BRIEFING COMPLETO (.JSON)
                    </Button>
                    <Button variant="outline" onClick={() => { setStep(1); setScriptResult(null); }} className="w-full h-12 font-bold uppercase text-xs rounded-xl tracking-widest">
                      INICIAR NOVA ESTRATÉGIA
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
