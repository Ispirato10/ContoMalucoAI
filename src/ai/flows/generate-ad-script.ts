'use server';
/**
 * @fileOverview Gera um BRIEFING MAESTRO de elite para criação de anúncios comerciais de alto impacto.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    dallePrompt: z.string().describe('O prompt mestre em inglês para geradores de imagem.'),
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
  config: {
    model: 'googleai/gemini-1.5-flash',
  },
  prompt: `Você é um Diretor de Arte Criativo de Agências de Publicidade Globais de Elite. 
Sua missão é criar um BRIEFING MAESTRO para uma IMAGEM DE COMERCIAL DE PRODUTO de impacto viral e luxo extremo.

DADOS DA CAMPANHA:
- Produto: {{{productName}}}
- Estilo Visual: {{{theme}}}
- Evento/Data: {{{eventDate}}}
- Oferta: {{{promoText}}} | Cupom: {{{couponCode}}}
- Site: {{{targetWebsite}}}
- Benefícios Técnicos: {{{productBenefits}}}
- Plataforma: {{{platform}}}

DIRETRIZES DE CRIAÇÃO (PROIBIDO SER MINIMALISTA):
1. ESTÉTICA COMERCIAL: O anúncio deve ser "Elegante, Atraente, Luxuoso e Visualmente Rico". Fuja do básico.
2. FUSÃO CINEMATOGRÁFICA: O cenário DEVE fundir profundamente o evento {{{eventDate}}} com o estilo visual {{{theme}}}.
3. PROMPT MAESTRO (INGLÊS): Descreva uma cena de "High-end Professional Product Commercial". Use iluminação dramática, texturas 8k, e integre o Nome do Produto, o Cupom e o Site como elementos de design integrados e premium.
4. VISUALIZAÇÃO DE BENEFÍCIOS: Transforme "{{{productBenefits}}}" em elementos visuais concretos no cenário.

SAÍDA:
- dallePrompt: Prompt mestre ultra-detalhado em INGLÊS focado em "Professional Product Commercial Advertisement".
- copywriting: Textos em PORTUGUÊS (Brasil) focados em vendas persuasivas.`,
});

export async function generateAdScript(input: GenerateAdScriptInput): Promise<GenerateAdScriptOutput> {
  const {output} = await generateAdScriptInternal(input);
  return output!;
}
