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
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { generateAdScript, type GenerateAdScriptOutput } from '@/ai/flows/generate-ad-script';
import { extractBenefits } from '@/ai/flows/extract-benefits';
import { createProfessionalAdImage } from '@/ai/flows/create-professional-ad-image';
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
  { id: 'Summer', name: 'Lançamento de Verão (Sol e Calor)' },
  { id: 'Winter', name: 'Lançamento de Inverno (Aconchego e Neve)' },
];

const PLATAFORMAS = [
  { id: 'Instagram Reels/Story', name: 'Reels / Stories (9:16)' },
  { id: 'Instagram/FB Feed', name: 'Feed Quadrado (1:1)' },
  { id: 'TikTok Ad', name: 'TikTok Viral (9:16)' },
  { id: 'Google Display', name: 'Banner Horizontal (16:9)' },
];

export function AdGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
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

  const handleExtractBenefits = async () => {
    if (!productUrl) return;
    setExtracting(true);
    try {
      const result = await extractBenefits({ url: productUrl });
      setBenefits(result.benefits);
      if (result.productName) setProductName(result.productName);
      toast({ title: "Análise Concluída", description: "Diferenciais extraídos com sucesso." });
    } catch (error) {
      toast({ title: "Erro na Extração", description: "Não conseguimos ler o site automaticamente.", variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const handleProcessCampaign = async () => {
    if (!productName) {
      toast({ title: "Campo obrigatório", description: "Informe o nome do produto.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const script = await generateAdScript({
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
      setScriptResult(script);
      setStep(3);
      
      // Gerar imagem automaticamente após o script
      setGeneratingImage(true);
      const image = await createProfessionalAdImage({
        prompt: script.campaignBriefing.dallePrompt,
        productImage: productImage || undefined,
        platform
      });
      setFinalImageUrl(image.imageUrl);
      toast({ title: "Campanha Completa!", description: "Anúncio e imagem gerados." });
    } catch (error: any) {
      toast({ title: "Erro técnico", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  const downloadFinalResult = () => {
    if (!scriptResult || !finalImageUrl) return;
    const link = document.createElement('a');
    link.href = finalImageUrl;
    link.download = `AD-${productName.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card className="bg-card border-border shadow-2xl overflow-hidden border-t-4 border-t-accent">
        <div className="bg-primary/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2.5 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-2xl text-white tracking-tight uppercase italic">DIRETOR DE ARTE IA</h2>
              <Badge variant="outline" className="text-[10px] text-accent border-accent/30 font-bold uppercase tracking-widest bg-accent/5">Estilo PagePop Pro</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-accent' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        <CardContent className="p-8">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
                  <Label className="text-sm font-bold text-white/90">Interpretar Link do Produto</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://sualoja.com/produto"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="bg-background border-accent/40 h-12"
                    />
                    <Button variant="secondary" onClick={handleExtractBenefits} disabled={extracting || !productUrl} className="h-12 px-4 bg-accent/20">
                      {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Nome do Produto</Label>
                    <Input placeholder="Ex: Relógio Luxo" value={productName} onChange={(e) => setProductName(e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center justify-between">
                      Diferenciais do Produto
                      {extracting && <Badge className="animate-pulse">ANALISANDO...</Badge>}
                    </Label>
                    <Textarea
                      placeholder="Descreva o que torna seu produto único..."
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="min-h-[180px] bg-background/50 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="font-bold">Foto Real do Produto (Para Referência Visual)</Label>
                {!productImage ? (
                  <label className="flex flex-col items-center justify-center w-full min-h-[360px] border-2 border-dashed border-border/60 rounded-3xl cursor-pointer hover:bg-accent/5 transition-all bg-background/20">
                    <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="text-sm font-bold">Arraste a foto do produto aqui</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border border-border aspect-square bg-background/50">
                    <img src={productImage} alt="Produto" className="w-full h-full object-contain p-8" />
                    <button onClick={() => setProductImage(null)} className="absolute top-4 right-4 p-2 bg-destructive rounded-full text-white shadow-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <Button onClick={() => setStep(2)} className="w-full bg-accent h-14 text-lg font-bold shadow-xl italic">
                  PRÓXIMO: ESTILO & CAMPANHA
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 font-bold uppercase italic"><Sparkles className="w-4 h-4 text-accent" /> Estilo da Arte</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMAS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${theme === t.id ? 'border-accent bg-accent/10' : 'border-border'}`}
                      >
                        <div className="font-bold text-xs text-white">{t.name}</div>
                        <div className="text-[9px] text-muted-foreground mt-1">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2 font-bold uppercase italic"><Calendar className="w-4 h-4 text-accent" /> Evento / Data Especial</Label>
                  <Select value={eventDate} onValueChange={setEventDate}>
                    <SelectTrigger className="h-12 bg-background/50">
                      <SelectValue placeholder="Escolha um evento sazonal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENTOS.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold italic">FORMATO DO ANÚNCIO</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-12 bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>{PLATAFORMAS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold italic text-xs">CUPOM</Label>
                    <Input placeholder="PROMO10" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold italic text-xs">SITE OFICIAL</Label>
                    <Input placeholder="loja.com" value={targetWebsite} onChange={(e) => setTargetWebsite(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold italic text-xs">OFERTA PRINCIPAL</Label>
                  <Input placeholder="50% de Desconto apenas hoje!" value={promoText} onChange={(e) => setPromoText(e.target.value)} className="h-14" />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14">VOLTAR</Button>
                  <Button onClick={handleProcessCampaign} disabled={loading} className="flex-[2] bg-accent h-14 font-bold italic shadow-xl">
                    {loading ? <RefreshCw className="w-6 h-6 animate-spin mr-2" /> : <Wand2 className="w-6 h-6 mr-2" />}
                    {loading ? 'CRIANDO CAMPANHA...' : 'CRIAR ANÚNCIO AGORA'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in-95 duration-700">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-headline font-bold text-white italic uppercase underline decoration-accent/30 underline-offset-8">CAMPANHA FINALIZADA</h2>
                <p className="text-muted-foreground">O anúncio perfeito foi gerado integrando seu produto com o cenário escolhido.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-background/80 rounded-3xl border border-border overflow-hidden shadow-2xl group">
                    <div className="aspect-[4/5] relative bg-muted/20">
                      {generatingImage ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                          <Loader2 className="w-12 h-12 text-accent animate-spin" />
                          <p className="text-xs font-bold uppercase text-accent animate-pulse">Revelando a Obra de Arte...</p>
                        </div>
                      ) : finalImageUrl ? (
                        <img src={finalImageUrl} alt="Ad Final" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex items-center justify-center h-full"><ImageIcon className="w-20 h-20 text-muted-foreground/20" /></div>
                      )}
                    </div>
                    <div className="p-6 bg-muted/40 border-t border-border flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-accent uppercase">Arte Publicitária</span>
                        <span className="text-sm font-bold text-white uppercase italic">{productName}</span>
                      </div>
                      <Button onClick={downloadFinalResult} disabled={!finalImageUrl} className="bg-accent h-10 px-6 font-bold italic">
                        <Download className="w-4 h-4 mr-2" /> BAIXAR ARTE
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-muted/30 rounded-3xl border border-border p-8 space-y-6">
                    <h4 className="font-bold text-white text-xl flex items-center gap-2 italic uppercase">COPYWRITING DA PEÇA</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-background/50 rounded-xl border border-border/50">
                        <div className="text-[10px] text-accent font-bold uppercase mb-1">TÍTULO</div>
                        <div className="text-lg text-white font-bold">{scriptResult?.campaignBriefing.copywriting.headline}</div>
                      </div>
                      <div className="p-4 bg-background/50 rounded-xl border border-border/50">
                        <div className="text-[10px] text-accent font-bold uppercase mb-1">LEGENDA</div>
                        <div className="text-sm text-muted-foreground italic leading-relaxed">{scriptResult?.campaignBriefing.copywriting.description}</div>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-accent/5 border-accent/20 rounded-2xl">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <AlertTitle className="text-accent font-bold uppercase text-xs">CAMPANHA PRONTA</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                      Sua imagem foi gerada usando o Gemini 2.0 para manter a integridade do seu produto. Use a arte e a legenda nas suas redes sociais.
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" onClick={() => { setStep(1); setFinalImageUrl(null); }} className="w-full h-12 font-bold uppercase text-xs rounded-xl">
                    CRIAR NOVA CAMPANHA
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
