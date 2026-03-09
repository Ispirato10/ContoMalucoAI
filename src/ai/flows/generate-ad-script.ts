'use server';
/**
 * @fileOverview Gera um BRIEFING MAESTRO de elite para criação de anúncios comerciais.
 * 
 * Este fluxo realiza uma análise profunda do produto (via URL ou manual), funde temas visuais
 * com eventos sazonais e gera um script técnico detalhado para o ChatGPT/DALL-E criar
 * anúncios virais, elegantes e altamente informativos.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const GenerateAdScriptInputSchema = z.object({
  productName: z.string().describe('Nome do produto.'),
  productUrl: z.string().url().optional().describe('URL do produto para extração de benefícios e DNA da marca.'),
  theme: z.string().describe('Estilo visual (ex: Luxo, Cyberpunk).'),
  platform: z.string().describe('Plataforma (Instagram, TikTok, etc.).'),
  couponCode: z.string().optional().describe('Cupom de desconto para figurar no anúncio.'),
  promoText: z.string().optional().describe('Texto da oferta ou promoção principal.'),
  targetWebsite: z.string().optional().describe('Website oficial para exibição na peça.'),
  eventDate: z.string().optional().describe('Evento ou data comemorativa escolhida.'),
  productBenefits: z.string().optional().describe('Benefícios inseridos manualmente pelo usuário.'),
});

export type GenerateAdScriptInput = z.infer<typeof GenerateAdScriptInputSchema>;

const GenerateAdScriptOutputSchema = z.object({
  campaignBriefing: z.object({
    dallePrompt: z.string().describe('O prompt mestre em inglês para DALL-E 3, focado em "Commercial Product Advertisement".'),
    chatGptInstructions: z.string().describe('Instruções estratégicas sobre como a IA deve integrar o produto real no cenário.'),
    copywriting: z.object({
      headline: z.string().describe('Título viral de alto impacto.'),
      description: z.string().describe('Legenda informativa e persuasiva.'),
      callToAction: z.string().describe('CTA clara e direta.'),
    }),
    technicalDetails: z.object({
      aspectRatio: z.string(),
      lightingStyle: z.string(),
      compositionStrategy: z.string().describe('Como os benefícios do produto são visualizados.'),
    }),
    campaignData: z.object({
      includedPromo: z.string(),
      includedCoupon: z.string(),
      includedWebsite: z.string(),
      extractedBenefits: z.string(),
    })
  }),
});

export type GenerateAdScriptOutput = z.infer<typeof GenerateAdScriptOutputSchema>;

const fetchProductDetails = ai.defineTool(
  {
    name: 'fetchProductDetails',
    description: 'Acessa o site do produto para extrair benefícios "matadores", diferenciais técnicos e a voz da marca.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.object({ content: z.string() }),
  },
  async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Limpar tags irrelevantes
      $('script, style, nav, footer, header, iframe').remove();
      
      const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 8000);
      return { content };
    } catch (error) {
      return { content: 'Falha ao acessar o site. Use os benefícios manuais.' };
    }
  }
);

const generateAdScriptInternal = ai.definePrompt({
  name: 'generateAdScriptPrompt',
  input: {schema: GenerateAdScriptInputSchema},
  output: {schema: GenerateAdScriptOutputSchema},
  tools: [fetchProductDetails],
  prompt: `Você é um Diretor de Arte e Estrategista Criativo de Agências de Luxo em Nova York.
Sua missão é criar um "BRIEFING MAESTRO" para um Anúncio Comercial Viral e Elegante.

DADOS DA CAMPANHA:
- Produto Principal: {{{productName}}}
- URL de Referência: {{{productUrl}}}
- Estilo Visual: {{{theme}}}
- Plataforma: {{{platform}}}
- Cupom de Desconto: {{{couponCode}}}
- Texto da Oferta: {{{promoText}}}
- Website na Imagem: {{{targetWebsite}}}
- Evento/Data: {{{eventDate}}}
- Benefícios Manuais: {{{productBenefits}}}

{{#if productUrl}}
PROCEDIMENTO OBRIGATÓRIO: Use 'fetchProductDetails' para minerar o site. Identifique os 3 benefícios mais fortes e a proposta de valor exclusiva. NÃO IGNORE O CONTEÚDO DO SITE.
{{/if}}

DIRETRIZES CRIATIVAS (NÃO SEJA MINIMALISTA):
1. ESTÉTICA: Crie algo "Elegante, Atraente e Cinematográfico". Pense em anúncios da Apple, Rolex ou marcas de luxo automotivas.
2. INTEGRAÇÃO DE EVENTO: Se houver um evento (ex: Natal), o cenário DEVE respirar esse evento de forma sofisticada e luxuosa.
3. VISUALIZAÇÃO DE BENEFÍCIOS: Transforme os benefícios (extraídos do site ou manuais) em elementos visuais concretos. Se for "potente", use raios de luz; se for "natural", use elementos orgânicos reais.
4. INFRAESTRUTURA DE ANÚNCIO: Use o termo "High-end Commercial Product Advertisement" e "Professional Studio Lighting".
5. TODAS AS INFOS: O prompt DALL-E deve descrever onde o Cupom, o Texto da Promo e o Site devem aparecer (como elementos de design ou tipografia integrada).

SAÍDA:
- dallePrompt: Em INGLÊS, ultra-detalhado, descrevendo a fusão entre {{{theme}}} e {{{eventDate}}}.
- copywriting: Em PORTUGUÊS, focado em viralizar e informar.

Gere o briefing completo agora.`,
});

export async function generateAdScript(input: GenerateAdScriptInput): Promise<GenerateAdScriptOutput> {
  const {output} = await generateAdScriptInternal(input);
  return output!;
}
