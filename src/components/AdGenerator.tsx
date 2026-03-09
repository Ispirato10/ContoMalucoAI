
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
  Copy,
  Info,
  Lightbulb
} from 'lucide-react';
import { generateAdScript, type GenerateAdScriptOutput } from '@/ai/flows/generate-ad-script';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TEMAS = [
  { id: 'Luxury', name: 'Luxo & Premium', desc: 'Dourado, mármore e iluminação dramática' },
  { id: 'Minimalist', name: 'Minimalista Moderno', desc: 'Clean, cores pastéis e foco no produto' },
  { id: 'Cyberpunk', name: 'Cyberpunk / Tech', desc: 'Neon, ciano e atmosfera futurista' },
  { id: 'Nature', name: 'Natural / Eco', desc: 'Folhagens, madeira e luz solar suave' },
  { id: 'High-Contrast', name: 'Pop Art / Contraste', desc: 'Cores vibrantes e sombras duras' },
  { id: 'Ethereal', name: 'Etéreo / Sonhador', desc: 'Nuvens, névoa e cores suaves' },
];

const EVENTOS = [
  { id: 'Nenhum', name: 'Sem Evento Específico' },
  { id: 'Natal', name: 'Natal' },
  { id: 'Ano Novo', name: 'Ano Novo' },
  { id: 'Black Friday', name: 'Black Friday' },
  { id: 'Dia dos Namorados', name: 'Dia dos Namorados' },
  { id: 'Dia das Mães', name: 'Dia das Mães' },
  { id: 'Dia dos Pais', name: 'Dia dos Pais' },
  { id: 'Dia das Crianças', name: 'Dia das Crianças' },
  { id: 'Carnaval', name: 'Carnaval' },
  { id: 'Páscoa', name: 'Páscoa' },
  { id: 'Inverno', name: 'Temporada de Inverno' },
  { id: 'Verão', name: 'Lançamento de Verão' },
];

const PLATAFORMAS = [
  { id: 'Instagram Story', name: 'Instagram Stories (9:16)' },
  { id: 'Instagram Feed', name: 'Instagram/Facebook Feed (1:1)' },
  { id: 'TikTok Ads', name: 'TikTok Ads (9:16)' },
  { id: 'Google Display', name: 'Banner Horizontal (16:9)' },
  { id: 'WhatsApp Campaign', name: 'WhatsApp (Portrait)' },
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
  const [eventDate, setEventDate] = useState('Nenhum');
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
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do produto.", variant: "destructive" });
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
        eventDate: eventDate !== 'Nenhum' ? eventDate : undefined,
        productBenefits: benefits || undefined,
      });
      setScriptResult(result);
      setStep(3);
      toast({ title: "Estratégia Gerada!", description: "Seu briefing criativo está pronto." });
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
    a.download = `briefing-${productName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPrompt = () => {
    if (!scriptResult) return;
    navigator.clipboard.writeText(scriptResult.campaignBriefing.dallePrompt);
    toast({ title: "Copiado!", description: "O prompt maestro foi copiado para a área de transferência." });
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card className="bg-card border-border shadow-2xl overflow-hidden border-t-4 border-t-accent">
        <div className="bg-primary/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2.5 rounded-xl shadow-lg shadow-accent/20">
              <FileJson className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-2xl text-white tracking-tight">Estrategista AdVision</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold italic">Criatividade Analítica com IA</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full transition-all ${
                step >= s ? 'bg-accent' : 'bg-muted'
              }`} />
            ))}
          </div>
        </div>

        <CardContent className="p-8">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-accent/5 border border-accent/20 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-tighter">Análise de Site (Opcional)</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">URL do Produto</Label>
                    <Input
                      placeholder="https://sua-loja.com/produto-exemplo"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="bg-background border-accent/30 h-12"
                    />
                    <p className="text-[11px] text-muted-foreground leading-tight italic">O Gemini analisará os benefícios reais para torná-los visuais no anúncio.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Nome do Produto</Label>
                    <Input
                      placeholder="Ex: Relógio Luxo Gold Edition"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="h-12 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> Benefícios para Destacar</Label>
                    <Textarea
                      placeholder="Ex: Durabilidade extrema, À prova d'água, Design Italiano..."
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="min-h-[140px] bg-background/50 resize-none font-body"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="font-bold">Foto Original do Produto</Label>
                {!productImage ? (
                  <label className="flex flex-col items-center justify-center w-full min-h-[320px] border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-accent/5 transition-all group">
                    <Upload className="w-12 h-12 mb-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    <p className="text-sm font-bold text-white">Carregue sua foto de referência</p>
                    <p className="text-xs text-muted-foreground mt-2 px-6 text-center">O ChatGPT usará esta imagem para manter a integridade do seu produto.</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-border aspect-square bg-background/50 group">
                    <img src={productImage} alt="Produto" className="w-full h-full object-contain p-6" />
                    <button
                      onClick={() => setProductImage(null)}
                      className="absolute top-4 right-4 p-2 bg-destructive/90 hover:bg-destructive rounded-full text-white shadow-xl transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full bg-accent hover:bg-accent/90 h-14 text-lg font-bold shadow-lg shadow-accent/20"
                >
                  Próximo: Estilo e Campanha
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 font-bold text-white">
                    <Sparkles className="w-4 h-4 text-accent" /> Estilo de Design Dominante
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TEMAS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
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
                    <Calendar className="w-4 h-4 text-accent" /> Data ou Evento Especial
                  </Label>
                  <Select value={eventDate} onValueChange={setEventDate}>
                    <SelectTrigger className="h-12 bg-background/50 border-border">
                      <SelectValue placeholder="Selecione um evento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENTOS.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground italic">A IA mesclará o estilo visual escolhido com este evento de forma criativa.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold"><Layout className="w-4 h-4 text-accent" /> Formato da Campanha</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="h-12 bg-background/50 border-border">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold"><Ticket className="w-4 h-4" /> Cupom de Desconto</Label>
                    <Input placeholder="Ex: OFF30" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold"><Globe className="w-4 h-4" /> Site Exibido</Label>
                    <Input placeholder="www.seusite.com" value={targetWebsite} onChange={(e) => setTargetWebsite(e.target.value)} className="bg-background/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold"><Megaphone className="w-4 h-4" /> Chamada Principal (Oferta)</Label>
                  <Input placeholder="Ex: Compre 1 Leve 2 nesta Black Friday" value={promoText} onChange={(e) => setPromoText(e.target.value)} className="bg-background/50 h-12" />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 border-border font-bold">Voltar</Button>
                  <Button 
                    onClick={handleGenerateScript} 
                    disabled={loading} 
                    className="flex-[2] bg-accent hover:bg-accent/90 h-14 font-bold shadow-lg shadow-accent/20"
                  >
                    {loading ? <RefreshCw className="w-6 h-6 animate-spin mr-2" /> : <Wand2 className="w-6 h-6 mr-2" />}
                    {loading ? 'Fundindo Temas...' : 'Gerar Briefing Maestro'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && scriptResult && (
            <div className="space-y-8 animate-in zoom-in-95 duration-700">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-green-500/10 p-5 rounded-full ring-8 ring-green-500/5">
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                </div>
                <h2 className="text-4xl font-headline font-bold text-white italic underline decoration-accent/30 underline-offset-8">Estratégia Finalizada</h2>
                <p className="text-muted-foreground max-w-xl font-body">
                  Sua campanha fundiu o estilo <span className="text-accent font-bold">"{theme}"</span> com o evento <span className="text-accent font-bold">"{eventDate}"</span> com sucesso.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-background/80 rounded-2xl border border-border overflow-hidden shadow-xl">
                    <div className="bg-muted p-4 flex items-center justify-between border-b border-border">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prompt Maestro (DALL-E 3)</span>
                      </div>
                      <Button variant="secondary" size="sm" onClick={copyPrompt} className="h-8 gap-2 font-bold text-xs uppercase italic">
                        <Copy className="w-3 h-3" /> Copiar Prompt
                      </Button>
                    </div>
                    <div className="p-6">
                      <p className="text-base text-white leading-relaxed italic font-body">
                        "{scriptResult.campaignBriefing.dallePrompt}"
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-blue-500/5 border-blue-500/20">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertTitle className="text-blue-400 font-bold uppercase text-xs">Instruções de Sucesso</AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
                      1. Vá ao ChatGPT e carregue sua foto original do produto.<br/>
                      2. Cole o Prompt Maestro acima.<br/>
                      3. O DALL-E criará o anúncio unindo seu produto ao cenário temático e benefícios.<br/>
                      4. Use as descrições abaixo para legendar suas redes sociais.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-muted/30 rounded-2xl border border-border p-6 space-y-5">
                    <h4 className="font-bold text-white text-lg flex items-center gap-2 italic">Copywriting Gerado:</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-background/50 rounded-xl border border-border/50">
                        <div className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1">Título Magnético</div>
                        <div className="text-base text-white font-bold">{scriptResult.campaignBriefing.copywriting.headline}</div>
                      </div>
                      <div className="p-4 bg-background/50 rounded-xl border border-border/50">
                        <div className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1">Conteúdo do Anúncio</div>
                        <div className="text-sm text-muted-foreground italic leading-relaxed">{scriptResult.campaignBriefing.copywriting.description}</div>
                      </div>
                      <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                        <div className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1">Chamada para Ação</div>
                        <div className="text-sm text-white font-bold uppercase">{scriptResult.campaignBriefing.copywriting.callToAction}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button onClick={downloadJson} className="w-full bg-accent hover:bg-accent/90 h-14 text-lg font-bold shadow-xl italic uppercase">
                      <Download className="w-6 h-6 mr-2" /> Baixar Briefing (.JSON)
                    </Button>
                    <Button variant="outline" onClick={() => { setStep(1); setScriptResult(null); }} className="w-full h-12 font-bold uppercase text-xs">
                      Criar Outra Estratégia
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
