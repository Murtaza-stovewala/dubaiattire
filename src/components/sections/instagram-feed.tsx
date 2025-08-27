import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const instagramPosts = [
  { id: 1, src: 'https://picsum.photos/id/111/500/500', alt: 'Man in a stylish kurta', hint: 'man fashion' },
  { id: 2, src: 'https://picsum.photos/id/112/500/500', alt: 'Close up of blazer fabric', hint: 'fabric texture' },
  { id: 3, src: 'https://picsum.photos/id/113/500/500', alt: 'Groom in an elegant sherwani', hint: 'groom fashion' },
  { id: 4, src: 'https://picsum.photos/id/114/500/500', alt: 'Indo-western outfit details', hint: 'fashion detail' },
  { id: 5, src: 'https://picsum.photos/id/115/500/500', alt: 'Man posing in a festive outfit', hint: 'festive wear' },
  { id: 6, src: 'https://picsum.photos/id/116/500/500', alt: 'Royal Dubai Attire storefront', hint: 'storefront boutique' },
];

const InstagramFeed = () => {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Follow Our Journey</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            Get inspired by our latest collections and stories on Instagram.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <Link key={post.id} href="#" className="group block overflow-hidden aspect-square">
                <Image
                    src={post.src}
                    alt={post.alt}
                    data-ai-hint={post.hint}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                />
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                Follow @DubaiRoyalAttire
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
