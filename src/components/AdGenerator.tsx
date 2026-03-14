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
  Calendar, 
  Layout, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { generateAdScript, type GenerateAdScriptOutput } from '@/ai/flows/generate-ad-script';
import { extractBenefits } from '@/ai/flows/extract-benefits';
import { createProfessionalAdImage } from '@/ai/flows/create-professional-ad-image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TEMAS = [
  { id: 'Luxury-Premium', name: 'Luxo Comercial', desc: 'Estética Apple/Rolex, estúdio' },
  { id: 'Cinematic-Viral', name: 'Cinematográfico Viral', desc: 'Dramático, cores ricas' },
  { id: 'Tech-Futuristic', name: 'Tech / Futurista', desc: 'Neon, luz volumétrica' },
  { id: 'Organic-Nature', name: 'Orgânico / Premium', desc: 'Luz solar, elementos naturais' },
];

const EVENTOS = [
  { id: 'Standard', name: 'Sem Evento Específico' },
  { id: 'Christmas', name: 'Natal (Ouro e Neve de Luxo)' },
  { id: 'Black Friday', name: 'Black Friday (Neon e Energia)' },
  { id: 'New Year', name: 'Ano Novo (Brilho e Champagne)' },
  { id: 'Valentines', name: 'Dia dos Namorados (Romântico Elegante)' },
  { id: 'Summer', name: 'Verão (Tropical e Vibrante)' },
];

const PLATAFORMAS = [
  { id: 'Instagram Reels/Story', name: 'Stories (9:16)' },
  { id: 'Instagram/FB Feed', name: 'Feed (1:1)' },
  { id: 'Google Banner', name: 'Banner (16:9)' },
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
  const [targetWebsite, setTargetWebsite] = useState('');
  
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
      if (result.productName) setProductName(result.productName);
      toast({ title: "Análise concluída", description: "Diferenciais extraídos do site." });
    } catch (e) {
      toast({ title: "Erro na análise", description: "Tente descrever manualmente.", variant: "destructive" });
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
        theme,
        platform,
        promoText: promoText || undefined,
        targetWebsite: targetWebsite || undefined,
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
      toast({ title: "Erro técnico", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Card className="bg-card border-border shadow-2xl overflow-hidden border-t-4 border-t-accent rounded-3xl">
        {/* Header Header */}
        <div className="bg-primary/10 p-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-xl">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-headline font-bold text-xl text-white tracking-widest uppercase italic">DIRETOR DE ARTE IA</h2>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? 'bg-accent' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        <CardContent className="p-8">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
                  <Label className="text-xs font-bold text-accent uppercase tracking-widest">Interpretar Link</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://loja.com/produto"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="bg-background border-accent/30"
                    />
                    <Button variant="secondary" onClick={handleExtract} disabled={extracting || !productUrl}>
                      {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Nome do Produto</Label>
                    <Input placeholder="Ex: Perfume Noir" value={productName} onChange={(e) => setProductName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Diferenciais Premium</Label>
                    <Textarea
                      placeholder="Descreva o luxo do seu produto..."
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="font-bold">Foto do Produto (Opcional)</Label>
                {!productImage ? (
                  <label className="flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed border-border/40 rounded-3xl cursor-pointer hover:bg-accent/5 transition-all">
                    <Upload className="w-8 h-8 text-muted-foreground mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">Arraste a foto real aqui</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div className="relative aspect-square rounded-3xl overflow-hidden border border-border">
                    <img src={productImage} alt="Produto" className="w-full h-full object-contain p-4" />
                    <button onClick={() => setProductImage(null)} className="absolute top-4 right-4 p-2 bg-destructive rounded-full text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <Button onClick={() => setStep(2)} className="w-full bg-accent h-12 text-lg font-bold italic">PRÓXIMO PASSO</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="font-bold uppercase italic text-xs tracking-widest text-accent">Estilo da Direção</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMAS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${theme === t.id ? 'border-accent bg-accent/10' : 'border-border'}`}
                      >
                        <div className="font-bold text-xs text-white">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="font-bold uppercase italic text-xs tracking-widest text-accent">Evento Especial (Sazonal)</Label>
                  <Select value={eventDate} onValueChange={setEventDate}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
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
                  <Label className="font-bold">Formato da Peça</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>{PLATAFORMAS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Oferta / Site (Aparece no Anúncio)</Label>
                  <Input placeholder="Ex: 50% OFF em loja.com" value={promoText} onChange={(e) => setPromoText(e.target.value)} className="h-12" />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">VOLTAR</Button>
                  <Button onClick={handleCreateCampaign} disabled={loading} className="flex-[2] bg-accent h-12 font-bold italic">
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                    CRIAR CAMPANHA AGORA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in zoom-in-95 duration-500">
              <div className="text-center">
                <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 font-bold uppercase tracking-widest">Campanha Concluída</Badge>
                <h2 className="text-3xl font-headline font-bold text-white italic">RESULTADO DE ALTO IMPACTO</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-muted/20 rounded-3xl border border-border overflow-hidden relative">
                  <div className="aspect-[4/5] bg-background/50 flex items-center justify-center">
                    {generatingImage ? (
                      <div className="text-center space-y-4">
                        <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
                        <p className="text-xs font-bold text-accent uppercase animate-pulse tracking-widest">Processando Arte...</p>
                      </div>
                    ) : finalImageUrl ? (
                      <img src={finalImageUrl} alt="Resultado Final" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-20 h-20 text-muted-foreground/20" />
                    )}
                  </div>
                  {finalImageUrl && (
                    <div className="p-4 bg-background/80 backdrop-blur-md absolute bottom-0 inset-x-0 flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase italic">{productName}</span>
                      <Button size="sm" onClick={() => window.open(finalImageUrl)} className="bg-accent font-bold"><Download className="w-4 h-4 mr-2" /> BAIXAR</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-accent/5 p-8 rounded-3xl border border-accent/20 space-y-6">
                    <div>
                      <Label className="text-[10px] font-bold text-accent uppercase tracking-widest">Título do Anúncio</Label>
                      <h4 className="text-xl font-bold text-white mt-1">{scriptResult?.campaignBriefing.copywriting.headline}</h4>
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold text-accent uppercase tracking-widest">Legenda Persuasiva</Label>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{scriptResult?.campaignBriefing.copywriting.description}</p>
                    </div>
                  </div>

                  <Alert className="bg-background/40 border-border rounded-2xl">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <AlertTitle className="text-xs font-bold uppercase">Diretriz Criativa</AlertTitle>
                    <AlertDescription className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      O cenário foi ajustado para o evento {eventDate} com estética {theme}.
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" onClick={() => { setStep(1); setFinalImageUrl(null); }} className="w-full h-12 text-xs font-bold uppercase tracking-widest">GERAR NOVO ANÚNCIO</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
