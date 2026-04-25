'use server';
/**
 * @fileOverview Gera a ilustração estilo Gibi para a história.
 */

import {ai} from '@/ai/genkit';

export async function generateComicVisual(prompt: string): Promise<string> {
  // Prompt otimizado para estilo gibi clássico e amigável
  const enhancedPrompt = `Clean comic book illustration, vibrant colors, bold black outlines, professional digital art, storytelling panel, Brazilian comic book style, high resolution. Subject: ${prompt}`;

  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-3',
      prompt: enhancedPrompt,
      config: {
        aspectRatio: '1:1',
      }
    });

    if (!media?.url) {
      throw new Error('No image URL returned from Imagen');
    }
    
    return media.url;
  } catch (error) {
    console.error('Erro na geração de imagem Imagen:', error);
    // Tenta um fallback com prompt mais simples em caso de erro de segurança
    try {
        const fallback = await ai.generate({
            model: 'googleai/imagen-3',
            prompt: `Cartoon illustration, colorful, comic style. ${prompt}`,
            config: { aspectRatio: '1:1' }
        });
        return fallback.media?.url || '';
    } catch (e) {
        throw new Error('Falha total na geração visual.');
    }
  }
}
