import { Gem, Mail, Phone, Pin, Bot } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
                <Gem className="h-8 w-8 text-accent" />
                <h2 className="font-headline text-3xl font-bold">Dubai Royal Attire</h2>
            </Link>
            <p className="text-primary-foreground/70">
              Experience the pinnacle of men&apos;s ethnic and Indo-western fashion. Unmatched craftsmanship, timeless style.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline text-2xl font-semibold text-accent">Visit Our Boutique</h3>
            <div className="flex items-start gap-3">
              <Pin className="h-5 w-5 mt-1 text-accent" />
              <p className="text-primary-foreground/70">123 Luxury Lane, The Dubai Mall, Dubai, UAE</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-accent" />
              <p className="text-primary-foreground/70">+971 4 123 4567</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-accent" />
              <p className="text-primary-foreground/70">contact@dubairoyalattire.com</p>
            </div>
             <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-accent" />
              <a href="https://wa.me/97141234567" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-accent transition-colors">
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="font-headline text-2xl font-semibold text-accent">Store Hours</h3>
             <p className="text-primary-foreground/70">Sunday - Thursday: 10am - 10pm</p>
             <p className="text-primary-foreground/70">Friday - Saturday: 10am - 12am</p>
             <div className="w-full h-40 bg-secondary rounded-lg mt-4">
                <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.178653925181!2d55.27633351500966!3d25.19720188389626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a67e24b%3A0x4523789a469b1da!2sThe%20Dubai%20Mall!5e0!3m2!1sen!2sae!4v1620658425173!5m2!1sen!2sae"
                    loading="lazy"
                    aria-label="Google map of Dubai Mall location"
                ></iframe>
             </div>
          </div>

        </div>
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Dubai Royal Attire. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
