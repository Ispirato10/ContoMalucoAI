'use server';
/**
 * @fileOverview Gera um BRIEFING MAESTRO de elite para criação de anúncios comerciais.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as cheerio from 'cheerio';

const GenerateAdScriptInputSchema = z.object({
  productName: z.string().describe('Nome do produto.'),
  productUrl: z.string().url().optional().describe('URL do produto.'),
  theme: z.string().describe('Estilo visual.'),
  platform: z.string().describe('Plataforma.'),
  couponCode: z.string().optional().describe('Cupom de desconto.'),
  promoText: z.string().optional().describe('Texto da oferta.'),
  targetWebsite: z.string().optional().describe('Website oficial.'),
  eventDate: z.string().optional().describe('Evento ou data comemorativa.'),
  productBenefits: z.string().optional().describe('Benefícios do produto.'),
});

export type GenerateAdScriptInput = z.infer<typeof GenerateAdScriptInputSchema>;

const GenerateAdScriptOutputSchema = z.object({
  campaignBriefing: z.object({
    dallePrompt: z.string().describe('O prompt mestre em inglês para DALL-E 3.'),
    chatGptInstructions: z.string().describe('Instruções estratégicas.'),
    copywriting: z.object({
      headline: z.string().describe('Título viral.'),
      description: z.string().describe('Legenda persuasiva.'),
      callToAction: z.string().describe('CTA.'),
    }),
    technicalDetails: z.object({
      aspectRatio: z.string(),
      lightingStyle: z.string(),
      compositionStrategy: z.string(),
    })
  }),
});

export type GenerateAdScriptOutput = z.infer<typeof GenerateAdScriptOutputSchema>;

const generateAdScriptInternal = ai.definePrompt({
  name: 'generateAdScriptPrompt',
  input: {schema: GenerateAdScriptInputSchema},
  output: {schema: GenerateAdScriptOutputSchema},
  prompt: `Você é um Diretor de Arte de Agências de Luxo. Crie um BRIEFING MAESTRO para uma IMAGEM DE COMERCIAL DE PRODUTO de alto impacto.

DADOS:
- Produto: {{{productName}}}
- Estilo: {{{theme}}}
- Evento/Data: {{{eventDate}}}
- Promo: {{{promoText}}} | Cupom: {{{couponCode}}}
- Benefícios: {{{productBenefits}}}

REQUISITOS CRÍTICOS:
1. NÃO SEJA MINIMALISTA. O anúncio deve ser "Elegante, Atraente, Cinematográfico e Luxuoso".
2. TEMA DE DATA COMEMORATIVA: O cenário DEVE respirar o evento {{{eventDate}}} de forma profunda e criativa, fundindo-o com o estilo {{{theme}}}.
3. PROMPT DALL-E (EM INGLÊS): Descreva uma "High-end Commercial Product Advertisement". Use iluminação dramática de estúdio, texturas 8k, e integre o Nome do Produto, o Cupom e o Site como elementos de design premium.
4. BENEFÍCIOS VISUAIS: Os benefícios "{{{productBenefits}}}" devem ser transformados em elementos visuais concretos (ex: se for tecnologia, use circuitos de luz; se for conforto, use texturas macias).
5. O anúncio deve ser viral, atrativo e altamente informativo.

SAÍDA:
- dallePrompt: Prompt ultra-detalhado em INGLÊS.
- copywriting: Textos em PORTUGUÊS focados em vendas.`,
});

export async function generateAdScript(input: GenerateAdScriptInput): Promise<GenerateAdScriptOutput> {
  const {output} = await generateAdScriptInternal(input);
  return output!;
}
