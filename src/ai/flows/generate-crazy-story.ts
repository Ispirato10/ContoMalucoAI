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
    model: 'googleai/gemini-1.5-flash',
    prompt: `Você é um roteirista de gibis infantis brasileiros conhecido pelo humor absurdo e criatividade.
Sua tarefa é pegar uma lista de respostas aleatórias (que foram dadas sem os jogadores verem as perguntas) e transformá-las em uma história curta, coesa e MUITO engraçada.

RESPOSTAS DOS JOGADORES:
${input.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

DIRETRIZES:
1. Mantenha o tom de "brincadeira de criança".
2. Tente usar todas as respostas na ordem em que aparecem, criando pontes criativas entre elas.
3. O resultado deve ser em Português do Brasil.
4. Gere também um prompt em INGLÊS detalhado para uma IA de imagem (DALL-E/Imagen) criar uma ilustração dessa história no estilo "Classic Brazilian Comic Book Art" (estilo Turma da Mônica ou Ziraldo).`,
    output: { schema: StoryOutputSchema }
  });

  if (!output) throw new Error('Falha ao gerar a história maluca.');
  return output;
}