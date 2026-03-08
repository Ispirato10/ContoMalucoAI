
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
import { Upload, Wand2, Image as ImageIcon, CheckCircle2, Download, RefreshCw, X, Link as LinkIcon, Globe, Sparkles } from 'lucide-react';
import { generateAdImagePrompt } from '@/ai/flows/generate-ad-image-prompt';
import { createProfessionalAdImage } from '@/ai/flows/create-professional-ad-image';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const THEMES = [
  { id: 'Luxury', name: 'Luxury & Premium', description: 'Gold accents, elegant lighting' },
  { id: 'Minimalist', name: 'Modern Minimalist', description: 'Clean lines, soft shadows' },
  { id: 'Seasonal', name: 'Seasonal / Holiday', description: 'Festive and vibrant' },
  { id: 'Beauty', name: 'Cosmetics & Beauty', description: 'Soft focus, premium textures' },
  { id: 'Tech', name: 'Tech & Innovation', description: 'Sleek, futuristic, high-contrast' },
];

const PLATFORMS = [
  { id: 'feed', name: 'Instagram Feed (1:1)', icon: '📱' },
  { id: 'story', name: 'Instagram Story (9:16)', icon: '🤳' },
  { id: 'banner', name: 'Website Banner (16:9)', icon: '🖥️' },
];

export function AdGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [benefits, setBenefits] = useState('');
  const [theme, setTheme] = useState('Luxury');
  const [platform, setPlatform] = useState<'feed' | 'story' | 'banner'>('feed');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => setProductImage(null);

  const generateAd = async () => {
    if (!productName || (!benefits && !productUrl)) {
      toast({
        title: "Informação Faltando",
        description: "Por favor, preencha o nome do produto e insira um link ou descreva os benefícios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const promptResult = await generateAdImagePrompt({
        productName,
        productBenefits: benefits || undefined,
        productUrl: productUrl || undefined,
        theme,
        platform: platform === 'banner' ? 'facebook-ads' : platform,
        productImage: productImage || undefined,
      });

      const adResult = await createProfessionalAdImage({
        textPrompt: promptResult.prompt,
        productImage: productImage || undefined,
        platform: platform,
      });

      setGeneratedImage(adResult.imageUrl);
      setStep(3);
    } catch (error) {
      console.error(error);
      toast({
        title: "Falha na Geração",
        description: "Ocorreu um erro ao gerar sua imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ad-vision-${platform}-${productName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const reset = () => {
    setGeneratedImage(null);
    setStep(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="bg-card border-border shadow-2xl overflow-hidden">
          <div className="bg-primary/20 border-b border-border p-4 flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg text-white">Criar Campanha</h3>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    step >= s ? 'bg-accent' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <CardContent className="p-6 space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                {/* DESTAQUE PARA O LINK DO PRODUTO */}
                <div className="bg-accent/10 p-5 rounded-xl border-2 border-accent/30 space-y-4 ring-4 ring-accent/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-accent p-1.5 rounded-md">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xs text-accent uppercase tracking-widest">Base de Conhecimento Inteligente</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-white flex items-center gap-2">
                      Link do Produto (Recomendado)
                    </Label>
                    <Input
                      placeholder="Cole aqui o link da sua loja ou site do produto"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="bg-background border-accent/50 focus:ring-accent h-12 text-base"
                    />
                    <p className="text-[11px] text-accent/80 leading-tight font-medium">
                      Nossa IA visitará este site para extrair automaticamente benefícios, recursos e o tom de voz da sua marca.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nome do Produto
                  </Label>
                  <Input
                    placeholder="Ex: Perfume Midnight Sapphire"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-background/50 border-border focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Benefícios Manuais (Opcional)
                  </Label>
                  <Textarea
                    placeholder="Ou descreva aqui o que torna seu produto especial..."
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="bg-background/50 border-border min-h-[80px] focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Foto Real do Produto (Opcional)
                  </Label>
                  {!productImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">PNG, JPG, ou JPEG</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-border aspect-video bg-background/50">
                      <img src={productImage} alt="Preview" className="w-full h-full object-contain p-2" />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1 bg-destructive/80 hover:bg-destructive rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
                <Button onClick={() => setStep(2)} className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 shadow-lg shadow-accent/20">
                  Próximo: Definir Estética
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tema Criativo
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          theme === t.id
                            ? 'bg-accent/10 border-accent shadow-sm'
                            : 'bg-background/50 border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="font-bold text-sm text-white">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Formato e Plataforma
                  </Label>
                  <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                    <SelectTrigger className="bg-background/50 border-border h-12">
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.icon} {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-border">
                    Voltar
                  </Button>
                  <Button
                    onClick={generateAd}
                    disabled={loading}
                    className="flex-[2] bg-accent hover:bg-accent/90 text-white font-bold h-12 shadow-lg shadow-accent/20"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Analisando e Criando...' : 'Gerar Anúncio'}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="bg-green-500/10 p-3 rounded-full">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-white">Pronto!</h3>
                  <p className="text-muted-foreground text-sm">
                    Sua campanha foi gerada com base nos dados do seu produto.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={downloadImage} className="w-full bg-accent hover:bg-accent/90 text-white h-12">
                    <Download className="w-5 h-5 mr-2" />
                    Baixar Visual
                  </Button>
                  <Button variant="outline" onClick={reset} className="w-full border-border">
                    Criar Outro
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-7 h-full">
        <div className="sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-accent" />
            <h3 className="font-headline text-xl text-white">Visualização em Tempo Real</h3>
          </div>
          <div className="relative rounded-xl border border-border bg-card/50 overflow-hidden shadow-2xl group min-h-[500px] flex items-center justify-center">
            {!loading && !generatedImage && (
              <div className="text-center p-12 space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Seu anúncio profissional aparecerá aqui. Preencha os detalhes ao lado para começar.
                </p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 p-12 text-center">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="font-headline text-2xl font-bold text-white mb-2">Criando sua Obra-Prima</h4>
                  <p className="text-muted-foreground animate-pulse">
                    {productUrl ? 'Acessando site e extraindo benefícios reais...' : 'Analisando estética e renderizando iluminação profissional...'}
                  </p>
                </div>
              </div>
            )}

            {generatedImage && (
              <div className="w-full h-full animate-in zoom-in-95 duration-700">
                <Image
                  src={generatedImage}
                  alt="Generated Ad"
                  width={1080}
                  height={platform === 'story' ? 1920 : platform === 'banner' ? 628 : 1080}
                  className="w-full h-full object-contain"
                  data-ai-hint="professional advertisement"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
