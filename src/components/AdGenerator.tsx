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
  CheckCircle2, 
  Download, 
  Zap, 
  Sparkles, 
  Layout, 
  RefreshCw,
  Image as ImageIcon,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { generateAdScript, type GenerateAdScriptOutput } from '@/ai/flows/generate-ad-script';
import { extractBenefits } from '@/ai/flows/extract-benefits';
import { createProfessionalAdImage } from '@/ai/flows/create-professional-ad-image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TEMAS = [
  { id: 'Luxury-Premium', name: 'Luxo Comercial', desc: 'Estética Apple/Rolex' },
  { id: 'Cinematic-Viral', name: 'Cinematográfico', desc: 'Dramático e Impactante' },
  { id: 'Tech-Futuristic', name: 'Tech / Futurista', desc: 'Neon e Luz Volumétrica' },
  { id: 'Organic-Nature', name: 'Orgânico / Clean', desc: 'Luz Solar e Natureza' },
];

const EVENTOS = [
  { id: 'Standard', name: 'Padrão / Atemporal' },
  { id: 'Christmas', name: 'Natal (Ouro & Neve)' },
  { id: 'Black Friday', name: 'Black Friday (Neon)' },
  { id: 'New Year', name: 'Ano Novo (Glamour)' },
  { id: 'Summer', name: 'Verão (Vibrante)' },
];

const PLATAFORMAS = [
  { id: 'Instagram Reels/Story', name: 'Story/TikTok (9:16)' },
  { id: 'Instagram/FB Feed', name: 'Instagram Feed (1:1)' },
  { id: 'Google Banner', name: 'Banner Site (16:9)' },
];

export function AdGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  
  // States
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [theme, setTheme] = useState('Luxury-Premium');
  const [eventDate, setEventDate] = useState('Standard');
  const [platform, setPlatform] = useState('Instagram Reels/Story');
  const [benefits, setBenefits] = useState('');
  const [promoText, setPromoText] = useState('');
  const [brandVibe, setBrandVibe] = useState('');
  
  const [scriptResult, setScriptResult] = useState<GenerateAdScriptOutput | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 150 * 1024 * 1024) {
        toast({ title: "Erro", description: "O limite é 150MB.", variant: "destructive" });
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
      toast({ title: "IA: Análise Concluída", description: "Dados extraídos com sucesso." });
    } catch (e) {
      toast({ title: "Erro na conexão", description: "Tente descrever o produto manualmente.", variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!productName) {
      toast({ title: "Atenção", description: "Informe o nome do produto.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const script = await generateAdScript({
        productName,
        productUrl: productUrl || undefined,
        theme: `${theme} (Estética: ${brandVibe})`,
        platform,
        promoText: promoText || undefined,
        eventDate: eventDate !== 'Standard' ? eventDate : undefined,
        productBenefits: benefits || undefined,
      });
      setScriptResult(script);
      setStep(3);
      
      setGeneratingImage(true);
      const image = await createProfessionalAdImage({
        prompt: script.campaignBriefing.dallePrompt,
        productImage: productImage || undefined,
        platform
      });
      setFinalImageUrl(image.imageUrl);
      toast({ title: "Campanha Criada!", description: "Imagem e copy finalizados." });
    } catch (error: any) {
      toast({ title: "Erro na Geração", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card className="bg-card/50 backdrop-blur-xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden border-t-2 border-t-accent/20">
        {/* Nav de Passos */}
        <div className="bg-primary/5 p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-accent shadow-lg shadow-accent/40 p-2.5 rounded-2xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-2xl text-white italic tracking-wide uppercase">Diretor de Arte IA</h2>
              <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Potencializado por Gemini & Imagen</p>
            </div>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-10 rounded-full transition-all duration-500 ${step >= s ? 'bg-accent shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <CardContent className="p-10">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-8">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4">
                  <Label className="text-[11px] font-bold text-accent uppercase tracking-[0.2em]">Passo 1: Identificar Produto</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Cole o link do produto aqui..."
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="bg-background/80 border-white/10 h-14 rounded-2xl focus:ring-accent"
                    />
                    <Button 
                      variant="secondary" 
                      onClick={handleExtract} 
                      disabled={extracting || !productUrl}
                      className="h-14 w-14 rounded-2xl bg-accent hover:bg-accent/80 text-white"
                    >
                      {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic px-2">A IA irá ler o site e preencher os diferenciais automaticamente.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-sm ml-2">Nome Comercial</Label>
                    <Input placeholder="Ex: Relógio Lux Noir" value={productName} onChange={(e) => setProductName(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-sm ml-2">Diferenciais Estratégicos</Label>
                    <Textarea
                      placeholder="Quais são os pontos que mais vendem seu produto?"
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="min-h-[160px] rounded-2xl bg-background/50 border-white/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <Label className="font-bold text-sm ml-2">Aparência do Produto (Referência Visual)</Label>
                {!productImage ? (
                  <label className="flex flex-col items-center justify-center w-full min-h-[360px] border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer hover:bg-white/5 hover:border-accent/40 transition-all group">
                    <div className="bg-white/5 p-5 rounded-full mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-accent" />
                    </div>
                    <p className="text-sm font-bold text-white uppercase tracking-widest">Subir Foto Real</p>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">(Opcional: A IA usará como base para a arte)</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-2 border-accent/20 group">
                    <img src={productImage} alt="Preview" className="w-full h-full object-contain p-8 bg-background/50" />
                    <button 
                      onClick={() => setProductImage(null)} 
                      className="absolute top-6 right-6 p-3 bg-destructive rounded-2xl text-white shadow-xl hover:scale-110 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-6 inset-x-6">
                       <Badge className="bg-accent/90 text-[10px] py-1">PRODUTO IDENTIFICADO</Badge>
                    </div>
                  </div>
                )}
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full bg-accent h-14 text-lg font-bold italic rounded-2xl shadow-xl shadow-accent/20"
                >
                  CONFIGURAR ESTILO <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="space-y-10">
                <div className="space-y-6">
                  <Label className="text-[11px] font-bold text-accent uppercase tracking-[0.2em] ml-2">Direção de Estilo</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {TEMAS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`text-left p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${theme === t.id ? 'border-accent bg-accent/10 shadow-lg shadow-accent/5' : 'border-white/5 hover:border-white/20'}`}
                      >
                        <div className="font-bold text-sm text-white mb-1 uppercase tracking-tight">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground italic">{t.desc}</div>
                        {theme === t.id && <div className="absolute top-2 right-2"><Sparkles className="w-3 h-3 text-accent" /></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[11px] font-bold text-accent uppercase tracking-[0.2em] ml-2">Evento Comemorativo (Sazonal)</Label>
                  <Select value={eventDate} onValueChange={setEventDate}>
                    <SelectTrigger className="h-14 rounded-2xl bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EVENTOS.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="rounded-xl py-3">{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-sm ml-2">Formato do Criativo</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="h-14 rounded-2xl bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>{PLATAFORMAS.map((p) => <SelectItem key={p.id} value={p.id} className="rounded-xl py-3">{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-sm ml-2">Chamada / Oferta Especial</Label>
                    <Input placeholder="Ex: FRETE GRÁTIS hoje em www.loja.com" value={promoText} onChange={(e) => setPromoText(e.target.value)} className="h-14 rounded-2xl bg-background/50 border-white/10" />
                  </div>
                </div>

                <div className="flex gap-4 pt-10">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest"><ChevronLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                  <Button onClick={handleCreateCampaign} disabled={loading} className="flex-[2] bg-accent h-14 font-bold italic rounded-2xl shadow-xl shadow-accent/20">
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                    CRIAR CAMPANHA DE ELITE
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-in zoom-in-95 duration-700">
              <div className="text-center space-y-4">
                <Badge className="bg-accent shadow-lg shadow-accent/20 text-[11px] py-1.5 px-6 font-bold uppercase tracking-[0.3em]">Arte Finalizada</Badge>
                <h2 className="text-4xl font-headline font-bold text-white italic tracking-tight">Impacto Visual Gerado</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-black/40 rounded-[3rem] border border-white/5 overflow-hidden relative shadow-inner">
                  <div className="aspect-[4/5] flex items-center justify-center p-4">
                    {generatingImage ? (
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <Loader2 className="w-16 h-16 text-accent animate-spin mx-auto opacity-50" />
                          <Sparkles className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-accent uppercase tracking-widest animate-pulse">Compondo Cenário de Luxo...</p>
                          <p className="text-[10px] text-muted-foreground mt-2 italic">A IA está processando as texturas e iluminação 8k.</p>
                        </div>
                      </div>
                    ) : finalImageUrl ? (
                      <img src={finalImageUrl} alt="Resultado" className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl" />
                    ) : (
                      <ImageIcon className="w-24 h-24 text-white/5" />
                    )}
                  </div>
                  {finalImageUrl && (
                    <div className="p-6 bg-black/60 backdrop-blur-2xl absolute bottom-0 inset-x-0 flex justify-between items-center border-t border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Produto Criado</span>
                        <span className="text-sm font-bold text-white italic">{productName}</span>
                      </div>
                      <Button onClick={() => window.open(finalImageUrl)} className="bg-accent rounded-xl font-bold shadow-lg shadow-accent/40"><Download className="w-4 h-4 mr-2" /> BAIXAR ARTE</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="bg-accent/5 p-10 rounded-[2.5rem] border border-accent/20 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="w-32 h-32 text-accent" /></div>
                    
                    <div className="relative">
                      <Label className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Headline Viral</Label>
                      <h4 className="text-2xl font-bold text-white mt-2 leading-tight italic">{scriptResult?.campaignBriefing.copywriting.headline}</h4>
                    </div>
                    
                    <div className="relative">
                      <Label className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Copy Convencional</Label>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-3 font-body text-lg italic">{scriptResult?.campaignBriefing.copywriting.description}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <Label className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Call to Action</Label>
                      <div className="bg-accent/20 text-accent font-bold py-3 px-6 rounded-2xl mt-3 text-center border border-accent/30 tracking-widest uppercase text-xs italic">
                        {scriptResult?.campaignBriefing.copywriting.callToAction}
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-background/40 border-white/5 rounded-[2rem] p-6">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <div className="ml-3">
                      <AlertTitle className="text-xs font-bold uppercase tracking-widest text-white">Diretriz Criativa Aplicada</AlertTitle>
                      <AlertDescription className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] mt-1">
                        Fusão estética: {theme} + Temática: {eventDate}. Resolução 8k Estúdio.
                      </AlertDescription>
                    </div>
                  </Alert>

                  <Button 
                    variant="outline" 
                    onClick={() => { setStep(1); setFinalImageUrl(null); }} 
                    className="w-full h-14 rounded-2xl border-white/10 hover:bg-white/5 text-[11px] font-bold uppercase tracking-[0.3em]"
                  >
                    INICIAR NOVA CRIAÇÃO
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
