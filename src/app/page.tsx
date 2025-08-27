import Header from '@/components/layout/header';
import Hero from '@/components/sections/hero';
import ProductShowcase from '@/components/sections/product-showcase';
import Testimonials from '@/components/sections/testimonials';
import InstagramFeed from '@/components/sections/instagram-feed';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductShowcase />
        <Testimonials />
        <InstagramFeed />
      </main>
      <Footer />
    </div>
  );
}
