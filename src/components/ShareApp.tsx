'use client';

import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ShareApp() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareData = {
    title: 'Conto Maluco AI',
    text: 'Acabei de criar um gibi bizarro com IA! Vem ver e criar o seu também: ',
    url: 'https://conto-maluco-ai.vercel.app',
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        toast({
          title: "Link Copiado!",
          description: "O link do Conto Maluco foi copiado para sua área de transferência.",
        });
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o link.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8 no-print">
      <Button 
        onClick={handleShare}
        className="bg-accent hover:bg-accent/90 text-black comic-border h-auto py-4 px-8 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3"
      >
        {copied ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
        {copied ? 'LINK COPIADO!' : 'COMPARTILHAR APP'}
      </Button>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
        https://conto-maluco-ai.vercel.app
      </p>
    </div>
  );
}
