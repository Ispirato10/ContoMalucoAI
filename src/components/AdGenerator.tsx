
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
import { Upload, Wand2, Image as ImageIcon, CheckCircle2, Download, RefreshCw, X, Link as LinkIcon } from 'lucide-react';
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
        title: "Missing Information",
        description: "Please fill in the product name and either benefits or a product URL.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Generate optimized prompt (will fetch URL content if provided)
      const promptResult = await generateAdImagePrompt({
        productName,
        productBenefits: benefits || undefined,
        productUrl: productUrl || undefined,
        theme,
        platform: platform === 'banner' ? 'facebook-ads' : platform,
        productImage: productImage || undefined,
      });

      // 2. Create the ad image
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
        title: "Generation Failed",
        description: "An error occurred while generating your ad image. Please try again.",
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
            <h3 className="font-headline font-bold text-lg text-white">Campaign Details</h3>
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
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Product Name
                  </Label>
                  <Input
                    placeholder="e.g. Midnight Sapphire Perfume"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-background/50 border-border focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Product Link (Recommended)
                  </Label>
                  <Input
                    placeholder="https://example.com/product"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="bg-background/50 border-border focus:ring-accent"
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    AI will visit this link to extract benefits and details.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Manual Benefits (Optional)
                  </Label>
                  <Textarea
                    placeholder="Or describe manually what makes your product special..."
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="bg-background/50 border-border min-h-[80px] focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Product Photo (Optional)
                  </Label>
                  {!productImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG</p>
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
                  Next Step
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Creative Theme
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
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Format & Platform
                  </Label>
                  <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                    <SelectTrigger className="bg-background/50 border-border h-12">
                      <SelectValue placeholder="Select platform" />
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
                    Back
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
                    {loading ? 'Analyzing & Crafting...' : 'Generate Ad'}
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
                  <h3 className="text-xl font-headline font-bold text-white">Your Ad is Ready!</h3>
                  <p className="text-muted-foreground text-sm">
                    Our AI has synthesized your product details into a professional campaign.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={downloadImage} className="w-full bg-accent hover:bg-accent/90 text-white h-12">
                    <Download className="w-5 h-5 mr-2" />
                    Download Visual
                  </Button>
                  <Button variant="outline" onClick={reset} className="w-full border-border">
                    Create Another
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
            <h3 className="font-headline text-xl text-white">Live Preview</h3>
          </div>
          <div className="relative rounded-xl border border-border bg-card/50 overflow-hidden shadow-2xl group min-h-[500px] flex items-center justify-center">
            {!loading && !generatedImage && (
              <div className="text-center p-12 space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Your professional ad campaign will appear here. Fill out the form to begin the magic.
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
                  <h4 className="font-headline text-2xl font-bold text-white mb-2">Generating Masterpiece</h4>
                  <p className="text-muted-foreground animate-pulse">
                    {productUrl ? 'Scanning website & extracting benefits...' : 'Analyzing aesthetics & rendering professional lighting...'}
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
