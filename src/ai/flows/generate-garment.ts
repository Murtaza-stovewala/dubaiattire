'use server';
/**
 * @fileOverview A flow to generate a garment from a fabric swatch.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input and Output types are defined in the client component
// to avoid exporting non-async functions from a 'use server' file.
import type { GenerateGarmentInput } from '@/components/virtual-trial-client';

const generateGarmentPrompt = `You are an expert fashion designer's assistant. Your task is to generate a photorealistic image of a single garment.

    Instructions:
    1.  Create a men's {{garmentType}}.
    2.  Use the exact texture and color from the provided fabric image.
    3.  The garment should be displayed flat, front-facing, as if on a mannequin or for a product catalog.
    4.  **Crucially, the output image MUST have a transparent background.**
    5.  Do not include any people, models, or body parts in the image. Only the garment.

    Fabric Image: {{media url=fabricDataUrl}}`;


export async function generateGarment(input: GenerateGarmentInput) {
    const llmResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: [
            {text: generateGarmentPrompt},
            {media: {url: input.fabricDataUrl}}
        ],
         config: {
            temperature: 0.4,
        }
    });
    
    const imagePart = llmResponse.output?.message.parts.find(p => p.media);

    if (!imagePart || !imagePart.media?.url) {
        throw new Error('AI did not return an image.');
    }
    
    return {
        garmentDataUrl: imagePart.media.url
    };
}
