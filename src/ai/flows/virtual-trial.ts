// Virtual Trial Feature - Phased
// Phase 1 (Fast MVP)
// Upload photo OR open camera.
// Remove background -> show cutout.
// Select clothing -> overlay PNG on body.
// Manual drag/resize for alignment.

'use server';

/**
 * @fileOverview Implements the virtual trial flow for overlaying clothing on a user's image.
 *
 * - virtualTrial - The main function to initiate the virtual trial.
 * - VirtualTrialInput - Defines the input schema for the virtual trial, including user photo and clothing image.
 * - VirtualTrialOutput - Defines the output schema for the virtual trial, providing the resulting image with the overlay.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualTrialInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  clothingDataUri: z
    .string()
    .describe(
      'A photo of the clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type VirtualTrialInput = z.infer<typeof VirtualTrialInputSchema>;

const VirtualTrialOutputSchema = z.object({
  overlayedImage: z
    .string()
    .describe(
      'The resulting image with the clothing overlayed on the user, as a data URI with MIME type and Base64 encoding.'
    ),
});

export type VirtualTrialOutput = z.infer<typeof VirtualTrialOutputSchema>;

export async function virtualTrial(input: VirtualTrialInput): Promise<VirtualTrialOutput> {
  return virtualTrialFlow(input);
}

const virtualTrialPrompt = ai.definePrompt({
  name: 'virtualTrialPrompt',
  input: {schema: VirtualTrialInputSchema},
  output: {schema: VirtualTrialOutputSchema},
  prompt: `You are an AI assistant designed to overlay a clothing item onto a user's photo.

Given a user's photo and a clothing item photo, create an image showing the clothing item overlayed on the user.

User Photo: {{media url=photoDataUri}}
Clothing Item: {{media url=clothingDataUri}}

Output the overlayed image as a data URI.
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
