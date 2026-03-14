'use server';
/**
 * @fileOverview Extrator de benefícios de elite via URL.
 * Analisa o conteúdo do site e extrai diferenciais de marketing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { load } from 'cheerio';

const ExtractBenefitsOutputSchema = z.object({
  benefits: z.string().describe('Lista de benefícios formatada em bullet points.'),
  productName: z.string().optional().describe('O nome do produto identificado na página.'),
});

export async function extractBenefits(input: { url: string }): Promise<z.infer<typeof ExtractBenefitsOutputSchema>> {
  try {
    const response = await fetch(input.url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error('Falha ao acessar o site.');
    
    const html = await response.text();
    const $ = load(html);
    
    // Limpeza pesada do HTML para focar no conteúdo de marketing
    $('script, style, nav, footer, header, iframe, noscript, svg, form').remove();
    const title = $('title').text();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const mainContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Aja como um Estrategista de Marketing de Luxo. 
Analise os dados extraídos do site abaixo e identifique o Nome do Produto e os 3 diferenciais exclusivos que mais atrairiam um cliente premium.

Título da Página: ${title}
Descrição Meta: ${metaDesc}
Conteúdo Principal: ${mainContent}`,
      output: { schema: ExtractBenefitsOutputSchema }
    });

    return output || { benefits: "Descreva manualmente os benefícios.", productName: "" };
  } catch (error) {
    console.error('Erro na extração:', error);
    return { benefits: "Não foi possível ler o site automaticamente. Descreva os diferenciais manualmente.", productName: "" };
  }
}
