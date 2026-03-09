'use server';
/**
 * @fileOverview Fluxo robusto para extrair benefícios de produtos a partir de uma URL.
 * 
 * - extractBenefits - Busca o conteúdo do site e usa IA para identificar diferenciais de marketing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const ExtractBenefitsOutputSchema = z.object({
  benefits: z.string().describe('Lista de diferenciais e benefícios extraídos.'),
});

/**
 * Função principal para extração de benefícios.
 * Executa o scraping e a análise de IA em um único passo para maior estabilidade.
 */
export async function extractBenefits(input: { url: string }): Promise<{ benefits: string }> {
  try {
    const { url } = input;
    
    // 1. Scraping do conteúdo do site
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return { benefits: "Erro: Não foi possível acessar o site. Verifique o link ou descreva os benefícios manualmente." };
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Limpeza profunda do HTML para focar no conteúdo de marketing
    $('script, style, nav, footer, header, iframe, noscript, svg, form, ads').remove();
    const pageTitle = $('title').text() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    const cleanContent = `Título da Página: ${pageTitle}\nDescrição Meta: ${metaDesc}\nConteúdo Principal: ${bodyText}`.substring(0, 10000);
    
    if (cleanContent.length < 50) {
      return { benefits: "Conteúdo insuficiente no site. Por favor, descreva os diferenciais do produto manualmente." };
    }

    // 2. Análise direta com o modelo Gemini
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Você é um Estrategista de Marketing de Elite.
Analise o conteúdo abaixo extraído de um site de produto (URL: ${url}) e identifique os 3 a 5 principais diferenciais e benefícios reais para o consumidor.

CONTEÚDO DO SITE:
${cleanContent}

DIRETRIZES:
1. Transforme características técnicas em argumentos de venda poderosos.
2. Seja persuasivo e use uma linguagem de marketing de alta conversão.
3. Responda em Português do Brasil.
4. Foque no que torna o produto único.`,
      output: { schema: ExtractBenefitsOutputSchema }
    });

    if (!output || !output.benefits) {
      return { benefits: "A IA não conseguiu identificar benefícios claros neste link. Tente descrevê-los manualmente." };
    }

    return { benefits: output.benefits };
    
  } catch (error: any) {
    console.error('Erro na análise de benefícios:', error);
    return { benefits: "Erro técnico na análise da IA. Por favor, descreva os diferenciais manualmente." };
  }
}
