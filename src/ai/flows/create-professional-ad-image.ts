'use server';
/**
 * @fileOverview Gerador de Visuais Publicitários de Alto Impacto.
 * Lida com geração pura (Imagen 3) e manipulação de imagem real (Gemini Vision).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateAdImageInputSchema = z.object({
  prompt: z.string().describe('O prompt mestre em inglês.'),
  productImage: z.string().optional().describe('Data URI da foto real do produto.'),
  platform: z.string().describe('Formato/Plataforma.'),
});

export type CreateAdImageInput = z.infer<typeof CreateAdImageInputSchema>;

export async function createProfessionalAdImage(input: CreateAdImageInput): Promise<{ imageUrl: string }> {
  const { prompt, productImage, platform } = input;

  let aspectRatio: '1:1' | '9:16' | '16:9' = '1:1';
  if (platform.includes('9:16')) aspectRatio = '9:16';
  else if (platform.includes('16:9')) aspectRatio = '16:9';

  try {
    if (productImage) {
      // VISÃO COMPUTACIONAL: Usa a foto real como base e reconstrói o cenário ao redor
      const { media } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
          { media: { url: productImage, contentType: 'image/jpeg' } },
          { text: `ACT AS A LUXURY COMMERCIAL PHOTOGRAPHER. Use the product in this image as the main subject. RECREATE THE ENTIRE SCENE AROUND IT into a professional ${prompt}. Keep the product lighting and perspective consistent. High-end studio look, 8k resolution, cinematic lighting. THE OUTPUT MODALITY MUST BE IMAGE.` }
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        }
      });
      if (!media?.url) throw new Error('Falha na geração vision.');
      return { imageUrl: media.url };
    } else {
      // GERAÇÃO PURA
      const { media } = await ai.generate({
        model: 'googleai/imagen-3',
        prompt: `High-end luxury professional product advertisement. ${prompt}. Cinematic studio lighting, sharp focus, 8k, ultra-realistic.`,
        config: { aspectRatio }
      });
      if (!media?.url) throw new Error('Erro no Imagen 3.');
      return { imageUrl: media.url };
    }
  } catch (error: any) {
    console.error('Image Gen Error:', error);
    // Fallback amigável em caso de erro de cota ou segurança
    throw new Error('Falha técnica na geração visual. Verifique as cotas da API ou tente um prompt diferente.');
  }
}
