
'use server';
/**
 * @fileOverview Gera um script detalhado (briefing) para criação de anúncios no ChatGPT/DALL-E.
 * 
 * Este fluxo analisa os dados do produto e as configurações da campanha para criar um
 * prompt "Mestre" em inglês e diretrizes de copywriting em português.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const GenerateAdScriptInputSchema = z.object({
  productName: z.string().describe('Nome do produto.'),
  productUrl: z.string().url().optional().describe('URL do produto para análise.'),
  theme: z.string().describe('Tema visual escolhido.'),
  platform: z.string().describe('Plataforma de destino (ex: Instagram, Facebook, TikTok).'),
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
    chatGptInstructions: z.string().describe('Instruções para o ChatGPT sobre como processar a imagem do produto.'),
    copywriting: z.object({
      headline: z.string().describe('Título de impacto em português.'),
      description: z.string().describe('Descrição curta para o anúncio.'),
      callToAction: z.string().describe('Chamada para ação (CTA).'),
    }),
    technicalDetails: z.object({
      aspectRatio: z.string().describe('Proporção da imagem (ex: 1:1, 9:16).'),
      suggestedColors: z.array(z.string()).describe('Paleta de cores recomendada.'),
      lightingStyle: z.string().describe('Estilo de iluminação sugerido.'),
    }),
    metadata: z.object({
      theme: z.string(),
      platform: z.string(),
      coupon: z.string().optional(),
    })
  }),
});

export type GenerateAdScriptOutput = z.infer<typeof GenerateAdScriptOutputSchema>;

const fetchProductDetails = ai.defineTool(
  {
    name: 'fetchProductDetails',
    description: 'Extrai texto de uma URL de produto para análise de marketing e diferenciais.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.object({ content: z.string() }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/110.0.0.0 Safari/537.36' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style, nav, footer, header').remove();
      const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
      return { content };
    } catch (error) {
      return { content: 'Não foi possível acessar o site para extrair detalhes.' };
    }
  }
);

const generateAdScriptInternal = ai.definePrompt({
  name: 'generateAdScriptPrompt',
  input: {schema: GenerateAdScriptInputSchema},
  output: {schema: GenerateAdScriptOutputSchema},
  tools: [fetchProductDetails],
  prompt: `Você é um Diretor de Arte e Copywriter de elite especializado em Marketing Digital de Alta Conversão. 

Sua tarefa é criar um BRIEFING TÉCNICO em formato JSON que o usuário enviará ao ChatGPT para gerar um anúncio perfeito.

DADOS DA CAMPANHA:
- Produto: {{{productName}}}
- URL: {{{productUrl}}}
- Tema Visual: {{{theme}}}
- Plataforma: {{{platform}}}
- Cupom: {{{couponCode}}}
- Promoção: {{{promoText}}}
- Site no Anúncio: {{{targetWebsite}}}
- Evento/Data: {{{eventDate}}}
- Benefícios: {{{productBenefits}}}

{{#if productUrl}}
IMPORTANTE: Utilize a ferramenta 'fetchProductDetails' para analisar o site do produto. Identifique os diferenciais reais, a paleta de cores da marca e o público-alvo para tornar o prompt mais assertivo.
{{/if}}

REQUISITOS PARA O DALLE PROMPT (EM INGLÊS):
1. Deve ser um prompt "master" para o DALL-E 3.
2. Descreva o produto como a peça central, cercado por elementos do tema "{{{theme}}}".
3. Use terminologia de fotografia profissional (ex: "85mm lens", "studio lighting", "soft bokeh", "high-end product photography").
4. Especifique a integração da foto do produto enviada pelo usuário: "Integrate the physical product from the attached reference photo into this high-end composition".
5. Se houver cupom ou site, descreva um local elegante na imagem para esses textos (ex: "floating minimal glass plaque" ou "subtle gold embossed text").

REQUISITOS PARA COPYWRITING (EM PORTUGUÊS):
- Crie um título magnético e um CTA impossível de ignorar.

REQUISITOS TÉCNICOS:
- Defina a proporção (aspect ratio) correta para a plataforma escolhida.

Retorne o resultado estruturado exatamente conforme o schema de saída.
`,
});

export async function generateAdScript(input: GenerateAdScriptInput): Promise<GenerateAdScriptOutput> {
  const {output} = await generateAdScriptInternal(input);
  return output!;
}
