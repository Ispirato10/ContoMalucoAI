'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating an optimized prompt for image generation AI.
 *
 * - generateAdImagePrompt - A function that crafts a detailed prompt for image generation based on product details, theme, and platform.
 * - GenerateAdImagePromptInput - The input type for the generateAdImagePrompt function.
 * - GenerateAdImagePromptOutput - The return type for the generateAdImagePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdImagePromptInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productBenefits: z.string().describe('Key benefits or features of the product.'),
  theme: z.string().describe('The chosen advertising theme (e.g., \'Luxury\', \'Seasonal\', \'Podology\').'),
  platform: z
    .enum(['story', 'feed', 'banner', 'facebook-ads', 'whatsapp-campaign'])
    .describe('The target social media platform or ad format (e.g., \'Instagram Story\', \'Feed Post\').'),
  productImage: z
    .string()
    .optional()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAdImagePromptInput = z.infer<typeof GenerateAdImagePromptInputSchema>;

const GenerateAdImagePromptOutputSchema = z.object({
  prompt: z.string().describe('The generated detailed prompt for the image generation AI.'),
  imageSize: z.string().describe('The recommended image size (e.g., 1080x1920, 1080x1080).'),
});
export type GenerateAdImagePromptOutput = z.infer<typeof GenerateAdImagePromptOutputSchema>;

const generateAdImagePromptInternal = ai.definePrompt({
  name: 'generateAdImagePrompt',
  input: {schema: GenerateAdImagePromptInputSchema},
  output: {schema: GenerateAdImagePromptOutputSchema},
  prompt: `Crie uma imagem publicitária profissional para redes sociais, incorporando o produto e o tema selecionados. O prompt final deve ser otimizado para um modelo de geração de imagens, garantindo alta relevância e qualidade profissional.

PRODUTO:
Nome: {{{productName}}}
Benefícios: {{{productBenefits}}}

TEMA: {{{theme}}}

PLATAFORMA: {{{platform}}}

REQUISITOS GERAIS PARA A IMAGEM:
- estilo luxuoso
- iluminação profissional e dramática
- design publicitário premium e sofisticado
- produto centralizado e em destaque
- tipografia elegante e legível (se aplicável, para slogans)
- layout de marketing de alto nível
- manter o produto idêntico à imagem original do produto (se fornecida)
- qualidade ultra realista e fotográfica
- foco na conversão e impacto visual
- use elementos visuais que evoquem o tema {{{theme}}}

FORMATO E TAMANHO:
{{#ifEq platform "story"}}
  Formato: vertical para Instagram Story
  Tamanho: 1080x1920
{{else ifEq platform "feed"}}
  Formato: quadrado para Instagram Feed
  Tamanho: 1080x1080
{{else ifEq platform "banner"}}
  Formato: retangular para Banner (horizontal)
  Tamanho: 1200x628
{{else ifEq platform "facebook-ads"}}
  Formato: retangular para Facebook Ads
  Tamanho: 1200x628
{{else ifEq platform "whatsapp-campaign"}}
  Formato: retangular para WhatsApp Campanha
  Tamanho: 800x418
{{else}}
  Formato: quadrado (padrão)
  Tamanho: 1080x1080
{{/ifEq}}

OBJETIVO: criar uma imagem comercial de alta conversão para redes sociais, que seja visualmente deslumbrante e alinhada ao branding de luxo e ao tema escolhido.

{{#if productImage}}
  IMAGEM DE REFERÊNCIA DO PRODUTO: {{media url=productImage}}
{{/if}}

Por favor, retorne apenas o prompt de imagem final otimizado, sem introduções ou conclusões.
`,
});

const generateAdImagePromptFlow = ai.defineFlow(
  {
    name: 'generateAdImagePromptFlow',
    inputSchema: GenerateAdImagePromptInputSchema,
    outputSchema: GenerateAdImagePromptOutputSchema,
  },
  async input => {
    const {output} = await generateAdImagePromptInternal(input);

    let imageSize = '1080x1080'; // Default
    switch (input.platform) {
      case 'story':
        imageSize = '1080x1920';
        break;
      case 'feed':
        imageSize = '1080x1080';
        break;
      case 'banner':
      case 'facebook-ads':
        imageSize = '1200x628';
        break;
      case 'whatsapp-campaign':
        imageSize = '800x418';
        break;
    }

    return {
      prompt: output!.prompt,
      imageSize: imageSize,
    };
  }
);

export async function generateAdImagePrompt(
  input: GenerateAdImagePromptInput
): Promise<GenerateAdImagePromptOutput> {
  return generateAdImagePromptFlow(input);
}
