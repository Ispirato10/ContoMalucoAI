
'use server';
/**
 * @fileOverview Converte o texto da história em áudio usando Gemini TTS.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';
import wav from 'wav';

const GenerateStoryAudioInputSchema = z.object({
  text: z.string().describe('O texto completo da história para converter em áudio.'),
  userApiKey: z.string().optional().describe('Chave de API do usuário para bypass de cota.'),
});

export async function generateStoryAudio(input: { text: string, userApiKey?: string }): Promise<{ media: string }> {
  let currentAi = ai;
  
  if (input.userApiKey && input.userApiKey.trim().startsWith('AIza')) {
    currentAi = genkit({
      plugins: [googleAI({ apiKey: input.userApiKey.trim() })],
    });
  }

  const { media } = await currentAi.generate({
    model: googleAI.model('gemini-2.5-flash-preview-tts'),
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Algenib' },
        },
      },
    },
    prompt: input.text,
  });

  if (!media) {
    throw new Error('Não foi possível gerar a narração.');
  }

  const audioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );

  return {
    media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
  };
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
