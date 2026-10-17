import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { ProductGallery } from './components/ProductGallery';
import { ProductHero } from './components/ProductHero';
import { FeatureSection } from './components/FeatureSection';
import { CapacitySection } from './components/CapacitySection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { PolicyModal, PolicyType } from './components/PolicyModal';
import { NotificationToast } from './components/NotificationToast';
import { OrderConfirmation } from './components/OrderConfirmation';

export const AppContent: React.FC = () => {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);
  const [isOrderConfirmation, setIsOrderConfirmation] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('order-confirmation') || search.includes('session_id=')) {
      setIsOrderConfirmation(true);
    }
  }, []);

  if (isOrderConfirmation) {
    return <OrderConfirmation />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#14334D] flex flex-col selection:bg-[#3898D5] selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Main Scenic Hero Showcase Section */}
        <section id="shop" className="px-3 sm:px-6 lg:px-8 pt-4 pb-12">
          <div 
            className="max-w-[1320px] mx-auto rounded-[32px] sm:rounded-[44px] overflow-hidden relative shadow-2xl border-4 sm:border-8 border-white bg-cover bg-center min-h-[700px] flex flex-col justify-between py-10 sm:py-14 px-4 sm:px-8 lg:px-12"
            style={{ backgroundImage: `url('/images/hero-landscape.jpg')` }}
          >
            {/* Top Editorial Headline directly matching 4th image */}
            <div className="text-center max-w-2xl mx-auto space-y-1 mb-8 sm:mb-12 pt-2">
              <p className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal drop-shadow-[0_2px_12px_rgba(10,35,60,0.6)] tracking-wide">
                Pack with calm.
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white font-normal tracking-tight drop-shadow-[0_4px_20px_rgba(10,35,60,0.65)]">
                <span className="italic font-serif">Serein</span> Organizer
              </h1>
              <p className="text-white text-sm sm:text-base lg:text-lg max-w-lg mx-auto font-medium drop-shadow-[0_2px_10px_rgba(10,35,60,0.7)] pt-2 leading-relaxed">
                Dual-tier compartments and compression design engineered to bring clarity and order to your carry-on luggage.
              </p>
            </div>

            {/* Main Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto w-full">
              <ProductGallery />
              <ProductHero />
            </div>
          </div>
        </section>

        {/* Feature Narrative Section ("Pack with less digging") */}
        <FeatureSection />

        {/* Approximate Capacity Section ("What fits inside") */}
        <CapacitySection />
      </main>

      {/* Store Footer */}
      <Footer onOpenPolicy={(policy) => setActivePolicy(policy)} />

      {/* Interactive Cart Drawer */}
      <CartDrawer />

      {/* Policy Modal Dialog */}
      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />

      {/* Added to Bag Toast Notification */}
      <NotificationToast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};

export default App;
