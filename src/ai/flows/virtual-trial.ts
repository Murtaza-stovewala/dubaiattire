'use server';

/**
 * @fileOverview Implements flows for virtual trial: background removal and clothing overlay.
 *
 * - removeBackground - Removes the background from a user's photo.
 * - virtualTrial - Overlays a clothing item onto a user's photo (ideally with background removed).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import axios from 'axios';
import FormData from 'form-data';

// Schema for background removal
const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the user, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  cutoutImage: z
    .string()
    .describe(
      'The user photo with the background removed, as a data URI with a transparent background (PNG).'
    ),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;


// Schema for virtual trial overlay
const VirtualTrialInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A cutout photo of the user with a transparent background, as a data URI. Format: 'data:image/png;base64,<encoded_data>'."
    ),
  materialDataUri: z
    .string()
    .describe(
      "A photo of the material or fabric, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  clothingType: z.enum(['Blazer', 'Kurta']).describe('The type of clothing to generate.')
});
export type VirtualTrialInput = z.infer<typeof VirtualTrialInputSchema>;

const VirtualTrialOutputSchema = z.object({
  overlayedImage: z
    .string()
    .describe(
      'The resulting image with the clothing realistically overlayed on the user, as a data URI.'
    ),
});
export type VirtualTrialOutput = z.infer<typeof VirtualTrialOutputSchema>;


// Exported functions that components can call
export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

export async function virtualTrial(input: VirtualTrialInput): Promise<VirtualTrialOutput> {
  return virtualTrialFlow(input);
}


// Flow for background removal using remove.bg API
const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async ({ photoDataUri }) => {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      throw new Error('REMOVE_BG_API_KEY is not configured.');
    }

    // Extract base64 data and create a buffer
    const base64Data = photoDataUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const formData = new FormData();
    formData.append('image_file', imageBuffer, { filename: 'user_image.jpg' });
    formData.append('size', 'auto');

    try {
      const response = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'X-Api-Key': apiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      const resultBuffer = Buffer.from(response.data);
      const resultDataUri = `data:image/png;base64,${resultBuffer.toString('base64')}`;

      return { cutoutImage: resultDataUri };

    } catch (error: any) {
        console.error('Error calling remove.bg API:', error.response?.data?.toString());
        throw new Error(`Failed to remove background: ${error.message}`);
    }
  }
);


// Genkit prompt and flow for virtual trial
const virtualTrialPrompt = ai.definePrompt({
  name: 'virtualTrialPrompt',
  input: {schema: VirtualTrialInputSchema},
  output: {schema: VirtualTrialOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an AI fashion stylist and designer. Your goal is to create a piece of clothing from a given material and realistically place it onto a person's image.

The user has provided a cutout image of themselves and an image of a fabric/material.
- Analyze the person's posture and body shape.
- Analyze the material's texture, pattern, and color.
- Generate a high-fashion, well-fitted {{clothingType}} for the person using the provided material.
- Overlay the generated {{clothingType}} onto the person. The fit should be natural and realistic, accounting for folds, shadows, and the person's pose.
- The final output should be a single, merged image of the person wearing the new clothing on a transparent background.

User Cutout Photo: {{media url=photoDataUri}}
Material/Fabric Photo: {{media url=materialDataUri}}

Output ONLY the final, merged image as a data URI.
`,
});

const virtualTrialFlow = ai.defineFlow(
  {
    name: 'virtualTrialFlow',
    inputSchema: VirtualTrialInputSchema,
    outputSchema: VirtualTrialOutputSchema,
  },
  async input => {
    const {output} = await virtualTrialPrompt(input);
    return output!;
  }
);