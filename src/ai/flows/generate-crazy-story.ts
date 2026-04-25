'use server';
/**
 * @fileOverview Fluxo Genkit para transformar respostas aleatórias em uma história de gibi escrita.
 * Utiliza o Gemini 2.5 Flash para máxima criatividade.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryInputSchema = z.object({
  answers: z.array(z.string()).describe('Lista de respostas dadas pelos jogadores.'),
});

const StoryOutputSchema = z.object({
  title: z.string().describe('Um título engraçado e chamativo para a história.'),
  fullStory: z.string().describe('A narrativa completa entrelaçando as respostas de forma absurda.'),
});

export type StoryOutput = z.infer<typeof StoryOutputSchema>;

export async function generateCrazyStory(input: { answers: string[] }): Promise<StoryOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Você é um roteirista de gibis brasileiros clássicos (estilo Maurício de Sousa ou Ziraldo).
Sua missão é transformar estas respostas dadas às cegas em uma história curta MUITO engraçada e absurda.

RESPOSTAS COLETADAS:
${input.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

DIRETRIZES:
1. Use as respostas na ordem exata em que aparecem, criando pontes narrativas malucas entre elas.
2. O tom deve ser de comédia pastelão, típica de gibis infantis brasileiros.
3. Idioma: Português do Brasil (PT-BR).
4. O texto deve ser formatado para ser lido como uma história completa.`,
    output: { schema: StoryOutputSchema }
  });

  if (!output) throw new Error('A IA não conseguiu processar tamanha loucura!');
  return output;
}
