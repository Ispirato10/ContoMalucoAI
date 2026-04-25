'use server';
/**
 * @fileOverview Gera as ilustrações do gibi usando Imagen 3.
 */

import {ai} from '@/ai/genkit';

export async function generateComicVisual(prompt: string): Promise<string> {
  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-3',
      prompt: `Professional high-quality comic book illustration, vibrant colors, bold outlines, Brazilian comic style, detailed background. Scene: ${prompt}`,
      config: {
        aspectRatio: '1:1',
      }
    });

    if (!media?.url) {
      throw new Error('Falha na geração visual.');
    }
    
    return media.url;
  } catch (error) {
    console.error('Erro Imagen:', error);
    // Fallback: Retorna uma imagem placeholder se a geração falhar ou for bloqueada
    return `https://picsum.photos/seed/${Math.random()}/800/800`;
  }
}
