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
  prompt: `Você é um Diretor de Arte Criativo de Agências de Publicidade Globais de Elite (Ogilvy/BBDO). 
Sua missão é criar um BRIEFING MAESTRO para uma IMAGEM DE COMERCIAL DE PRODUTO ("High-end Commercial Product Advertisement") de impacto viral.

DADOS DA CAMPANHA:
- Produto: {{{productName}}}
- Estilo Visual Escolhido: {{{theme}}}
- Evento/Data Comemorativa: {{{eventDate}}}
- Promoção Ativa: {{{promoText}}} | Cupom: {{{couponCode}}}
- Site Oficial: {{{targetWebsite}}}
- Diferenciais e Benefícios Técnicos: {{{productBenefits}}}
- Plataforma de Destino: {{{platform}}}

REQUISITOS OBRIGATÓRIOS DE DIREÇÃO DE ARTE:
1. NÃO SEJA MINIMALISTA. O anúncio deve ser "Elegante, Atraente, Luxuoso e Visualmente Rico". Fuja do básico e do vazio.
2. FUSÃO CRIATIVA OBRIGATÓRIA: O cenário DEVE fundir profundamente o evento {{{eventDate}}} com o estilo visual {{{theme}}}. Não apenas coloque elementos natalinos, crie uma atmosfera comercial cinematográfica completa.
3. PROMPT MAESTRO DALL-E (EM INGLÊS): Descreva uma cena de comercial de luxo. Use iluminação dramática (Cinematic Lighting), texturas ultra-detalhadas (8k), e integre o Nome do Produto, o Cupom e o Site como elementos de design integrados e premium na imagem. 
4. VISUALIZAÇÃO DE BENEFÍCIOS: Transforme os diferenciais "{{{productBenefits}}}" em elementos visuais concretos. Exemplo: se for tecnologia, use luzes neon e efeitos de velocidade; se for conforto, use tecidos luxuosos e iluminação suave.
5. OBJETIVO: Criar um anúncio comercial que seja ao mesmo tempo viral, informativo e extremamente atraente para o público.

O prompt mestre deve focar em como integrar o "attached product" (a foto que o usuário enviará ao ChatGPT) neste cenário comercial de elite de forma orgânica e profissional.

SAÍDA:
- dallePrompt: Prompt mestre ultra-detalhado em INGLÊS focado em "Professional Product Commercial".
- copywriting: Textos em PORTUGUÊS (Brasil) focados em vendas agressivas, elegantes e persuasivas.`,
});

export async function generateAdScript(input: GenerateAdScriptInput): Promise<GenerateAdScriptOutput> {
  const {output} = await generateAdScriptInternal(input);
  return output!;
}
