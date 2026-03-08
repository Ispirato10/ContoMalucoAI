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
import { Upload, Wand2, Image as ImageIcon, CheckCircle2, Download, RefreshCw, X, Globe, Sparkles } from 'lucide-react';
import { generateAdImagePrompt } from '@/ai/flows/generate-ad-image-prompt';
import { createProfessionalAdImage } from '@/ai/flows/create-professional-ad-image';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const THEMES = [
  { id: 'Luxury', name: 'Luxo & Premium', description: 'Dourado, iluminação dramática e elegância' },
  { id: 'Minimalist', name: 'Minimalista Moderno', description: 'Cores sólidas, sombras suaves e foco total' },
  { id: 'Seasonal', name: 'Sazonal / Promoção', description: 'Vibrante, temático e chamativo' },
  { id: 'Beauty', name: 'Beleza & Estética', description: 'Foco suave, tons pastel e texturas finas' },
  { id: 'Tech', name: 'Tecnologia & Inovação', description: 'Futurista, néon e alto contraste' },
];

const PLATFORMS = [
  { id: 'feed', name: 'Instagram Feed (1:1)', icon: '📱' },
  { id: 'story', name: 'Instagram Story (9:16)', icon: '🤳' },
  { id: 'banner', name: 'Banner de Site (16:9)', icon: '🖥️' },
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
      if (file.size > 150 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O limite máximo é de 150MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => setProductImage(null);

  const generateAd = async () => {
    if (!productName) {
      toast({
        title: "Nome do Produto",
        description: "Por favor, informe o nome do produto.",
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
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro na Geração",
        description: error.message || "Ocorreu um erro ao processar com a IA Gemini.",
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
    link.download = `anuncio-ai-${productName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const reset = () => {
    setGeneratedImage(null);
    setStep(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                <div className="bg-accent/10 p-5 rounded-xl border-2 border-accent/30 space-y-4 ring-4 ring-accent/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-accent p-1.5 rounded-md">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xs text-accent uppercase tracking-widest">IA Inteligente: Análise de Site</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-white flex items-center gap-2">
                      Link do Produto (URL)
                    </Label>
                    <Input
                      placeholder="Cole o link do seu produto aqui"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="bg-background border-accent/50 focus:ring-accent h-12 text-base"
                    />
                    <p className="text-[11px] text-accent/80 leading-tight font-medium">
                      O Gemini visitará o site para entender os diferenciais do produto automaticamente.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nome do Produto
                  </Label>
                  <Input
                    placeholder="Ex: Tênis Ultra Confort Pro"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-background/50 border-border focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Diferenciais e Benefícios
                  </Label>
                  <Textarea
                    placeholder="O que torna seu produto único? (A IA usará isso se não houver link)"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="bg-background/50 border-border min-h-[80px] focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Foto do Produto (PNG ou JPG)
                  </Label>
                  {!productImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground text-center px-4">Arraste ou clique para enviar (Máx 150MB)</p>
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
                  Próximo: Estética do Anúncio
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Escolha um Tema Visual
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
                    Formato da Rede Social
                  </Label>
                  <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                    <SelectTrigger className="bg-background/50 border-border h-12">
                      <SelectValue placeholder="Selecione o formato" />
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
                    {loading ? 'Processando com Gemini...' : 'Gerar Anúncio Profissional'}
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
                  <h3 className="text-xl font-headline font-bold text-white">Anúncio Criado!</h3>
                  <p className="text-muted-foreground text-sm">
                    Sua peça publicitária está pronta para ser baixada e usada.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={downloadImage} className="w-full bg-accent hover:bg-accent/90 text-white h-12">
                    <Download className="w-5 h-5 mr-2" />
                    Baixar Imagem
                  </Button>
                  <Button variant="outline" onClick={reset} className="w-full border-border">
                    Criar Novo Anúncio
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-7 h-full">
        <div className="sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-accent" />
            <h3 className="font-headline text-xl text-white">Prévia em Tempo Real</h3>
          </div>
          <div className="relative rounded-xl border border-border bg-card/50 overflow-hidden shadow-2xl group min-h-[500px] flex items-center justify-center">
            {!loading && !generatedImage && (
              <div className="text-center p-12 space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-body leading-relaxed">
                  A mágica acontece aqui. Preencha os detalhes e veja o poder do Gemini em ação criando seu anúncio.
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
                  <h4 className="font-headline text-2xl font-bold text-white mb-2">IA Gemini Criando seu Anúncio</h4>
                  <p className="text-muted-foreground animate-pulse">
                    {productUrl ? 'Analisando o site do produto para extrair diferenciais...' : 'Renderizando iluminação cinematográfica e texturas...'}
                  </p>
                </div>
              </div>
            )}

            {generatedImage && (
              <div className="w-full h-full animate-in zoom-in-95 duration-700">
                <Image
                  src={generatedImage}
                  alt="Anúncio Finalizado"
                  width={1080}
                  height={platform === 'story' ? 1920 : platform === 'banner' ? 628 : 1080}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
