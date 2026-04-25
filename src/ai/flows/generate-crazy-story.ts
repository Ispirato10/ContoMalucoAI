'use server';
/**
 * @fileOverview Fluxo Genkit para transformar respostas em um GIBI ESTRUTURADO.
 * Utiliza o Gemini 2.5 Flash para narrativas de alto impacto e divisão em painéis.
 */

import {ai} from '@/ai/genkit';
import {genkit, z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const StoryPageSchema = z.object({
  text: z.string().describe('O texto/narração desta página ou painel.'),
  visualPrompt: z.string().describe('Um prompt detalhado em inglês para gerar a imagem deste painel.'),
});

const StoryOutputSchema = z.object({
  title: z.string().describe('Um título engraçado e chamativo para o gibi.'),
  pages: z.array(StoryPageSchema).describe('Lista de páginas do gibi (mínimo 3, máximo 5).'),
});

export type StoryOutput = z.infer<typeof StoryOutputSchema>;

export async function generateCrazyStory(input: { answers: string[], userApiKey?: string }): Promise<StoryOutput> {
  const currentAi = input.userApiKey && input.userApiKey.startsWith('AI')
    ? genkit({ plugins: [googleAI({ apiKey: input.userApiKey })] })
    : ai;

  const { output } = await currentAi.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Você é um mestre roteirista de gibis brasileiros (estilo Turma da Mônica).
Sua missão é transformar estas respostas dadas às cegas em um GIBI COMPLETO de 3 a 5 páginas.

RESPOSTAS COLETADAS:
${input.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

DIRETRIZES:
1. Use as respostas para criar uma narrativa absurda e engraçada.
2. Divida a história em 3 a 5 páginas/painéis lógicos.
3. Para cada página, escreva o texto (PT-BR) e um 'visualPrompt' (EM INGLÊS) detalhado para uma IA de imagem desenhar a cena.
4. O 'visualPrompt' deve descrever o estilo 'colorful Brazilian comic book art, vibrant, professional ink' e a cena específica.
5. O tom deve ser comédia pastelão.`,
    output: { schema: StoryOutputSchema }
  });

  if (!output) throw new Error('A IA não conseguiu processar tamanha loucura!');
  return output;
}
