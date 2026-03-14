'use server';
/**
 * @fileOverview Extrator de Inteligência de Produto (Inspirado no PagePop).
 * Analisa o site profundamente para entender a marca e os benefícios.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { load } from 'cheerio';

const ExtractBenefitsOutputSchema = z.object({
  benefits: z.string().describe('3 a 5 diferenciais premium em bullet points.'),
  productName: z.string().describe('Nome comercial do produto.'),
  brandVibe: z.string().describe('Descrição curta da estética da marca (ex: Minimalista, Luxuosa, Tech).'),
});

export async function extractBenefits(input: { url: string }): Promise<z.infer<typeof ExtractBenefitsOutputSchema>> {
  try {
    const response = await fetch(input.url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error('O site bloqueou o acesso automático.');
    
    const html = await response.text();
    const $ = load(html);
    
    // Limpeza profunda para focar na semântica de venda
    $('script, style, nav, footer, header, iframe, noscript, svg, form, .cookie-banner').remove();
    const title = $('title').text();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const mainText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 8000);

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Aja como um Analista de Marketing Digital de Elite. 
Analise os dados extraídos deste site e identifique:
1. O Nome do Produto.
2. Os diferenciais mais atraentes para um anúncio (Premium/Luxo).
3. A "Vibe" visual da marca.

DADOS:
Título: ${title}
Descrição: ${metaDesc}
Conteúdo: ${mainText}`,
      output: { schema: ExtractBenefitsOutputSchema }
    });

    if (!output) throw new Error('A IA não conseguiu interpretar os dados.');
    return output;
  } catch (error) {
    console.error('Erro de Extração:', error);
    return { 
      benefits: "Não foi possível ler o site. Descreva os benefícios manualmente.", 
      productName: "",
      brandVibe: "Comercial Padrão"
    };
  }
}
