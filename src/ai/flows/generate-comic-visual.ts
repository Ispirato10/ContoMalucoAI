'use server';
/**
 * @fileOverview Gera a ilustração estilo Gibi para a história final.
 */

import {ai} from '@/ai/genkit';

export async function generateComicVisual(prompt: string): Promise<string> {
  const enhancedPrompt = `High-quality comic book panel illustration, vibrant colors, bold ink outlines, professional digital art, storytelling style, Brazilian comic aesthetic. Scene: ${prompt}`;

  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-3',
      prompt: enhancedPrompt,
      config: {
        aspectRatio: '1:1',
      }
    });

    if (!media?.url) {
      throw new Error('Falha ao gerar o desenho do gibi.');
    }
    
    return media.url;
  } catch (error) {
    console.error('Erro na geração Imagen:', error);
    try {
        const fallback = await ai.generate({
            model: 'googleai/imagen-3',
            prompt: `Colorful cartoon drawing, comic style. ${prompt}`,
            config: { aspectRatio: '1:1' }
        });
        return fallback.media?.url || '';
    } catch (e) {
        throw new Error('Não foi possível desenhar o gibi agora.');
    }
  }
}
