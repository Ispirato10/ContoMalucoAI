'use server';
/**
 * @fileOverview Gera a ilustração estilo Gibi para a história.
 */

import {ai} from '@/ai/genkit';

export async function generateComicVisual(prompt: string): Promise<string> {
  // Adicionamos mais contexto ao prompt para garantir o estilo de gibi brasileiro
  const enhancedPrompt = `A vibrant comic book panel, professional digital illustration, bold ink outlines, dynamic composition, clean cel shading, style of classic Brazilian comics (Turma da Monica/Ziraldo inspiration but modern), high quality, storytelling focus. Scene: ${prompt}`;

  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-3',
      prompt: enhancedPrompt,
      config: {
        aspectRatio: '1:1',
      }
    });

    if (!media?.url) {
      throw new Error('No image URL returned from Imagen');
    }
    
    return media.url;
  } catch (error) {
    console.error('Erro na geração de imagem Genkit:', error);
    throw new Error('Falha técnica ao gerar o visual do gibi.');
  }
}