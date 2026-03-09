
'use server';
/**
 * @fileOverview Gera um script detalhado (briefing) para criação de anúncios no ChatGPT/DALL-E.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const GenerateAdScriptInputSchema = z.object({
  productName: z.string().describe('Nome do produto.'),
  productUrl: z.string().url().optional().describe('URL do produto para análise.'),
  theme: z.string().describe('Tema visual escolhido.'),
  platform: z.string().describe('Plataforma de destino (ex: Instagram, Facebook, WhatsApp).'),
  couponCode: z.string().optional().describe('Código de cupom de desconto.'),
  promoText: z.string().optional().describe('Texto da promoção ou oferta especial.'),
  targetWebsite: z.string().optional().describe('Website a ser exibido no anúncio.'),
  eventDate: z.string().optional().describe('Data comemorativa ou evento específico.'),
  productBenefits: z.string().optional().describe('Benefícios manuais do produto.'),
});

export type GenerateAdScriptInput = z.infer<typeof GenerateAdScriptInputSchema>;

const GenerateAdScriptOutputSchema = z.object({
  campaignBriefing: z.object({
    dallePrompt: z.string().describe('O prompt mestre em inglês otimizado para o DALL-E 3.'),
    copywriting: z.object({
      headline: z.string(),
      description: z.string(),
      callToAction: z.string(),
    }),
    technicalDetails: z.object({
      aspectRatio: z.string(),
      suggestedColors: z.array(z.string()),
      lightingStyle: z.string(),
    }),
  }),
});

export type GenerateAdScriptOutput = z.infer<typeof GenerateAdScriptOutputSchema>;

const fetchProductDetails = ai.defineTool(
  {
    name: 'fetchProductDetails',
    description: 'Extrai texto de uma URL de produto para análise de marketing.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.object({ content: z.string() }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style, nav, footer, header').remove();
      return { content: $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000) };
    } catch (error) {
      return { content: 'Não foi possível acessar o site.' };
    }
  }
);

const generateAdScriptInternal = ai.definePrompt({
  name: 'generateAdScriptPrompt',
  input: {schema: GenerateAdScriptInputSchema},
  output: {schema: GenerateAdScriptOutputSchema},
  tools: [fetchProductDetails],
  prompt: `Você é um Diretor de Arte e Copywriter de elite. Sua tarefa é criar um briefing técnico (Script) para que o usuário envie ao ChatGPT/DALL-E junto com a foto do produto.

DADOS DA CAMPANHA:
Produto: {{{productName}}}
URL: {{{productUrl}}}
Tema: {{{theme}}}
Plataforma: {{{platform}}}
Cupom: {{{couponCode}}}
Promoção: {{{promoText}}}
Site no Anúncio: {{{targetWebsite}}}
Evento/Data: {{{eventDate}}}
Benefícios: {{{productBenefits}}}

{{#if productUrl}}
IMPORTANTE: Use 'fetchProductDetails' para entender os diferenciais reais do produto e o estilo da marca.
{{/if}}

INSTRUÇÕES PARA O OUTPUT:
1. dallePrompt: Crie um prompt ultra-detalhado em INGLÊS. Deve descrever o produto como o centro das atenções, iluminação profissional de estúdio, elementos do tema "{{{theme}}}", e espaço para texto se necessário. Mencione que o estilo deve ser cinematográfico e realista (8k).
2. copywriting: Crie chamadas impactantes em Português.
3. technicalDetails: Recomende cores e iluminação baseadas no tema e plataforma.

O script deve ser profissional e focado em conversão.
`,
});

export async function generateAdScript(input: GenerateAdScriptInput): Promise<GenerateAdScriptOutput> {
  const {output} = await generateAdScriptInternal(input);
  return output!;
}
