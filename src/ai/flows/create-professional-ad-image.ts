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
    let modelName: string;
    let aspectRatio: '1:1' | '9:16' | '16:9' | '4:3' | '3:4' | undefined;

    // Determinar a proporção baseada na plataforma (ajustado para valores suportados)
    if (platform === 'story') {
      aspectRatio = '9:16';
    } else if (platform === 'feed') {
      aspectRatio = '1:1';
    } else { 
      aspectRatio = '16:9'; 
    }

    if (productImage) {
      // Usar modelo multimodal se uma imagem do produto for fornecida
      modelName = 'googleai/gemini-2.5-flash'; // Usando flash para melhor compatibilidade com vision
      imageGenerationPrompt = [
        {
          media: {
            contentType: productImage.split(';')[0].split(':')[1], 
            url: productImage,
          },
        },
        { text: `Based on this product image and the following request, create a professional advertising image: ${textPrompt}` },
      ];
      
      const { media } = await ai.generate({
        model: modelName,
        prompt: imageGenerationPrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media || !media.url) {
        throw new Error('Falha ao gerar a imagem através do Gemini Vision.');
      }

      return {
        imageUrl: media.url,
      };

    } else {
      // Usar modelo de geração de imagem rápido (mais provável de estar no tier gratuito)
      modelName = 'googleai/imagen-3.0-fast-generate-001';
      imageGenerationPrompt = textPrompt;

      const { media } = await ai.generate({
        model: modelName,
        prompt: imageGenerationPrompt,
        config: {
          aspectRatio,
        },
      });

      if (!media || !media.url) {
        throw new Error('Falha ao gerar a imagem com o Imagen 3 Fast.');
      }

      return {
        imageUrl: media.url,
      };
    }
  }
);
