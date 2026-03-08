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

    // Determinar a proporção baseada na plataforma (ajustado para valores suportados pelo Imagen 4)
    if (platform === 'story') {
      aspectRatio = '9:16';
    } else if (platform === 'feed') {
      aspectRatio = '1:1';
    } else { 
      aspectRatio = '16:9'; 
    }

    if (productImage) {
      // Usar modelo imagem-para-imagem se uma imagem do produto for fornecida
      modelName = 'googleai/gemini-2.5-flash-image';
      imageGenerationPrompt = [
        {
          media: {
            contentType: productImage.split(';')[0].split(':')[1], 
            url: productImage,
          },
        },
        { text: textPrompt },
      ];
    } else {
      // Usar modelo texto-para-imagem se nenhuma imagem do produto for fornecida
      modelName = 'googleai/imagen-4.0-fast-generate-001';
      imageGenerationPrompt = textPrompt;
    }

    const { media } = await ai.generate({
      model: modelName,
      prompt: imageGenerationPrompt,
      config: {
        ...(modelName === 'googleai/imagen-4.0-fast-generate-001' && { aspectRatio }),
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Falha ao gerar a imagem ou a URL da imagem está ausente.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
