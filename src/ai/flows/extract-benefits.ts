
'use server';
/**
 * @fileOverview Fluxo Genkit para extrair diferenciais de produtos a partir de uma URL.
 * 
 * - extractBenefits - Analisa o site e retorna apenas os diferenciais e benefícios de marketing.
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
    description: 'Busca o conteúdo HTML de uma página de produto para análise estratégica de marketing.',
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
      
      // Remover elementos irrelevantes para manter o contexto limpo e focado em conteúdo
      $('script, style, nav, footer, header, iframe, noscript, svg, form, head, .ads, .popup').remove();
      
      // Capturar apenas o texto visível e relevante para marketing
      const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 18000);
      
      if (!content || content.length < 50) {
        return { html: 'Conteúdo insuficiente encontrado na página. Por favor, preencha manualmente os diferenciais.' };
      }

      return { html: content };
    } catch (error: any) {
      console.error('Scraper Error:', error.message);
      return { html: 'Não foi possível ler o conteúdo do site devido a restrições de acesso (bloqueio de bot). Por favor, preencha os benefícios manualmente.' };
    }
  }
);

const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { schema: ExtractBenefitsInputSchema },
  output: { schema: ExtractBenefitsOutputSchema },
  tools: [fetchRawContent],
  prompt: `Você é um Diretor de Estratégia de Marketing de Elite. 
Sua missão é ler o conteúdo extraído do site: {{{url}}} e criar uma lista de argumentos de venda IRRESISTÍVEIS.

Utilize a ferramenta 'fetchRawContent' para obter os dados do site.

FOCO DA ANÁLISE:
1. Extraia os benefícios mais impactantes, diferenciais técnicos, proposta de valor exclusiva e a estética emocional do produto.
2. Ignore menus, avisos legais e rodapés. Foque no que faz o cliente desejar o produto.
3. Transforme características técnicas em benefícios visuais poderosos para um anúncio comercial de luxo.

REQUISITOS:
- Responda em PORTUGUÊS do Brasil.
- O texto deve ser persuasivo, direto e ideal para um Diretor de Arte usar como base para um comercial viral.
- Se o conteúdo do site estiver inacessível ou vazio, responda pedindo ao usuário para preencher manualmente.`,
});

export async function extractBenefits(input: { url: string }) {
  const { output } = await extractBenefitsPrompt(input);
  return output!;
}
