'use server';
/**
 * @fileOverview Fluxo Genkit para transformar respostas aleatórias em uma história de gibi.
 * Utiliza o Gemini 2.0 Flash para máxima criatividade e velocidade.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryInputSchema = z.object({
  answers: z.array(z.string()).describe('Lista de respostas dadas pelos jogadores.'),
});

const StoryOutputSchema = z.object({
  title: z.string().describe('Um título engraçado e chamativo para a história.'),
  fullStory: z.string().describe('A narrativa completa entrelaçando as respostas de forma absurda.'),
  imagePrompt: z.string().describe('Prompt detalhado em inglês para gerar uma ilustração estilo Gibi da cena principal.'),
});

export type StoryOutput = z.infer<typeof StoryOutputSchema>;

export async function generateCrazyStory(input: { answers: string[] }): Promise<StoryOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-001',
    prompt: `Você é um roteirista de gibis brasileiros clássicos (estilo Maurício de Sousa ou Ziraldo).
Sua missão é transformar estas respostas dadas às cegas em uma história curto de gibi MUITO engraçada e absurda.

RESPOSTAS COLETADAS:
${input.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

DIRETRIZES:
1. Use as respostas na ordem exata em que aparecem, criando pontes narrativas malucas entre elas.
2. O tom deve ser de comédia pastelão, típica de gibis infantis brasileiros.
3. Idioma: Português do Brasil (PT-BR).
4. O prompt de imagem deve ser em INGLÊS, descrevendo a cena mais bizarra da história em estilo "vibrant comic book illustration, clean lines, professional digital art, no text".`,
    output: { schema: StoryOutputSchema }
  });

  if (!output) throw new Error('A IA não conseguiu processar tamanha loucura!');
  return output;
}
