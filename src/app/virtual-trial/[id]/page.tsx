import { products } from '@/lib/products';
import VirtualTrialClient from '@/components/virtual-trial-client';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { notFound } from 'next/navigation';

export default function VirtualTrialPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <VirtualTrialClient product={product} />
      </main>
      <Footer />
    </div>
  );
}
