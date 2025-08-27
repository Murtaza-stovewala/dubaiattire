import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import Image from 'next/image';

const VirtualTrialCta = () => {
    return (
        <section className="bg-secondary py-16 sm:py-24">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                        <Image 
                            src="https://picsum.photos/800/450"
                            alt="Person using a virtual trial interface"
                            data-ai-hint="virtual try on"
                            fill
                            className="object-cover"
                        />
                         <div className="absolute inset-0 bg-primary/30" />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="font-headline text-4xl md:text-5xl font-bold">Try Before You Buy</h2>
                        <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
                            Not sure how it will look? Our groundbreaking virtual trial feature lets you see our collection on your own photo. It&apos;s the future of fashion, today.
                        </p>
                        <div className="mt-8">
                            <Button asChild size="lg">
                                <Link href="/virtual-trial">
                                    <Wand2 className="mr-2 h-5 w-5" />
                                    Launch Virtual Trial
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VirtualTrialCta;
