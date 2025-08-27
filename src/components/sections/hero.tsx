import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-white">
      <Image
        src="https://picsum.photos/1800/1000"
        alt="Elegant men's fashion showcase"
        data-ai-hint="mens fashion"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-primary/70" />
      <div className="relative z-10 text-center p-4" data-aos="fade-up">
        <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold !text-white drop-shadow-lg">
          Where Royalty Meets Style
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/80 drop-shadow-md">
          Discover our exclusive collection of kurtas, blazers, and sherwanis, crafted for the modern monarch.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="#collection">Try It On Virtually</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Link href="#collection">Explore Collection</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
