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
 * Função auxiliar para buscar e limpar conteúdo de uma URL de forma robusta
 */
async function scrapeProductPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return '';
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Capturar metadados que geralmente contêm os benefícios principais
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const pageTitle = $('title').text() || '';
    
    // Remover elementos irrelevantes para economizar tokens e tempo
    $('script, style, nav, footer, header, iframe, noscript, svg, form, head, .ads, .popup, #footer, #header, .menu, .nav, button').remove();
    
    // Capturar o texto principal de forma mais agressiva
    const bodyContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 8000);
    
    return `
      Site: ${url}
      Título: ${pageTitle}
      Resumo: ${metaDescription || ogDescription}
      Conteúdo Relevante: ${bodyContent}
    `.substring(0, 10000);
  } catch (error: any) {
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
  prompt: `Você é um Estrategista de Marketing de Alta Performance.
Sua missão é extrair os DIFERENCIAIS e BENEFÍCIOS REAIS do produto a partir do conteúdo do site {{{url}}}.

CONTEÚDO DO SITE:
{{{pageContent}}}

DIRETRIZES:
1. Se o conteúdo for insuficiente, peça educadamente para o usuário descrever manualmente.
2. Foque em benefícios emocionais e técnicos que vendem (conforto, tecnologia, exclusividade, economia).
3. Transforme características técnicas em argumentos poderosos para um comercial de elite.
4. Responda em PORTUGUÊS (Brasil) de forma direta e persuasiva.`,
});

export async function extractBenefits(input: { url: string }) {
  try {
    const pageContent = await scrapeProductPage(input.url);
    
    if (!pageContent || pageContent.length < 50) {
      return { benefits: "O site bloqueou o acesso automático ou está vazio. Por favor, descreva os diferenciais aqui." };
    }

    const { output } = await extractBenefitsPrompt({
      url: input.url,
      pageContent
    });

    if (!output || !output.benefits) {
      return { benefits: "A IA não conseguiu identificar benefícios claros. Por favor, descreva manualmente." };
    }

    return output;
  } catch (error: any) {
    return { benefits: "Erro técnico na análise. Por favor, tente novamente em instantes ou descreva manualmente." };
  }
}
