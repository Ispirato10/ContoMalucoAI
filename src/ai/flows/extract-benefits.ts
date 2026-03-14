'use server';
/**
 * @fileOverview Extrator de Inteligência de Marca e Produto.
 * Interpreta o site para entender o produto e o público-alvo.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { load } from 'cheerio';

const ExtractBenefitsOutputSchema = z.object({
  benefits: z.string().describe('Principais diferenciais persuasivos.'),
  productName: z.string().describe('Nome comercial do produto.'),
  brandVibe: z.string().describe('Estética da marca (ex: Luxo, Minimalista, Tech).'),
  targetAudience: z.string().describe('Quem é o comprador ideal.'),
});

export async function extractBenefits(input: { url: string }): Promise<z.infer<typeof ExtractBenefitsOutputSchema>> {
  try {
    const response = await fetch(input.url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error('Não foi possível acessar o site.');
    
    const html = await response.text();
    const $ = load(html);
    
    // Limpeza profunda de elementos ruidosos
    $('script, style, nav, footer, header, iframe, noscript, .cookie-banner, .popup').remove();
    const title = $('title').text();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const mainText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 4000);

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Aja como um Estrategista de Marketing de Elite. 
Analise os dados extraídos deste site e identifique a essência do produto para um anúncio publicitário de alto impacto.
Retorne o nome do produto, diferenciais persuasivos, a "vibe" da marca e o público-alvo compradores.

DADOS DO SITE:
Título: ${title}
Descrição: ${metaDesc}
Conteúdo: ${mainText}`,
      output: { schema: ExtractBenefitsOutputSchema }
    });

    if (!output) throw new Error('Falha na análise da IA.');
    return output;
  } catch (error: any) {
    console.error('Extraction Error:', error);
    return { 
      benefits: "Não conseguimos analisar o link. Por favor, descreva os benefícios manualmente para garantir a qualidade do anúncio.", 
      productName: "",
      brandVibe: "Comercial de Luxo",
      targetAudience: "Consumidor Premium"
    };
  }
}
