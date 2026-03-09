'use server';
/**
 * @fileOverview Fluxo Genkit para extrair diferenciais de produtos a partir de uma URL.
 * 
 * - extractBenefits - Analisa o site e retorna os diferenciais e benefícios de marketing.
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

/**
 * Função auxiliar para buscar e limpar conteúdo de uma URL
 */
async function scrapeProductPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Capturar Metadados
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const pageTitle = $('title').text() || '';
    
    // Limpeza profunda
    $('script, style, nav, footer, header, iframe, noscript, svg, form, head, .ads, .popup, #footer, #header, .menu, .nav').remove();
    
    // Capturar texto relevante (primeiros 15k caracteres para não estourar o contexto)
    const bodyContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);
    
    return `
      Título: ${pageTitle}
      Meta Descrição: ${metaDescription}
      OG Descrição: ${ogDescription}
      Conteúdo: ${bodyContent}
    `.substring(0, 18000);
  } catch (error: any) {
    console.error('Scraper error:', error.message);
    return '';
  }
}

/**
 * Prompt Maestro para extração de benefícios
 */
const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { 
    schema: z.object({
      url: z.string(),
      pageContent: z.string()
    })
  },
  output: { schema: ExtractBenefitsOutputSchema },
  prompt: `Você é um Estrategista de Marketing de Elite.
Sua missão é ler o conteúdo extraído do site {{{url}}} e identificar os BENEFÍCIOS e DIFERENCIAIS reais do produto para um comercial de luxo.

CONTEÚDO DO SITE:
{{{pageContent}}}

DIRETRIZES:
1. Se o conteúdo estiver vazio ou indicar erro, peça para o usuário descrever manualmente.
2. Foque em benefícios que podem ser VISUALIZADOS em um comercial (texturas, tecnologia, status, conforto).
3. Transforme características técnicas em argumentos de venda poderosos.
4. Responda de forma direta e persuasiva em PORTUGUÊS (Brasil).`,
});

export async function extractBenefits(input: { url: string }) {
  try {
    // 1. Scrape manual (mais robusto que via tool em alguns casos de rede)
    const pageContent = await scrapeProductPage(input.url);
    
    if (!pageContent || pageContent.length < 50) {
      return { benefits: "Não foi possível extrair automaticamente. Por favor, descreva os diferenciais aqui." };
    }

    // 2. Chamar a IA com o contexto já capturado
    const { output } = await extractBenefitsPrompt({
      url: input.url,
      pageContent
    });

    if (!output) {
      return { benefits: "IA não gerou resposta. Por favor, descreva manualmente." };
    }

    return output;
  } catch (error: any) {
    console.error('Extract Benefits Error:', error.message);
    return { benefits: "Erro na conexão com a IA. Por favor, tente novamente ou descreva manualmente." };
  }
}
