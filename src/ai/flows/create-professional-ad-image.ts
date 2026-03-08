'use server';
/**
 * @fileOverview Este arquivo implementa um fluxo Genkit para gerar imagens publicitárias profissionais.
 *
 * - createProfessionalAdImage - Uma função que gera uma imagem publicitária baseada em um prompt detalhado e imagem opcional do produto.
 * - CreateProfessionalAdImageInput - O tipo de entrada para a função createProfessionalAdImage.
 * - CreateProfessionalAdImageOutput - O tipo de retorno para a função createProfessionalAdImage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Esquema de Entrada para o fluxo
const CreateProfessionalAdImageInputSchema = z.object({
  textPrompt: z.string().describe('Um prompt textual detalhado descrevendo a imagem publicitária desejada.'),
  productImage: z
    .string()
    .optional()
    .describe(
      "Uma foto opcional do produto, como um data URI que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  platform: z
    .enum(['story', 'feed', 'banner'])
    .describe('A plataforma social de destino ou formato para a imagem do anúncio.'),
});
export type CreateProfessionalAdImageInput = z.infer<typeof CreateProfessionalAdImageInputSchema>;

// Esquema de Saída para o fluxo
const CreateProfessionalAdImageOutputSchema = z.object({
  imageUrl: z.string().describe('O data URI da imagem publicitária profissional gerada.'),
});
export type CreateProfessionalAdImageOutput = z.infer<typeof CreateProfessionalAdImageOutputSchema>;

export async function createProfessionalAdImage(
  input: CreateProfessionalAdImageInput
): Promise<CreateProfessionalAdImageOutput> {
  return createProfessionalAdImageFlow(input);
}

const createProfessionalAdImageFlow = ai.defineFlow(
  {
    name: 'createProfessionalAdImageFlow',
    inputSchema: CreateProfessionalAdImageInputSchema,
    outputSchema: CreateProfessionalAdImageOutputSchema,
  },
  async (input) => {
    const { textPrompt, productImage, platform } = input;

    let imageGenerationPrompt: string | Array<any>;
    let modelName: any;
    let aspectRatio: '1:1' | '9:16' | '16:9' | undefined;

    // Determinar a proporção baseada na plataforma
    if (platform === 'story') {
      aspectRatio = '9:16';
    } else if (platform === 'feed') {
      aspectRatio = '1:1';
    } else { 
      aspectRatio = '16:9'; 
    }

    if (productImage) {
      // Usar Gemini para visão se houver imagem do produto
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', 
        prompt: [
          {
            media: {
              contentType: productImage.split(';')[0].split(':')[1], 
              url: productImage,
            },
          },
          { text: `Com base nesta imagem de produto e no seguinte pedido, crie uma imagem publicitária profissional de alta conversão: ${textPrompt}. Foque na estética luxuosa e iluminação de estúdio.` },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media || !media.url) {
        throw new Error('Falha ao gerar a imagem com Gemini Vision.');
      }

      return { imageUrl: media.url };

    } else {
      // Usar Imagen 3 para geração de texto para imagem (mais estável)
      const { media } = await ai.generate({
        model: 'googleai/imagen-3',
        prompt: textPrompt,
        config: {
          aspectRatio,
        },
      });

      if (!media || !media.url) {
        throw new Error('Falha ao gerar a imagem com Imagen 3.');
      }

      return { imageUrl: media.url };
    }
  }
);
