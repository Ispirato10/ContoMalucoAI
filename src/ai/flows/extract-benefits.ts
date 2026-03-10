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
    
    // 1. Scraping com cabeçalhos realistas e timeout curto
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10000) // Timeout de 10 segundos para a requisição HTTP
    });
    
    if (!response.ok) {
      return { benefits: "Acesso ao site restrito. Por favor, descreva os diferenciais do produto manualmente." };
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Limpeza agressiva do HTML para focar apenas no marketing
    $('script, style, nav, footer, header, iframe, noscript, svg, form, .ads, .popup').remove();
    
    const pageTitle = $('title').text() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1Text = $('h1').first().text() || '';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Pegar apenas os primeiros 3000 caracteres para evitar estourar limites e agilizar a IA
    const context = `Produto: ${h1Text}\nMeta: ${pageTitle} - ${metaDesc}\nConteúdo: ${bodyText}`.substring(0, 3000);
    
    if (context.length < 50) {
      return { benefits: "Não encontramos informações suficientes no link. Descreva os diferenciais manualmente." };
    }

    // 2. Análise com IA usando o modelo mais estável
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Você é um Estrategista de Marketing. 
Analise o conteúdo abaixo de um site e extraia os 3 principais benefícios reais e diferenciais do produto.

REQUISITOS:
- Use bullet points simples.
- Linguagem persuasiva e elegante.
- Responda em Português do Brasil.

CONTEÚDO:
${context}`,
      output: { 
        schema: z.object({
          benefits: z.string()
        })
      }
    });

    return { 
      benefits: output?.benefits || "Não foi possível resumir os benefícios. Tente preencher manualmente." 
    };
    
  } catch (error: any) {
    console.error('Erro na extração de benefícios:', error);
    return { 
      benefits: "Erro na conexão com a IA. Por favor, descreva os benefícios manualmente para prosseguir." 
    };
  }
}
