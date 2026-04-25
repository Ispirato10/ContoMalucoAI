'use server';
/**
 * @fileOverview Fluxo Genkit para transformar respostas em um GIBI TEXTUAL ESTRUTURADO.
 * Utiliza o Gemini 2.5 Flash para narrativas de alto impacto e títulos bizarros.
 */

import {ai} from '@/ai/genkit';
import {genkit, z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const StoryPageSchema = z.object({
  text: z.string().describe('O texto/narração desta página ou painel.'),
});

const StoryOutputSchema = z.object({
  title: z.string().describe('Um título bombástico, engraçado e bizarro para o gibi.'),
  pages: z.array(StoryPageSchema).describe('Lista de páginas do gibi (mínimo 3, máximo 5).'),
});

export type StoryOutput = z.infer<typeof StoryOutputSchema>;

export async function generateCrazyStory(input: { answers: string[], userApiKey?: string }): Promise<StoryOutput> {
  // Se o usuário forneceu uma chave válida, criamos uma instância TOTALMENTE ISOLADA do Genkit.
  // Isso garante que a cota do app não interfira na requisição do usuário.
  let currentAi = ai;
  
  if (input.userApiKey && input.userApiKey.trim().startsWith('AIza')) {
    currentAi = genkit({
      plugins: [googleAI({ apiKey: input.userApiKey.trim() })],
    });
  }

  const { output } = await currentAi.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Você é um mestre roteirista de gibis brasileiros lendário.
Sua missão é transformar estas respostas dadas "às cegas" em um GIBI TEXTUAL COMPLETO e inesquecível.

RESPOSTAS COLETADAS DO JOGADOR:
${input.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

REQUISITOS DE ELITE:
1. TÍTULO: Crie um título EXPLOSIVO, engraçado e levemente bizarro. O título deve ser a coisa mais chamativa do gibi.
2. NARRATIVA: Transforme as respostas em uma história coerente (mas absurda), com ritmo de quadrinhos.
3. ESTRUTURA: Divida em exatamente 3 a 5 páginas. Cada página deve ter um texto narrativo forte ou diálogos marcantes.
4. ESTILO: Humor brasileiro clássico, irreverente e vibrante.`,
    output: { schema: StoryOutputSchema }
  });

  if (!output) throw new Error('A IA não conseguiu processar tamanha loucura! Tente novamente.');
  return output;
}
