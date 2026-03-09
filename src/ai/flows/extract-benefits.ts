
'use server';
/**
 * @fileOverview Fluxo Genkit para extrair diferenciais de produtos a partir de uma URL.
 * 
 * - extractBenefits - Analisa o site e retorna apenas os diferenciais e benefícios.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const ExtractBenefitsInputSchema = z.object({
  url: z.string().url().describe('A URL da página do produto.'),
});

const ExtractBenefitsOutputSchema = z.object({
  benefits: z.string().describe('Lista de benefícios e diferenciais extraídos do site.'),
});

const fetchRawContent = ai.defineTool(
  {
    name: 'fetchRawContent',
    description: 'Busca o conteúdo HTML de uma página de produto para análise estratégica.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.object({ html: z.string() }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        next: { revalidate: 3600 }
      });
      
      if (!response.ok) throw new Error(`Falha ao acessar o site: ${response.status}`);
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remover elementos irrelevantes para manter o contexto limpo
      $('script, style, nav, footer, header, iframe, noscript, svg, form, head').remove();
      
      // Capturar apenas o texto visível e relevante
      const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);
      
      if (!content || content.length < 50) {
        return { html: 'Conteúdo insuficiente encontrado na página. Por favor, preencha manualmente.' };
      }

      return { html: content };
    } catch (error: any) {
      console.error('Scraper Error:', error.message);
      return { html: 'Não foi possível ler o conteúdo do site devido a restrições de acesso. Por favor, preencha manualmente.' };
    }
  }
);

const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { schema: ExtractBenefitsInputSchema },
  output: { schema: ExtractBenefitsOutputSchema },
  tools: [fetchRawContent],
  prompt: `Você é um Estrategista de Marketing de Elite e Copywriter Senior. 
Sua missão é analisar o conteúdo do site: {{{url}}}

Utilize a ferramenta 'fetchRawContent' para obter os dados. 

FOCO DA ANÁLISE:
Extraia os benefícios mais impactantes, diferenciais técnicos, proposta de valor e a estética emocional que tornam este produto único e desejável para uma campanha comercial de luxo.

REQUISITOS:
1. Ignore nomes de produtos (foque apenas nos argumentos de venda).
2. Transforme características técnicas em benefícios visuais e emocionais poderosos.
3. Responda em PORTUGUÊS do Brasil.
4. O texto deve ser persuasivo, direto e ideal para um Diretor de Arte usar em um comercial viral.`,
});

export async function extractBenefits(input: { url: string }) {
  const { output } = await extractBenefitsPrompt(input);
  return output!;
}
