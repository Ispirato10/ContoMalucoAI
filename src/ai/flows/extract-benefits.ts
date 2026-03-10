'use server';
/**
 * @fileOverview Fluxo ultra-robusto para extração de benefícios de produtos via URL.
 * 
 * - extractBenefits - Captura o conteúdo do site e usa IA para identificar diferenciais.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

export async function extractBenefits(input: { url: string }): Promise<{ benefits: string }> {
  try {
    const { url } = input;
    
    // 1. Scraping com cabeçalhos realistas para evitar bloqueios
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      return { benefits: `O site bloqueou o acesso (Erro ${response.status}). Por favor, descreva os diferenciais manualmente.` };
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Limpeza profunda para focar no conteúdo de marketing
    $('script, style, nav, footer, header, iframe, noscript, svg, form, ads, .ads, .popup, [role="complementary"]').remove();
    
    const pageTitle = $('title').text() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1Text = $('h1').map((i, el) => $(el).text()).get().join(' ');
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    const context = `Título: ${pageTitle}\nDesc: ${metaDesc}\nHeadlines: ${h1Text}\nConteúdo: ${bodyText}`.substring(0, 6000);
    
    if (context.length < 50) {
      return { benefits: "Conteúdo insuficiente detectado no link. Descreva os diferenciais manualmente." };
    }

    // 2. Análise com Gemini 1.5 Flash usando o identificador mais compatível
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Você é um Estrategista de Marketing de Elite. 
Analise o conteúdo abaixo extraído de um site de vendas e extraia os 3 a 5 principais diferenciais competitivos e benefícios reais do produto para um anúncio publicitário de luxo.

REQUISITOS:
- Use bullet points.
- Linguagem persuasiva e luxuosa.
- Responda em Português do Brasil.

CONTEÚDO DO SITE:
${context}`,
      output: { 
        schema: z.object({
          benefits: z.string()
        })
      }
    });

    if (!output || !output.benefits) {
      return { benefits: "A IA não conseguiu identificar benefícios claros. Descreva-os manualmente." };
    }

    return { benefits: output.benefits };
    
  } catch (error: any) {
    console.error('Erro na extração:', error);
    return { benefits: `Instabilidade na análise automática. Por favor, descreva os benefícios do produto manualmente.` };
  }
}
