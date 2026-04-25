'use server';
/**
 * @fileOverview Fluxo Genkit para transformar respostas em um GIBI TEXTUAL ESTRUTURADO.
 * Utiliza o Gemini 2.5 Flash para narrativas de alto impacto.
 */

import {ai} from '@/ai/genkit';
import {genkit, z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const StoryPageSchema = z.object({
  text: z.string().describe('O texto/narração desta página ou painel.'),
});

const StoryOutputSchema = z.object({
  title: z.string().describe('Um título bombástico, engraçado e chamativo para o gibi.'),
  pages: z.array(StoryPageSchema).describe('Lista de páginas do gibi (mínimo 3, máximo 5).'),
});

export type StoryOutput = z.infer<typeof StoryOutputSchema>;

export async function generateCrazyStory(input: { answers: string[], userApiKey?: string }): Promise<StoryOutput> {
  const currentAi = input.userApiKey && input.userApiKey.startsWith('AI')
    ? genkit({ plugins: [googleAI({ apiKey: input.userApiKey })] })
    : ai;

  const { output } = await currentAi.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Você é um mestre roteirista de gibis brasileiros (estilo Turma da Mônica ou quadrinhos de humor).
Sua missão é transformar estas respostas dadas às cegas em um GIBI TEXTUAL COMPLETO de 3 a 5 páginas.

RESPOSTAS COLETADAS:
${input.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

DIRETRIZES:
1. TÍTULO: Crie um título extremamente engraçado, bizarro e que use elementos das respostas.
2. NARRATIVA: Use as respostas para criar uma história absurda, com começo, meio e fim.
3. ESTRUTURA: Divida em 3 a 5 partes (páginas). Cada parte deve ter um texto narrativo impactante ou diálogos engraçados.
4. ESTILO: Comédia pastelão brasileira.`,
    output: { schema: StoryOutputSchema }
  });

  if (!output) throw new Error('A IA não conseguiu processar tamanha loucura!');
  return output;
}
