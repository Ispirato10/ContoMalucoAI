
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
      event: z.string().optional(),
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
  prompt: `Você é um Diretor de Arte e Estrategista Criativo de elite. Sua missão é criar o BRIEFING MAESTRO definitivo para o DALL-E 3.

DADOS DA CAMPANHA:
- Produto: {{{productName}}}
- URL: {{{productUrl}}}
- Estilo Visual: {{{theme}}}
- Plataforma: {{{platform}}}
- Cupom: {{{couponCode}}}
- Promoção: {{{promoText}}}
- Site: {{{targetWebsite}}}
- Evento/Data Comemorativa: {{{eventDate}}}
- Benefícios Fornecidos: {{{productBenefits}}}

{{#if productUrl}}
IMPORTANTE: Utilize 'fetchProductDetails' para capturar a alma do produto. Identifique os benefícios "matadores" e a estética da marca.
{{/if}}

SUA TAREFA CRIATIVA:
1. MISTURA DE TEMAS: Você deve fundir o Estilo Visual (ex: Minimalista) com o Evento (ex: Natal) de forma criativa. Não apenas coloque o produto num fundo natalino, mas crie uma "Composição Artística Híbrida" (ex: Árvore de natal minimalista feita de luzes neon se o estilo for Cyberpunk).
2. VISUALIZAÇÃO DE BENEFÍCIOS: Transforme os benefícios do produto em elementos visuais. Se o produto for "confortável", mostre-o em nuvens estilizadas ou texturas suaves.
3. FOCO NO PRODUTO: O produto da foto de referência DEVE ser a estrela central, integrado perfeitamente ao cenário.

REQUISITOS DO DALLE PROMPT (EM INGLÊS):
- Comece com: "A high-end, professional commercial product photography of [Product Name]..."
- Descreva a fusão criativa entre {{{theme}}} e {{{eventDate}}}.
- Inclua detalhes de iluminação (volumetric lighting, soft shadows, rim lighting).
- Especifique a integração: "Integrate the specific product from the reference image seamlessly into this environment."
- Adicione elementos gráficos sutis que remetam à promoção {{{promoText}}}.

REQUISITOS DE COPYWRITING (EM PORTUGUÊS):
- Crie uma Headline que conecte o benefício do produto com o momento da data comemorativa.

Retorne o JSON completo.`,
});

export async function generateAdScript(input: GenerateAdScriptInput): Promise<GenerateAdScriptOutput> {
  const {output} = await generateAdScriptInternal(input);
  return output!;
}
