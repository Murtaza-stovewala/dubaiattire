'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Camera, Loader2, Wand2 } from 'lucide-react';
import { virtualTrial } from '@/ai/flows/virtual-trial';
import { useToast } from "@/hooks/use-toast"

export default function VirtualTrialClient({ product }: { product: Product }) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getClothingDataUri = async (url: string): Promise<string> => {
    // This proxy is a workaround for CORS issues when fetching images from a different origin on the client-side.
    // In a real-world scenario, you might use a server-side proxy or ensure images are served from the same domain.
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url.replace('https://', ''))}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleVirtualTrial = async () => {
    if (!userImage) {
      toast({
          title: "No User Image",
          description: "Please upload a photo of yourself first.",
          variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResultImage(null);

    try {
      const clothingDataUri = await getClothingDataUri(product.imageSrc);

      const result = await virtualTrial({
        photoDataUri: userImage,
        clothingDataUri: clothingDataUri,
      });
      
      if (result.overlayedImage) {
        setResultImage(result.overlayedImage);
      } else {
        throw new Error("The AI model did not return an image.");
      }
    } catch (error) {
      console.error('Virtual trial failed:', error);
      toast({
          title: "Virtual Trial Failed",
          description: "Could not generate the virtual try-on. Please try a different image or check the console for errors.",
          variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Virtual Trial Room</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
          See how <span className="text-primary font-semibold">{product.name}</span> looks on you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Step 1: Your Attire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border">
              <Image
                src={product.imageSrc}
                alt={product.name}
                data-ai-hint={product.imageHint}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="font-headline text-2xl">{product.name}</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Step 2: Try It On</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center justify-center space-y-4 p-4 border-2 border-dashed rounded-lg h-full">
              {userImage ? (
                <div className="relative aspect-[3/4] w-full">
                   <Image src={userImage} alt="User upload" fill className="object-contain" />
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Camera className="mx-auto h-12 w-12" />
                  <p className="mt-2">Upload or take a photo</p>
                </div>
              )}
              <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              <Button asChild variant="outline" className="w-full">
                  <label htmlFor="imageUpload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                  </label>
              </Button>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4 p-4 border-2 border-dashed rounded-lg h-full aspect-[3/4]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-12 w-12 animate-spin text-accent" />
                        <p className="mt-4">Applying the outfit...</p>
                        <p className="text-sm">This may take a moment.</p>
                    </div>
                ) : resultImage ? (
                    <div className="relative w-full h-full">
                        <Image src={resultImage} alt="Virtual trial result" fill className="object-contain" />
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                         <Wand2 className="mx-auto h-12 w-12" />
                         <p className="mt-2">Your virtual look will appear here</p>
                    </div>
                )}
            </div>
          </CardContent>
          <div className="p-6 pt-0">
             <Button onClick={handleVirtualTrial} disabled={isLoading || !userImage} className="w-full" size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                ) : (
                    <>
                        <Wand2 className="mr-2 h-4 w-4" /> Start Virtual Trial
                    </>
                )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
