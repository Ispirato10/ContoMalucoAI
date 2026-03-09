
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
  FileJson, 
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
  Copy
} from 'lucide-react';
import { generateAdScript, type GenerateAdScriptOutput } from '@/ai/flows/generate-ad-script';
import { useToast } from '@/hooks/use-toast';

const TEMAS = [
  { id: 'Luxury', name: 'Luxo & Premium', desc: 'Dourado, elegância e exclusividade' },
  { id: 'Minimalist', name: 'Minimalista Moderno', desc: 'Cores sólidas e foco absoluto' },
  { id: 'BlackFriday', name: 'Black Friday', desc: 'Neon, alto contraste e urgência' },
  { id: 'Christmas', name: 'Natal / Festividades', desc: 'Aconchegante, luzes e calor' },
  { id: 'Summer', name: 'Verão / Outdoor', desc: 'Luminoso, vibrante e fresco' },
  { id: 'Tech', name: 'Tech & Inovação', desc: 'Futurista, ciano e néon' },
];

const PLATAFORMAS = [
  { id: 'Instagram Feed', name: 'Instagram Feed (1:1)' },
  { id: 'Instagram Stories', name: 'Instagram Stories (9:16)' },
  { id: 'Facebook Ads', name: 'Facebook Ads (1.91:1)' },
  { id: 'TikTok Ads', name: 'TikTok Ads (9:16)' },
  { id: 'WhatsApp Campaign', name: 'WhatsApp (Status/Mensagem)' },
  { id: 'Google Display', name: 'Google Display / Banner' },
];

export function AdGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [theme, setTheme] = useState('Luxury');
  const [platform, setPlatform] = useState('Instagram Feed');
  const [couponCode, setCouponCode] = useState('');
  const [promoText, setPromoText] = useState('');
  const [targetWebsite, setTargetWebsite] = useState('');
  const [eventDate, setEventDate] = useState('');
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

  const handleGenerateScript = async () => {
    if (!productName) {
      toast({ title: "Ops!", description: "O nome do produto é obrigatório.", variant: "destructive" });
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
        eventDate: eventDate || undefined,
        productBenefits: benefits || undefined,
      });
      setScriptResult(result);
      setStep(3);
      toast({ title: "Script Gerado!", description: "O briefing técnico está pronto para download." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
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
    a.download = `script-anuncio-${productName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPrompt = () => {
    if (!scriptResult) return;
    navigator.clipboard.writeText(scriptResult.campaignBriefing.dallePrompt);
    toast({ title: "Copiado!", description: "Prompt de imagem copiado para a área de transferência." });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-12">
        <Card className="bg-card border-border shadow-2xl overflow-hidden">
          <div className="bg-primary/20 border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent p-2 rounded-xl">
                <FileJson className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-headline font-bold text-2xl text-white">Gerador de Script Publicitário</h2>
                <p className="text-sm text-muted-foreground">Crie briefings perfeitos para o ChatGPT e DALL-E</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  step === s ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  Passo {s}
                </div>
              ))}
            </div>
          </div>

          <CardContent className="p-8">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-6">
                  <div className="bg-accent/10 p-5 rounded-xl border-2 border-accent/30 space-y-4 ring-4 ring-accent/5">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-accent" />
                      <span className="font-bold text-xs text-accent uppercase tracking-widest">Análise de Site</span>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Link do Produto (URL)</Label>
                      <Input
                        placeholder="https://sualoja.com/produto"
                        value={productUrl}
                        onChange={(e) => setProductUrl(e.target.value)}
                        className="bg-background border-accent/50 h-12"
                      />
                      <p className="text-[11px] text-accent/80">O Gemini analisará este link para entender seu produto.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nome do Produto</Label>
                    <Input
                      placeholder="Ex: Tênis Ultra Confort 2.0"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="bg-background/50 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Diferenciais/Benefícios Manuais</Label>
                    <Textarea
                      placeholder="Caso não tenha link, descreva o que torna o produto único..."
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="bg-background/50 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <Label>Foto do Produto (Referência)</Label>
                  {!productImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-full min-h-[250px] border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-all group">
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <Upload className="w-12 h-12 mb-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        <p className="text-sm font-medium">Arraste a foto do produto aqui</p>
                        <p className="text-xs text-muted-foreground mt-2">Usaremos para exibir na prévia do script</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-background/50 group">
                      <img src={productImage} alt="Preview" className="w-full h-full object-contain p-4" />
                      <button
                        onClick={() => setProductImage(null)}
                        className="absolute top-4 right-4 p-2 bg-destructive/90 hover:bg-destructive rounded-full text-white shadow-xl transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <Button onClick={() => setStep(2)} className="w-full bg-accent hover:bg-accent/90 h-14 text-lg font-bold">
                    Próximo: Detalhes da Campanha
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Tema Visual</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TEMAS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            theme === t.id ? 'bg-accent/10 border-accent' : 'bg-background/50 border-border'
                          }`}
                        >
                          <div className="font-bold text-sm text-white">{t.name}</div>
                          <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Layout className="w-4 h-4" /> Canal de Veiculação</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="h-12 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATAFORMAS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Ticket className="w-4 h-4" /> Cupom de Desconto</Label>
                      <Input placeholder="Ex: PROMO10" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Data/Evento</Label>
                      <Input placeholder="Ex: Dia das Mães" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-background/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Megaphone className="w-4 h-4" /> Oferta Principal</Label>
                    <Input placeholder="Ex: Compre 1 Leve 2" value={promoText} onChange={(e) => setPromoText(e.target.value)} className="bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Website no Anúncio</Label>
                    <Input placeholder="www.seusite.com.br" value={targetWebsite} onChange={(e) => setTargetWebsite(e.target.value)} className="bg-background/50" />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14">Voltar</Button>
                    <Button onClick={handleGenerateScript} disabled={loading} className="flex-[2] bg-accent hover:bg-accent/90 h-14 font-bold">
                      {loading ? <RefreshCw className="w-6 h-6 animate-spin mr-2" /> : <Wand2 className="w-6 h-6 mr-2" />}
                      {loading ? 'Analisando...' : 'Gerar Script Publicitário'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && scriptResult && (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="bg-green-500/10 p-4 rounded-full">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-headline font-bold text-white">Seu Script de Anúncio Está Pronto!</h2>
                  <p className="text-muted-foreground">Baixe o JSON e envie para o ChatGPT junto com a foto do produto.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-background/80 rounded-xl border border-border overflow-hidden">
                      <div className="bg-muted p-3 flex items-center justify-between border-b border-border">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prompt de Imagem (DALL-E 3)</span>
                        <Button variant="ghost" size="sm" onClick={copyPrompt} className="h-8 gap-2">
                          <Copy className="w-3 h-3" /> Copiar
                        </Button>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-white leading-relaxed italic">
                          "{scriptResult.campaignBriefing.dallePrompt}"
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-white flex items-center gap-2 italic">Dicas de Copywriting:</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                          <div className="text-[10px] text-accent uppercase font-bold">Headline</div>
                          <div className="text-sm text-white">{scriptResult.campaignBriefing.copywriting.headline}</div>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                          <div className="text-[10px] text-accent uppercase font-bold">CTA</div>
                          <div className="text-sm text-white font-bold">{scriptResult.campaignBriefing.copywriting.callToAction}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
                      <h4 className="font-bold text-white flex items-center gap-2">Detalhes Técnicos Sugeridos:</h4>
                      <div className="flex flex-wrap gap-2">
                        {scriptResult.campaignBriefing.technicalDetails.suggestedColors.map((c, i) => (
                          <div key={i} className="px-3 py-1 bg-background rounded-full border border-border text-[10px] font-bold text-muted-foreground">
                            {c}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong className="text-white">Iluminação:</strong> {scriptResult.campaignBriefing.technicalDetails.lightingStyle}<br/>
                        <strong className="text-white">Formato:</strong> {scriptResult.campaignBriefing.technicalDetails.aspectRatio}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button onClick={downloadJson} className="w-full bg-accent hover:bg-accent/90 h-14 text-lg font-bold">
                        <Download className="w-6 h-6 mr-2" /> Baixar Script (JSON)
                      </Button>
                      <Button variant="outline" onClick={() => { setStep(1); setScriptResult(null); }} className="w-full h-12">
                        Criar Novo Script
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
