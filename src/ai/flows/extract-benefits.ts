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
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1'
        },
        next: { revalidate: 3600 }
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao acessar o site: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Capturar Metadados Críticos (frequentemente contêm os melhores benefícios)
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const ogDescription = $('meta[property="og:description"]').attr('content') || '';
      const pageTitle = $('title').text() || '';
      
      // Remover elementos que poluem o contexto da IA
      $('script, style, nav, footer, header, iframe, noscript, svg, form, head, .ads, .popup, #footer, #header, .menu').remove();
      
      // Capturar apenas o texto visível e relevante
      const bodyContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);
      
      const fullContext = `
        Título da Página: ${pageTitle}
        Descrição Meta: ${metaDescription}
        Descrição Social: ${ogDescription}
        Conteúdo Principal: ${bodyContent}
      `.substring(0, 18000);
      
      if (fullContext.length < 50) {
        return { html: 'Conteúdo insuficiente encontrado na página para análise automática.' };
      }

      return { html: fullContext };
    } catch (error: any) {
      console.error('Scraper Error:', error.message);
      return { html: `Erro técnico ao acessar o site: ${error.message}. O site pode estar bloqueando acessos automatizados.` };
    }
  }
);

const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { schema: ExtractBenefitsInputSchema },
  output: { schema: ExtractBenefitsOutputSchema },
  tools: [fetchRawContent],
  prompt: `Você é um Estrategista de Marketing de Alta Performance especializado em E-commerce e Copywriting.
Sua missão é analisar o site {{{url}}} e extrair os BENEFÍCIOS e DIFERENCIAIS competitivos do produto para um anúncio comercial.

Utilize OBRIGATORIAMENTE a ferramenta 'fetchRawContent' para obter os dados do site antes de responder.

DIRETRIZES DE ANÁLISE:
1. Identifique o que torna este produto único e desejável (tecnologia, material, status, praticidade, luxo, etc).
2. Transforme características técnicas frias em argumentos de venda poderosos e emocionais.
3. Se o conteúdo retornado pela ferramenta indicar erro ou for insuficiente, informe: "Não foi possível extrair automaticamente. Descreva os benefícios para um anúncio mais forte."
4. Foque em benefícios que podem ser VISUALIZADOS em um comercial de elite.

Responda em PORTUGUÊS (Brasil) de forma direta e persuasiva.`,
});

export async function extractBenefits(input: { url: string }) {
  try {
    const { output } = await extractBenefitsPrompt(input);
    if (!output) {
      return { benefits: "Não foi possível extrair benefícios automaticamente. Por favor, descreva-os manualmente." };
    }
    return output;
  } catch (error) {
    return { benefits: "Erro na conexão com a IA. Descreva os benefícios manualmente." };
  }
}
