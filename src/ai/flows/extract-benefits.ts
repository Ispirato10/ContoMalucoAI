'use server';
/**
 * @fileOverview Fluxo Genkit para extrair informações do produto a partir de uma URL.
 * 
 * - extractBenefits - Analisa o site e retorna o nome do produto e uma lista de diferenciais.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const ExtractBenefitsInputSchema = z.object({
  url: z.string().url().describe('A URL da página do produto.'),
});

const ExtractBenefitsOutputSchema = z.object({
  productName: z.string().describe('O nome comercial do produto encontrado no site.'),
  benefits: z.string().describe('Lista de benefícios e diferenciais extraídos do site.'),
});

const fetchRawContent = ai.defineTool(
  {
    name: 'fetchRawContent',
    description: 'Busca o conteúdo HTML de uma página.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.object({ html: z.string() }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style, nav, footer, header, iframe, noscript').remove();
      const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 8000);
      return { html: content };
    } catch (error) {
      return { html: 'Erro ao acessar o site.' };
    }
  }
);

const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { schema: ExtractBenefitsInputSchema },
  output: { schema: ExtractBenefitsOutputSchema },
  tools: [fetchRawContent],
  prompt: `Você é um Copywriter de Elite. Analise o conteúdo do site fornecido: {{{url}}}

Utilize a ferramenta 'fetchRawContent' para ler o site.
Sua missão é:
1. Identificar o NOME COMERCIAL do produto principal na página.
2. Extrair os 5 benefícios mais impactantes, diferenciais técnicos e a proposta de valor exclusiva do produto.

Formate a resposta em PORTUGUÊS.
Foque em transformar características técnicas em benefícios emocionais e práticos que vendem.`,
});

export async function extractBenefits(input: { url: string }) {
  const { output } = await extractBenefitsPrompt(input);
  return output!;
}
