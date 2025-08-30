'use server';

/**
 * @fileOverview A simple flow to get AI feedback on a generated outfit.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RateOutfitInputSchema = z.object({
    imageUrl: z.string().describe("A data URI of the generated try-on image."),
    prompt: z.string().optional().describe("An optional custom prompt for the AI.")
});

const RateOutfitOutputSchema = z.object({
    feedback: z.string().describe("The AI's feedback on the outfit.")
});

export async function rateOutfit(input: z.infer<typeof RateOutfitInputSchema>): Promise<z.infer<typeof RateOutfitOutputSchema>> {
    return rateOutfitFlow(input);
}

const rateOutfitFlow = ai.defineFlow({
    name: 'rateOutfitFlow',
    inputSchema: RateOutfitInputSchema,
    outputSchema: RateOutfitOutputSchema,
}, async (input) => {

    const prompt = input.prompt ?? `You are a world-class fashion critic for a royal clientele. Look at the image of the person wearing the outfit. Provide brief, constructive feedback. Is it a good fit? Does it look luxurious? What could be improved?`;

    const llmResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: [
            {text: prompt},
            {media: {url: input.imageUrl}}
        ],
    });

    return {
        feedback: llmResponse.text,
    }
});
