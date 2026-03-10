'use server';
/**
 * @fileOverview Fluxo ultra-robusto para extração de benefícios de produtos via URL.
 * Otimizado para evitar erros de análise de IA e timeouts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { load } from 'cheerio';

export async function extractBenefits(input: { url: string }): Promise<{ benefits: string }> {
  try {
    const { url } = input;
    
    // 1. Scraping robusto com limpeza agressiva
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8000) // Timeout de 8 segundos para a requisição HTTP
    });
    
    if (!response.ok) {
      return { benefits: "O site bloqueou o acesso automático. Descreva os diferenciais manualmente." };
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Remove elementos irrelevantes para diminuir o payload da IA
    $('script, style, nav, footer, header, iframe, noscript, svg, form').remove();
    
    const pageTitle = $('title').text() || '';
    const h1Text = $('h1').first().text() || '';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000);
    
    const context = `Título: ${pageTitle}\nProduto: ${h1Text}\nConteúdo: ${bodyText}`;
    
    if (context.length < 50) {
      return { benefits: "Conteúdo insuficiente no link. Por favor, descreva os diferenciais manualmente." };
    }

    // 2. Análise com IA usando o modelo mais estável e rápido
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Aja como um Estrategista de Marketing Digital. 
Analise o conteúdo abaixo e extraia os 3 principais benefícios reais de luxo do produto.

REQUISITOS:
- Use bullet points.
- Linguagem persuasiva e elegante (Português Brasil).
- Foque em exclusividade e qualidade.

CONTEÚDO:
${context}`,
      output: { 
        schema: z.object({
          benefits: z.string()
        })
      }
    });

    return { 
      benefits: output?.benefits || "Não foi possível extrair benefícios. Descreva os diferenciais manualmente." 
    };
    
  } catch (error: any) {
    console.error('Erro na extração de benefícios:', error);
    return { 
      benefits: "Instabilidade temporária na análise. Descreva os diferenciais do seu produto manualmente para prosseguir." 
    };
  }
}
