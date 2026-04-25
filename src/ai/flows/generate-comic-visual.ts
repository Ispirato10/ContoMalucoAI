'use server';
/**
 * @fileOverview Gera a ilustração estilo Gibi para a história.
 */

import {ai} from '@/ai/genkit';

export async function generateComicVisual(prompt: string): Promise<string> {
  const { media } = await ai.generate({
    model: 'googleai/imagen-3',
    prompt: `Comic book panel illustration, bold lines, vibrant flat colors, Brazilian comic style, high quality, digital art, ${prompt}`,
    config: {
      aspectRatio: '1:1',
    }
  });

  if (!media?.url) throw new Error('Falha ao gerar o visual do gibi.');
  return media.url;
}