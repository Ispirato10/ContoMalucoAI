
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
import * as cheerio from 'cheerio';

const GenerateAdImagePromptInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productBenefits: z.string().optional().describe('Key benefits or features of the product.'),
  productUrl: z.string().url().optional().describe('A URL to the product page to extract more information.'),
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

// Tool to fetch product details from a URL
const fetchProductDetails = ai.defineTool(
  {
    name: 'fetchProductDetails',
    description: 'Fetches the text content of a product page URL to extract benefits and details.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the product page.'),
    }),
    outputSchema: z.object({
      content: z.string().describe('The extracted text content from the page.'),
    }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove scripts, styles, and other noise
      $('script, style, nav, footer, header').remove();
      
      const content = $('body').text().replace(/\s+/g, ' ').trim();
      return { content: content.substring(0, 5000) }; // Limit content size
    } catch (error) {
      return { content: 'Failed to fetch content from URL.' };
    }
  }
);

const generateAdImagePromptInternal = ai.definePrompt({
  name: 'generateAdImagePrompt',
  input: {schema: GenerateAdImagePromptInputSchema},
  output: {schema: GenerateAdImagePromptOutputSchema},
  tools: [fetchProductDetails],
  prompt: `Você é um especialista em marketing digital e design publicitário de luxo.
Crie um prompt otimizado para geração de imagem baseado nas informações do produto.

PRODUTO:
Nome: {{{productName}}}
Benefícios fornecidos: {{{productBenefits}}}
URL do Produto: {{{productUrl}}}

{{#if productUrl}}
IMPORTANTE: Use a ferramenta fetchProductDetails para acessar a URL e extrair informações relevantes sobre o produto e seus benefícios reais.
{{/if}}

TEMA: {{{theme}}}
PLATAFORMA: {{{platform}}}

REQUISITOS GERAIS PARA A IMAGEM:
- Estilo luxuoso e cinematográfico.
- Iluminação profissional e dramática (ex: chiaroscuro, iluminação de estúdio).
- Design publicitário premium e sofisticado.
- Produto centralizado e em destaque absoluto.
- Composição harmônica seguindo regras de design (regra dos terços, simetria).
- Qualidade ultra realista, 8k, detalhes nítidos.
- Use elementos visuais que evoquem o tema {{{theme}}}.

FORMATO E TAMANHO:
{{#ifEq platform "story"}}
  Formato: Vertical 9:16
  Tamanho: 1080x1920
{{else ifEq platform "feed"}}
  Formato: Quadrado 1:1
  Tamanho: 1080x1080
{{else ifEq platform "banner"}}
  Formato: Retangular 16:9
  Tamanho: 1200x628
{{else}}
  Formato: Quadrado 1:1
{{/ifEq}}

Retorne apenas o prompt final otimizado para o modelo de geração de imagem.
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
