
import VirtualTrialClient from '@/components/virtual-trial-client';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <VirtualTrialClient />
      </main>
      <Footer />
    </div>
  );
}
