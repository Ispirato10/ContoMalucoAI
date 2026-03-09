'use server';
/**
 * @fileOverview Fluxo Genkit para extrair benefícios de produtos a partir de uma URL.
 * 
 * - extractBenefits - Analisa o site e retorna os diferenciais e benefícios de marketing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const ExtractBenefitsOutputSchema = z.object({
  benefits: z.string().describe('Lista de benefícios e diferenciais extraídos do site.'),
});

const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { 
    schema: z.object({
      url: z.string(),
      content: z.string()
    })
  },
  output: { schema: ExtractBenefitsOutputSchema },
  prompt: `Você é um Estrategista de Marketing de Alta Performance.
Sua missão é extrair os DIFERENCIAIS e BENEFÍCIOS REAIS do produto a partir do conteúdo do site {{{url}}}.

CONTEÚDO DO SITE:
{{{content}}}

DIRETRIZES:
1. Identifique o que torna este produto único (tecnologia, exclusividade, economia, etc).
2. Transforme características técnicas em argumentos poderosos para um comercial de elite.
3. Responda em PORTUGUÊS (Brasil) de forma direta e persuasiva.
4. Se o conteúdo for insuficiente ou protegido, sugira preenchimento manual de forma elegante.`,
});

/**
 * Função principal exportada para o componente AdGenerator
 */
export async function extractBenefits(input: { url: string }): Promise<{ benefits: string }> {
  try {
    const { url } = input;
    
    // 1. Tentar buscar o conteúdo do site
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return { benefits: "Não foi possível acessar o site. Por favor, descreva os diferenciais manualmente." };
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Limpar o HTML para a IA
    $('script, style, nav, footer, header, iframe, noscript, svg, form').remove();
    const pageTitle = $('title').text() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    const cleanContent = `Título: ${pageTitle}\nDescrição: ${metaDesc}\nConteúdo: ${bodyText}`.substring(0, 6000);
    
    if (cleanContent.length < 100) {
      return { benefits: "O site parece estar protegido contra leitura automática. Por favor, descreva os diferenciais manualmente." };
    }

    // 2. Chamar a IA para transformar o texto em argumentos de venda
    const { output } = await extractBenefitsPrompt({
      url,
      content: cleanContent
    });

    if (!output || !output.benefits) {
      return { benefits: "Diferenciais não identificados. Por favor, descreva-os manualmente." };
    }

    return { benefits: output.benefits };
    
  } catch (error: any) {
    console.error('Erro no fluxo de extração:', error);
    return { benefits: "Erro na análise da IA. Por favor, descreva os diferenciais manualmente." };
  }
}
