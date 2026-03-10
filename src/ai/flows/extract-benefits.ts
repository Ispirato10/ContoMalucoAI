'use server';
/**
 * @fileOverview Fluxo robusto para extrair benefícios de produtos a partir de uma URL.
 * 
 * - extractBenefits - Busca o conteúdo do site e usa IA para identificar diferenciais de marketing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

/**
 * Função principal para extração de benefícios.
 * Executa o scraping e a análise de IA em um único passo para maior estabilidade.
 */
export async function extractBenefits(input: { url: string }): Promise<{ benefits: string }> {
  try {
    const { url } = input;
    
    // 1. Scraping do conteúdo do site com User-Agent real
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
    $('script, style, nav, footer, header, iframe, noscript, svg, form, ads, .ads, .popup').remove();
    
    const pageTitle = $('title').text() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1s = $('h1').map((i, el) => $(el).text()).get().join(' ');
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Combinar informações relevantes limitando o tamanho para evitar estouro de tokens
    const cleanContent = `Título: ${pageTitle}\nMeta Desc: ${metaDesc}\nHeadlines: ${h1s}\nConteúdo: ${bodyText}`.substring(0, 8000);
    
    if (cleanContent.length < 50) {
      return { benefits: "Conteúdo insuficiente detectado. Por favor, descreva os diferenciais manualmente." };
    }

    // 2. Análise direta com o modelo Gemini
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Você é um Estrategista de Marketing de Elite e Analista de Produtos.
Analise o conteúdo textual extraído de um site de vendas (URL: ${url}) e identifique os diferenciais competitivos e benefícios reais para o consumidor.

CONTEÚDO DO SITE:
${cleanContent}

DIRETRIZES DE SAÍDA:
1. Extraia de 3 a 5 pontos fortes (bullet points).
2. Transforme características em argumentos de venda emocionais e luxuosos.
3. Responda em Português do Brasil de forma direta.
4. Foque no que torna o produto único e atraente para um comercial de TV/Redes Sociais.`,
      output: { 
        schema: z.object({
          benefits: z.string()
        })
      }
    });

    if (!output || !output.benefits) {
      return { benefits: "A análise não retornou benefícios claros. Tente descrevê-los manualmente." };
    }

    return { benefits: output.benefits };
    
  } catch (error: any) {
    console.error('Erro na análise de benefícios:', error);
    return { benefits: "Ocorreu um erro técnico na análise. Por favor, descreva os diferenciais manualmente." };
  }
}
