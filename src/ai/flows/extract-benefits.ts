'use server';
/**
 * @fileOverview Fluxo ultra-robusto para extração de benefícios de produtos via URL.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

export async function extractBenefits(input: { url: string }): Promise<{ benefits: string }> {
  try {
    const { url } = input;
    
    // 1. Scraping com cabeçalhos realistas
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      return { benefits: `Acesso bloqueado pelo site (${response.status}). Descreva os diferenciais manualmente.` };
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Limpeza profunda
    $('script, style, nav, footer, header, iframe, noscript, svg, form, ads, .ads, .popup, [role="complementary"]').remove();
    
    const pageTitle = $('title').text() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1Text = $('h1').first().text() || '';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    const context = `Título: ${pageTitle}\nDescrição: ${metaDesc}\nPrincipal: ${h1Text}\nConteúdo: ${bodyText}`.substring(0, 5000);
    
    if (context.length < 30) {
      return { benefits: "Conteúdo insuficiente no link. Por favor, descreva os benefícios manualmente." };
    }

    // 2. Análise com IA usando o modelo configurado no genkit.ts
    const { output } = await ai.generate({
      prompt: `Você é um Estrategista de Marketing de Luxo. 
Analise o conteúdo abaixo de um site e extraia os 3 a 5 principais benefícios reais e diferenciais competitivos do produto.

REQUISITOS:
- Use bullet points.
- Linguagem persuasiva, luxuosa e elegante.
- Responda em Português do Brasil.

CONTEÚDO DO SITE:
${context}`,
      output: { 
        schema: z.object({
          benefits: z.string()
        })
      }
    });

    return { 
      benefits: output?.benefits || "Não foi possível identificar benefícios claros. Descreva-os manualmente." 
    };
    
  } catch (error: any) {
    console.error('Erro na extração de benefícios:', error);
    return { 
      benefits: "Erro técnico na análise. Por favor, descreva os diferenciais do produto manualmente." 
    };
  }
}
