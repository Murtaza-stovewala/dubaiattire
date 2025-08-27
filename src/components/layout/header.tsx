"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';

const Header = () => {
  const navLinks = [
    { name: 'Collection', href: '#collection' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Gem className="h-6 w-6 text-accent" />
          <span className="font-headline text-2xl font-bold text-primary">Dubai Royal Attire</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="transition-colors hover:text-accent font-medium">
                {link.name}
            </Link>
          ))}
        </nav>
        <Button asChild>
          <Link href="#collection">
            Virtual Trial
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;
