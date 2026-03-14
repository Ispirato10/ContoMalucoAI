'use server';
/**
 * @fileOverview Gerador de imagens publicitárias de alto impacto.
 * Utiliza o Imagen 3 ou Gemini 2.0 para criar visuais de estúdio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateAdImageInputSchema = z.object({
  prompt: z.string().describe('O prompt mestre em inglês.'),
  productImage: z.string().optional().describe('Data URI da foto real do produto.'),
  platform: z.string().describe('Plataforma alvo.'),
});

export type CreateAdImageInput = z.infer<typeof CreateAdImageInputSchema>;

export async function createProfessionalAdImage(input: CreateAdImageInput): Promise<{ imageUrl: string }> {
  const { prompt, productImage, platform } = input;

  let aspectRatio: '1:1' | '9:16' | '16:9' = '1:1';
  if (platform.includes('Story') || platform.includes('Reels') || platform.includes('TikTok')) {
    aspectRatio = '9:16';
  } else if (platform.includes('Banner') || platform.includes('Google')) {
    aspectRatio = '16:9';
  }

  try {
    if (productImage) {
      // Image-to-Image para manter o produto real
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash', 
        prompt: [
          { media: { url: productImage, contentType: 'image/jpeg' } },
          { text: `Create a professional high-end luxury commercial advertisement using this product image as the central subject. Scene: ${prompt}. High quality, 8k, studio lighting, sharp textures.` }
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        }
      });
      if (!media?.url) throw new Error('Erro na geração de imagem.');
      return { imageUrl: media.url };
    } else {
      // Text-to-Image puro
      const { media } = await ai.generate({
        model: 'googleai/imagen-3',
        prompt: prompt,
        config: { aspectRatio }
      });
      if (!media?.url) throw new Error('Erro na geração de imagem.');
      return { imageUrl: media.url };
    }
  } catch (error) {
    throw new Error('Falha técnica ao gerar imagem. Verifique seu limite de cota.');
  }
}
