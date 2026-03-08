'use server';
/**
 * @fileOverview Este arquivo implementa um fluxo Genkit para gerar um prompt otimizado para IA de geração de imagem.
 *
 * - generateAdImagePrompt - Uma função que cria um prompt detalhado baseado nos detalhes do produto, tema e plataforma.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const GenerateAdImagePromptInputSchema = z.object({
  productName: z.string().describe('O nome do produto.'),
  productBenefits: z.string().optional().describe('Principais benefícios ou características do produto.'),
  productUrl: z.string().url().optional().describe('Uma URL para a página do produto para extrair mais informações.'),
  theme: z.string().describe('O tema publicitário escolhido (ex: \'Luxo\', \'Sazonal\', \'Minimalista\').'),
  platform: z
    .enum(['story', 'feed', 'banner', 'facebook-ads', 'whatsapp-campaign'])
    .describe('A plataforma de destino ou formato do anúncio.'),
  productImage: z
    .string()
    .optional()
    .describe(
      "Uma foto do produto como data URI Base64."
    ),
});
export type GenerateAdImagePromptInput = z.infer<typeof GenerateAdImagePromptInputSchema>;

const GenerateAdImagePromptOutputSchema = z.object({
  prompt: z.string().describe('O prompt detalhado gerado para a IA de geração de imagem.'),
  imageSize: z.string().describe('O tamanho recomendado da imagem.'),
});
export type GenerateAdImagePromptOutput = z.infer<typeof GenerateAdImagePromptOutputSchema>;

// Ferramenta para buscar detalhes do produto a partir de uma URL
const fetchProductDetails = ai.defineTool(
  {
    name: 'fetchProductDetails',
    description: 'Busca o conteúdo de texto de uma URL de produto para extrair benefícios e detalhes reais.',
    inputSchema: z.object({
      url: z.string().url().describe('A URL da página do produto.'),
    }),
    outputSchema: z.object({
      content: z.string().describe('O conteúdo de texto extraído da página.'),
    }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      $('script, style, nav, footer, header, iframe, noscript').remove();
      
      const content = $('body').text().replace(/\s+/g, ' ').trim();
      return { content: content.substring(0, 6000) }; 
    } catch (error) {
      return { content: 'Não foi possível acessar a URL para extrair detalhes.' };
    }
  }
);

const generateAdImagePromptInternal = ai.definePrompt({
  name: 'generateAdImagePrompt',
  input: {schema: GenerateAdImagePromptInputSchema},
  output: {schema: GenerateAdImagePromptOutputSchema},
  tools: [fetchProductDetails],
  prompt: `Você é um especialista em marketing digital e design publicitário de luxo.
Sua tarefa é criar um prompt de geração de imagem ultra-detalhado usando IA Gemini.

DADOS DO PRODUTO:
Nome: {{{productName}}}
Benefícios Manuais: {{{productBenefits}}}
URL: {{{productUrl}}}

{{#if productUrl}}
IMPORTANTE: Use a ferramenta 'fetchProductDetails' para ler a página do produto. Extraia os benefícios reais, ingredientes, proposta de valor e a estética da marca. Incorpore esses elementos no prompt para torná-lo autêntico.
{{/if}}

TEMA: {{{theme}}}
PLATAFORMA: {{{platform}}}

REQUISITOS DO PROMPT FINAL:
- Deve ser em inglês (melhor para modelos de imagem).
- Estilo luxuoso, cinematográfico e profissional.
- Iluminação dramática de estúdio.
- Foco absoluto no produto centralizado.
- Detalhes realistas 8k, texturas nítidas.
- Evocar o tema {{{theme}}}.

Retorne apenas o prompt otimizado e o tamanho da imagem.
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

    let imageSize = '1080x1080';
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
