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
    
    $('script, style, nav, footer, header, iframe').remove();
    const title = $('title').text();
    const mainContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 4000);

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Aja como um Estrategista de Marketing de Luxo. 
Analise o site abaixo e extraia os 3 principais diferenciais exclusivos do produto.
Retorne também o nome provável do produto.

SITE: ${title}
CONTEÚDO: ${mainContent}`,
      output: { schema: ExtractBenefitsOutputSchema }
    });

    return output || { benefits: "Descreva manualmente os benefícios.", productName: "" };
  } catch (error) {
    return { benefits: "Não foi possível ler o site automaticamente. Descreva os diferenciais manualmente.", productName: "" };
  }
}
