'use server';
/**
 * @fileOverview Fluxo Genkit para transformar respostas aleatórias em uma história de gibi.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryInputSchema = z.object({
  answers: z.array(z.string()).describe('Lista de respostas dadas pelos jogadores.'),
});

const StoryOutputSchema = z.object({
  title: z.string().describe('Um título engraçado para a história.'),
  fullStory: z.string().describe('A narrativa completa entrelaçando as respostas.'),
  imagePrompt: z.string().describe('Prompt em inglês para gerar uma ilustração estilo Gibi da cena principal.'),
});

export type StoryOutput = z.infer<typeof StoryOutputSchema>;

export async function generateCrazyStory(input: { answers: string[] }): Promise<StoryOutput> {
  const { output } = await ai.generate({
    model: 'gemini-1.5-flash',
    prompt: `Você é um roteirista de gibis brasileiros experiente.
Transforme estas respostas aleatórias (dadas às cegas) em uma história curta de gibi MUITO engraçada.

RESPOSTAS:
${input.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

DIRETRIZES:
1. Use as respostas na ordem, criando pontes absurdas entre elas.
2. Estilo "Turma da Mônica" ou "Ziraldo" moderno.
3. Idioma: Português do Brasil.
4. Gere um prompt em INGLÊS para gerar a imagem dessa cena. O prompt de imagem NÃO deve conter textos, apenas a descrição visual da cena absurda.`,
    output: { schema: StoryOutputSchema }
  });

  if (!output) throw new Error('Falha ao gerar a história maluca.');
  return output;
}
