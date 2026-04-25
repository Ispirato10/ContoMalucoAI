
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, X } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Verifica se já não foi fechado nesta sessão
      if (!sessionStorage.getItem('pwa_prompt_dismissed')) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md no-print animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white comic-border p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="bg-accent p-3 comic-border -rotate-3 shrink-0">
            <Sparkles className="w-6 h-6 text-black animate-pulse" />
          </div>
          <div className="space-y-3">
            <p className="comic-text font-black text-lg leading-tight text-black uppercase">
              Leve a diversão no bolso! 🚀
            </p>
            <p className="text-sm font-bold text-muted-foreground italic leading-snug">
              Instale o Conto Maluco na sua tela inicial para criar gibis bizarros a qualquer momento.
            </p>
            <Button 
              onClick={handleInstall}
              className="w-full bg-primary hover:bg-primary/90 text-white comic-border h-auto py-3 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              <Download className="w-5 h-5 mr-2" /> INSTALAR AGORA!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
