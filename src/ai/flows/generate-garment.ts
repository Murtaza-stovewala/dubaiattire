'use server';
/**
 * @fileOverview A flow to generate a garment from a fabric swatch.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateGarmentInputSchema = z.object({
  garmentType: z.string().describe('The type of garment to generate (e.g., "Kurta", "Blazer").'),
  fabricDataUrl: z.string().describe("A photo of the fabric, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export const GenerateGarmentOutputSchema = z.object({
    garmentDataUrl: z.string().describe("The generated garment image as a transparent PNG data URI.")
});

export type GenerateGarmentInput = z.infer<typeof GenerateGarmentInputSchema>;


const generateGarmentPrompt = ai.definePrompt({
    name: 'generateGarmentPrompt',
    input: { schema: GenerateGarmentInputSchema },
    output: { schema: GenerateGarmentOutputSchema },
    prompt: `You are an expert fashion designer's assistant. Your task is to generate a photorealistic image of a single garment.

    Instructions:
    1.  Create a men's {{garmentType}}.
    2.  Use the exact texture and color from the provided fabric image.
    3.  The garment should be displayed flat, front-facing, as if on a mannequin or for a product catalog.
    4.  **Crucially, the output image MUST have a transparent background.**
    5.  Do not include any people, models, or body parts in the image. Only the garment.

    Fabric Image: {{media url=fabricDataUrl}}`,
    config: {
        temperature: 0.4,
    }
});


export async function generateGarment(input: GenerateGarmentInput) {
    const llmResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: [
            {text: generateGarmentPrompt.prompt},
            {media: {url: input.fabricDataUrl}}
        ],
        // The structured output approach seems less reliable for pure image-gen,
        // so we handle the image response directly.
    });

    const imageData = llmResponse.media();
    if (!imageData || !imageData.url) {
        throw new Error('AI did not return an image.');
    }
    
    return {
        garmentDataUrl: imageData.url
    };
}
