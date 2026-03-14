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

export async function generateAdScript(input: GenerateAdScriptInput): Promise<GenerateAdScriptOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: `Você é um Diretor de Arte Criativo de Agências de Publicidade Globais de Elite. 
Sua missão é criar um BRIEFING MAESTRO para uma IMAGEM DE COMERCIAL DE PRODUTO de impacto viral e luxo extremo.

DADOS DA CAMPANHA:
- Produto: ${input.productName}
- Estilo Visual: ${input.theme}
- Evento Sazonal: ${input.eventDate || 'Padrão / Sem evento'}
- Oferta: ${input.promoText || 'Lançamento Exclusivo'}
- Site: ${input.targetWebsite || ''}
- Diferenciais do Produto: ${input.productBenefits || ''}
- Formato: ${input.platform}

DIRETRIZES DE CRIAÇÃO:
1. ESTÉTICA: O anúncio deve ser "Elegante, Atraente e Visualmente Rico". Fuja do minimalismo básico.
2. FUSÃO DE CENÁRIO: Integre o evento ${input.eventDate} com o estilo ${input.theme}. Ex: Se for Natal e Luxo, use elementos de ouro e neve cintilante.
3. PROMPT MAESTRO (INGLÊS): Descreva uma cena de "High-end Professional Product Commercial". Use iluminação dramática, texturas 8k, e foque na centralidade do produto.
4. COPYWRITING: Títulos curtos e impactantes em Português.`,
    output: { schema: GenerateAdScriptOutputSchema }
  });

  if (!output) throw new Error('Falha ao gerar o briefing da campanha.');
  return output;
}
