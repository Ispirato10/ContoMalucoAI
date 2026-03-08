'use server';
/**
 * @fileOverview Este arquivo implementa um fluxo Genkit para gerar imagens publicitárias profissionais.
 *
 * - createProfessionalAdImage - Uma função que gera uma imagem publicitária baseada em um prompt detalhado e imagem opcional do produto.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

    let aspectRatio: '1:1' | '9:16' | '16:9' | undefined;

    if (platform === 'story') {
      aspectRatio = '9:16';
    } else if (platform === 'feed') {
      aspectRatio = '1:1';
    } else { 
      aspectRatio = '16:9'; 
    }

    if (productImage) {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', 
        prompt: [
          {
            media: {
              contentType: productImage.split(';')[0].split(':')[1], 
              url: productImage,
            },
          },
          { text: `Com base nesta imagem de produto e no seguinte pedido, crie uma imagem publicitária profissional de alta conversão: ${textPrompt}. Foque na estética luxuosa, iluminação de estúdio e centralização do produto.` },
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
      const { media } = await ai.generate({
        model: 'googleai/imagen-3',
        prompt: textPrompt,
        config: {
          aspectRatio,
        },
      });

      if (!media || !media.url) {
        throw new Error('Falha ao gerar a imagem com Imagen 3. Verifique se o modelo está disponível em sua região.');
      }

      return { imageUrl: media.url };
    }
  }
);
