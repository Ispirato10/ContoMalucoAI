'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating professional advertising images.
 *
 * - createProfessionalAdImage - A function that generates an advertising image based on a detailed prompt and optional product image.
 * - CreateProfessionalAdImageInput - The input type for the createProfessionalAdImage function.
 * - CreateProfessionalAdImageOutput - The return type for the createProfessionalAdImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for the flow
const CreateProfessionalAdImageInputSchema = z.object({
  textPrompt: z.string().describe('A detailed textual prompt describing the desired advertising image.'),
  productImage: z
    .string()
    .optional()
    .describe(
      "An optional photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  platform: z
    .enum(['story', 'feed', 'banner'])
    .describe('The target social media platform or format for the ad image.'),
});
export type CreateProfessionalAdImageInput = z.infer<typeof CreateProfessionalAdImageInputSchema>;

// Output Schema for the flow
const CreateProfessionalAdImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated professional advertising image.'),
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
    let aspectRatio: 'LANDSCAPE_4_3' | 'PORTRAIT_3_4' | 'SQUARE_1_1' | undefined;

    // Determine aspect ratio based on platform
    if (platform === 'story') {
      aspectRatio = 'PORTRAIT_3_4'; // Corresponds to 9:16 or 1080x1920
    } else if (platform === 'feed') {
      aspectRatio = 'SQUARE_1_1'; // Corresponds to 1:1 or 1080x1080
    } else { // 'banner' or other, default to landscape
      aspectRatio = 'LANDSCAPE_4_3'; // A common banner aspect ratio
    }

    if (productImage) {
      // Use image-to-image model if a product image is provided
      modelName = 'googleai/gemini-2.5-flash-image';
      imageGenerationPrompt = [
        {
          media: {
            contentType: productImage.split(';')[0].split(':')[1], // Extract mime type from data URI
            url: productImage,
          },
        },
        { text: textPrompt },
      ];
      // Note: gemini-2.5-flash-image does not directly support 'aspectRatio' in config as imagen does for text-to-image.
      // Its output aspect ratio is often influenced by the input image or default behavior.
    } else {
      // Use text-to-image model if no product image is provided
      modelName = 'googleai/imagen-4.0-fast-generate-001';
      imageGenerationPrompt = textPrompt;
    }

    const { media } = await ai.generate({
      model: modelName,
      prompt: imageGenerationPrompt,
      config: {
        // Only apply aspectRatio for text-to-image models that support it.
        ...(modelName === 'googleai/imagen-4.0-fast-generate-001' && { aspectRatio }),
        responseModalities: ['TEXT', 'IMAGE'], // Ensure both text and image modalities are requested
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate image or image URL is missing.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
