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
    description: 'Busca o conteúdo HTML de uma página de produto para análise.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.object({ html: z.string() }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        },
        next: { revalidate: 3600 }
      });
      
      if (!response.ok) throw new Error('Falha ao acessar o site');
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remover elementos que poluem o texto
      $('script, style, nav, footer, header, iframe, noscript, svg, form').remove();
      
      const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 10000);
      return { html: content };
    } catch (error) {
      console.error('Scraper Error:', error);
      return { html: 'Não foi possível ler o conteúdo do site. Por favor, preencha manualmente.' };
    }
  }
);

const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { schema: ExtractBenefitsInputSchema },
  output: { schema: ExtractBenefitsOutputSchema },
  tools: [fetchRawContent],
  prompt: `Você é um Estrategista de Marketing de Elite e Copywriter Senior. 
Analise o conteúdo do seguinte site: {{{url}}}

Sua missão é:
1. Identificar o NOME COMERCIAL exato do produto (ignore nomes genéricos da loja).
2. Extrair os 5 benefícios mais impactantes e diferenciais técnicos que tornam este produto único e desejável.

IMPORTANTE:
- Seja persuasivo e profissional.
- Transforme características técnicas em benefícios emocionais e visuais poderosos.
- Responda em PORTUGUÊS do Brasil.
- Foque em detalhes que possam ser representados visualmente em uma campanha de luxo ou comercial viral.`,
});

export async function extractBenefits(input: { url: string }) {
  const { output } = await extractBenefitsPrompt(input);
  return output!;
}
