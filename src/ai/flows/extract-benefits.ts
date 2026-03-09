
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
      // Usando cabeçalhos que mimetizam um navegador real para evitar bloqueios (403/401)
      const response = await fetch(input.url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Upgrade-Insecure-Requests': '1'
        },
        next: { revalidate: 3600 }
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao acessar o site: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remover elementos que poluem o contexto da IA
      $('script, style, nav, footer, header, iframe, noscript, svg, form, head, .ads, .popup, #footer, #header, .menu').remove();
      
      // Capturar apenas o texto visível e relevante
      // Focamos em áreas que geralmente contêm descrições de produtos
      const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);
      
      if (!content || content.length < 100) {
        return { html: 'Conteúdo insuficiente encontrado na página para análise automática.' };
      }

      return { html: content };
    } catch (error: any) {
      console.error('Scraper Error:', error.message);
      return { html: `Erro técnico ao acessar o site. Por favor, preencha os benefícios manualmente.` };
    }
  }
);

const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { schema: ExtractBenefitsInputSchema },
  output: { schema: ExtractBenefitsOutputSchema },
  tools: [fetchRawContent],
  prompt: `Você é um Estrategista de Marketing de Alta Performance.
Sua missão é ler o conteúdo do site {{{url}}} e extrair os BENEFÍCIOS e DIFERENCIAIS reais do produto.

Utilize a ferramenta 'fetchRawContent' para obter os dados do site.

DIRETRIZES:
1. Identifique o que torna este produto ÚNICO (tecnologia, material, praticidade, luxo, preço, etc).
2. Ignore menus, termos de uso e links de rodapé.
3. Transforme características técnicas em argumentos de venda poderosos.
4. Se o conteúdo retornado pela ferramenta indicar erro ou insuficiência, responda apenas: "Não foi possível extrair automaticamente. Por favor, descreva os benefícios abaixo."

Responda em PORTUGUÊS (Brasil) de forma direta e persuasiva.`,
});

export async function extractBenefits(input: { url: string }) {
  const { output } = await extractBenefitsPrompt(input);
  return output!;
}
