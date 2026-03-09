'use server';
/**
 * @fileOverview Fluxo Genkit para extrair diferenciais de produtos a partir de uma URL.
 * 
 * - extractBenefits - Analisa o site e retorna os diferenciais e benefícios de marketing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const ExtractBenefitsInputSchema = z.object({
  url: z.string().url().describe('A URL da página do produto.'),
});

const ExtractBenefitsOutputSchema = z.object({
  benefits: z.string().describe('Lista de benefícios e diferenciais extraídos do site.'),
});

/**
 * Função auxiliar para buscar conteúdo de uma URL
 */
async function scrapeProductPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) return '';
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remover elementos irrelevantes
    $('script, style, nav, footer, header, iframe, noscript, svg, form').remove();
    
    // Capturar o texto principal
    const pageTitle = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    return `Título: ${pageTitle}\nDescrição: ${metaDescription}\nConteúdo: ${bodyText}`.substring(0, 10000);
  } catch (error) {
    console.error('Erro no scraper:', error);
    return '';
  }
}

const extractBenefitsPrompt = ai.definePrompt({
  name: 'extractBenefitsPrompt',
  input: { 
    schema: z.object({
      url: z.string(),
      pageContent: z.string()
    })
  },
  output: { schema: ExtractBenefitsOutputSchema },
  prompt: `Você é um Estrategista de Marketing de Alta Performance.
Sua missão é extrair os DIFERENCIAIS e BENEFÍCIOS REAIS do produto a partir do conteúdo do site {{{url}}}.

CONTEÚDO DO SITE:
{{{pageContent}}}

DIRETRIZES:
1. Identifique o que torna este produto único (conforto, tecnologia, exclusividade, economia).
2. Transforme características técnicas em argumentos poderosos para um comercial de elite.
3. Responda em PORTUGUÊS (Brasil) de forma direta e persuasiva.
4. Se o conteúdo for insuficiente, retorne uma mensagem sugerindo descrição manual.`,
});

const extractBenefitsFlow = ai.defineFlow(
  {
    name: 'extractBenefitsFlow',
    inputSchema: ExtractBenefitsInputSchema,
    outputSchema: ExtractBenefitsOutputSchema,
  },
  async (input) => {
    const pageContent = await scrapeProductPage(input.url);
    
    if (!pageContent || pageContent.length < 100) {
      return { benefits: "O site bloqueou o acesso automático ou possui pouco conteúdo. Por favor, descreva os diferenciais manualmente." };
    }

    const { output } = await extractBenefitsPrompt({
      url: input.url,
      pageContent
    });

    if (!output || !output.benefits) {
      return { benefits: "Não foi possível extrair benefícios claros. Por favor, descreva manualmente." };
    }

    return output;
  }
);

export async function extractBenefits(input: { url: string }): Promise<{ benefits: string }> {
  try {
    return await extractBenefitsFlow(input);
  } catch (error: any) {
    console.error('Erro no fluxo extractBenefits:', error);
    return { benefits: "Erro na análise da IA. Por favor, tente descrever os diferenciais manualmente." };
  }
}
