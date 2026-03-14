'use server';
/**
 * @fileOverview Extrator de Inteligência de Marca e Produto.
 * Interpreta profundamente o site para entender a essência do negócio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { load } from 'cheerio';

const ExtractBenefitsOutputSchema = z.object({
  benefits: z.string().describe('Principais diferenciais persuasivos em bullet points.'),
  productName: z.string().describe('Nome comercial do produto.'),
  brandVibe: z.string().describe('A "vibe" da marca (ex: Futurista, Luxo Silencioso, Orgânico).'),
  targetAudience: z.string().describe('Público-alvo principal.'),
});

export async function extractBenefits(input: { url: string }): Promise<z.infer<typeof ExtractBenefitsOutputSchema>> {
  try {
    const response = await fetch(input.url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error('Acesso negado pelo site.');
    
    const html = await response.text();
    const $ = load(html);
    
    // Limpeza profunda para focar no marketing
    $('script, style, nav, footer, header, iframe, noscript, .cookie-banner').remove();
    const title = $('title').text();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const mainText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 6000);

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Aja como um Estrategista de Marketing Digital de Elite. 
Analise os dados deste site e extraia a essência para um anúncio publicitário.
Identifique o nome do produto, os 3 benefícios mais "irresistíveis", a estética visual da marca e quem é o comprador ideal.

DADOS:
Título: ${title}
Descrição: ${metaDesc}
Conteúdo: ${mainText}`,
      output: { schema: ExtractBenefitsOutputSchema }
    });

    if (!output) throw new Error('Erro na análise da IA.');
    return output;
  } catch (error) {
    console.error('Extraction Error:', error);
    return { 
      benefits: "Descreva os benefícios do seu produto manualmente.", 
      productName: "",
      brandVibe: "Comercial Padrão",
      targetAudience: "Consumidor Geral"
    };
  }
}
