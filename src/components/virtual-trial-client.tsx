'use client';

import { useState, useRef } from 'react';
import { products } from '@/lib/products';
import type { Product } from '@/lib/products';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Camera, Loader2, Wand2, Scissors, Check, X } from 'lucide-react';
import { virtualTrial, removeBackground } from '@/ai/flows/virtual-trial';
import { useToast } from "@/hooks/use-toast"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type TrialStep = 'upload' | 'cutout' | 'select' | 'result';

export default function VirtualTrialClient() {
  const [step, setStep] = useState<TrialStep>('upload');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [cutoutImage, setCutoutImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
        setCutoutImage(null);
        setResultImage(null);
        setStep('upload'); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCutout = async () => {
    if (!userImage) {
      toast({
        title: "No User Image",
        description: "Please upload a photo of yourself first.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Removing background...');
    try {
      const result = await removeBackground({ photoDataUri: userImage });
      if (result.cutoutImage) {
        setCutoutImage(result.cutoutImage);
        setStep('cutout');
      } else {
        throw new Error("Failed to remove background.");
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      toast({
        title: "Background Removal Failed",
        description: "Could not process the image. Please try a different one.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getClothingDataUri = async (url: string): Promise<string> => {
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
    if (!cutoutImage || !selectedProduct) {
      toast({
          title: "Missing Information",
          description: "Please ensure you have a cutout and have selected a clothing item.",
          variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Applying the outfit...');
    setStep('result');

    try {
      const clothingDataUri = await getClothingDataUri(selectedProduct.imageSrc);

      const result = await virtualTrial({
        photoDataUri: cutoutImage,
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
          description: "Could not generate the virtual try-on. Please try again.",
          variant: "destructive",
      });
       setStep('select');
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setUserImage(null);
    setCutoutImage(null);
    setSelectedProduct(null);
    setResultImage(null);
    setStep('upload');
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const StepIndicator = ({ currentStep }: { currentStep: TrialStep }) => {
    const steps: {id: TrialStep, name: string}[] = [
        { id: 'upload', name: 'Upload Photo' },
        { id: 'cutout', name: 'Create Cutout' },
        { id: 'select', name: 'Select Attire' },
        { id: 'result', name: 'View Result' },
    ];
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="flex justify-between items-center mb-8">
            {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                           {index < currentStepIndex ? <Check size={16} /> : index + 1}
                        </div>
                        <p className={`mt-2 text-sm text-center ${index <= currentStepIndex ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s.name}</p>
                    </div>
                    {index < steps.length -1 && <div className={`flex-1 h-1 mx-2 ${index < currentStepIndex ? 'bg-primary' : 'bg-secondary'}`} />}
                </React.Fragment>
            ))}
        </div>
    );
  }


  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Virtual Trial Room</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
          Follow the steps to see how our collection looks on you.
        </p>
      </div>

        <Card>
            <CardContent className="p-6">
                <StepIndicator currentStep={step} />

                {step === 'upload' && (
                    <div className="text-center">
                        <CardHeader>
                            <CardTitle>Step 1: Upload Your Photo</CardTitle>
                            <CardDescription>For best results, use a clear, full-body photo with good lighting.</CardDescription>
                        </CardHeader>
                         <div className="flex flex-col items-center justify-center space-y-4 p-4 border-2 border-dashed rounded-lg h-96 my-4">
                            {userImage ? (
                                <div className="relative w-full h-full">
                                <Image src={userImage} alt="User upload" layout="fill" objectFit="contain" />
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                <Camera className="mx-auto h-12 w-12" />
                                <p className="mt-2">Your photo will appear here</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            ref={fileInputRef}
                            />
                        <Button asChild variant="outline" size="lg">
                            <label htmlFor="imageUpload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Photo
                            </label>
                        </Button>
                        {userImage && (
                            <Button onClick={handleGenerateCutout} disabled={isLoading} size="lg" className="ml-4">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scissors className="mr-2 h-4 w-4" />}
                                Create Cutout
                            </Button>
                        )}
                    </div>
                )}
                
                {step === 'cutout' && (
                    <div className="text-center">
                         <CardHeader>
                            <CardTitle>Step 2: Confirm Your Cutout</CardTitle>
                            <CardDescription>We&apos;ve removed the background. Does this look right?</CardDescription>
                        </CardHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                            <div className="space-y-2">
                                <p className="font-semibold">Original</p>
                                <div className="relative aspect-[3/4] w-full border rounded-lg overflow-hidden">
                                     {userImage && <Image src={userImage} alt="Original user" layout="fill" objectFit="contain" />}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold">Cutout</p>
                                <div className="relative aspect-[3/4] w-full border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                     {cutoutImage && <Image src={cutoutImage} alt="User cutout" layout="fill" objectFit="contain" />}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setStep('upload')}>
                            <X className="mr-2 h-4 w-4" /> Re-upload Photo
                        </Button>
                        <Button onClick={() => setStep('select')} className="ml-4">
                            <Check className="mr-2 h-4 w-4" /> Looks Good, Continue
                        </Button>
                    </div>
                )}
                
                {step === 'select' && (
                     <div>
                        <CardHeader className="text-center">
                            <CardTitle>Step 3: Select Your Attire</CardTitle>
                            <CardDescription>Choose an item from our collection to try on.</CardDescription>
                        </CardHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                             <div className="text-center space-y-4">
                                <div className="relative aspect-[3/4] w-full max-w-sm mx-auto border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    {cutoutImage && <Image src={cutoutImage} alt="User cutout for selection" layout="fill" objectFit="contain" />}
                                </div>
                                <Button variant="outline" onClick={() => setStep('cutout')}>Back to Cutout</Button>
                             </div>
                             <div>
                                <Carousel className="w-full">
                                <CarouselContent>
                                    {products.map((product) => (
                                    <CarouselItem key={product.id} className="basis-1/2">
                                        <div className="p-1">
                                        <Card 
                                            className={`cursor-pointer transition-all ${selectedProduct?.id === product.id ? 'ring-2 ring-primary' : ''}`}
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            <CardContent className="flex aspect-[3/4] items-center justify-center p-2 relative">
                                                <Image src={product.imageSrc} alt={product.name} layout="fill" objectFit="cover" className="rounded-md" />
                                            </CardContent>
                                        </Card>
                                        </div>
                                    </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                                </Carousel>

                                {selectedProduct && (
                                    <div className="mt-4 p-4 border rounded-lg">
                                        <h4 className="font-headline text-xl">{selectedProduct.name}</h4>
                                        <p className="text-muted-foreground text-sm">{selectedProduct.category}</p>
                                        <Button onClick={handleVirtualTrial} disabled={isLoading} className="w-full mt-4">
                                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                            Try this on
                                        </Button>
                                    </div>
                                )}
                             </div>
                        </div>
                     </div>
                )}
                
                {step === 'result' && (
                    <div className="text-center">
                        <CardHeader>
                            <CardTitle>Step 4: Your Virtual Look</CardTitle>
                            <CardDescription>Here is your personalized virtual trial result!</CardDescription>
                        </CardHeader>
                        <div className="relative aspect-[3/4] max-w-md mx-auto border rounded-lg overflow-hidden my-4">
                          {isLoading ? (
                            <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                                <Loader2 className="h-12 w-12 animate-spin text-accent" />
                                <p className="mt-4">{loadingMessage}</p>
                            </div>
                        ) : resultImage ? (
                            <Image src={resultImage} alt="Virtual trial result" layout="fill" objectFit="contain" />
                        ) : (
                             <Alert variant="destructive">
                                <AlertTitle>Generation Failed</AlertTitle>
                                <AlertDescription>
                                    Something went wrong. Please try again with a different selection or photo.
                                </AlertDescription>
                            </Alert>
                        )}
                        </div>
                         <Button variant="outline" onClick={reset}>
                            Start Over
                        </Button>
                         <Button onClick={() => setStep('select')} className="ml-4">
                            Try Another Outfit
                        </Button>
                    </div>
                )}

            </CardContent>
        </Card>

    </div>
  );
}
