'use server';

/**
 * @fileOverview Implements flows for virtual trial: background removal and clothing overlay.
 *
 * - removeBackground - Removes the background from a user's photo.
 * - virtualTrial - Overlays a clothing item onto a user's photo (ideally with background removed).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  clothingDataUri: z
    .string()
    .describe(
      "A photo of the clothing item, as a data URI. It's better if this also has a transparent background. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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


// Genkit prompt and flow for background removal
const removeBackgroundPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: {schema: RemoveBackgroundInputSchema},
  output: {schema: RemoveBackgroundOutputSchema},
  prompt: `You are an expert image editor. Your task is to remove the background from the provided image of a person. 
  
The output should be an image of the person with a transparent background, suitable for overlaying on another image. Make the cutout clean and precise.

User Photo: {{media url=photoDataUri}}

Output the cutout image as a data URI.`,
});

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async input => {
    const {output} = await removeBackgroundPrompt(input);
    return output!;
  }
);


// Genkit prompt and flow for virtual trial
const virtualTrialPrompt = ai.definePrompt({
  name: 'virtualTrialPrompt',
  input: {schema: VirtualTrialInputSchema},
  output: {schema: VirtualTrialOutputSchema},
  prompt: `You are an AI fashion stylist. Your goal is to realistically place a clothing item onto a person's image.

The user has provided a cutout image of themselves and an image of a clothing item.
- Analyze the person's posture and body shape.
- Analyze the clothing item's style, drape, and size.
- Overlay the clothing item onto the person. The fit should be natural and realistic, accounting for folds, shadows, and the person's pose.
- The final output should be a single, merged image on a simple, neutral background.

User Cutout Photo: {{media url=photoDataUri}}
Clothing Item: {{media url=clothingDataUri}}

Output the final, merged image as a data URI.
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
