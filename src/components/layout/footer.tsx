
import { Gem } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
                <Gem className="h-8 w-8 text-accent" />
                <h2 className="font-headline text-3xl font-bold">Dubai Royal Attire</h2>
            </Link>
            <div className="mt-8 md:mt-0 text-center md:text-right text-primary-foreground/50">
                <p>&copy; {new Date().getFullYear()} Dubai Royal Attire. All Rights Reserved.</p>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
