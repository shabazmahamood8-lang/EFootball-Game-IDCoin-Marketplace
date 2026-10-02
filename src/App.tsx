import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FootballIdCard } from './components/FootballIdCard';
import { CoinPackageCard } from './components/CoinPackageCard';
import { FootballIdDetailsModal } from './components/FootballIdDetailsModal';
import { CoinOrderModal } from './components/CoinOrderModal';
import { IdOrderModal } from './components/IdOrderModal';
import { WhyChooseUs } from './components/WhyChooseUs';
import { HowItWorks } from './components/HowItWorks';
import { ReviewsSection } from './components/ReviewsSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { FootballIdsView } from './components/FootballIdsView';
import { BuyCoinsView } from './components/BuyCoinsView';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { IFootballID, ICoinPackage, IReview, ISiteSettings } from './server/models/types.js';
import { ArrowRight, Coins, Shield, AlertCircle } from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [featuredIds, setFeaturedIds] = useState<IFootballID[]>([]);
  const [coinPackages, setCoinPackages] = useState<ICoinPackage[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // Selected modals
  const [selectedIdForDetail, setSelectedIdForDetail] = useState<IFootballID | null>(null);
  const [selectedIdForOrder, setSelectedIdForOrder] = useState<IFootballID | null>(null);
  const [selectedCoinForOrder, setSelectedCoinForOrder] = useState<ICoinPackage | null>(null);

  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  // Load initial public content from real database
  useEffect(() => {
    const loadData = async () => {
      try {
        setDbError(null);
        const [idsRes, coinsRes, reviewsRes, settingsRes] = await Promise.all([
          fetch('/api/ids?sort=featured'),
          fetch('/api/coins'),
          fetch('/api/reviews'),
          fetch('/api/settings'),
        ]);

        if (idsRes.ok) {
          const idsData = await idsRes.json();
          setFeaturedIds(idsData.ids || []);
        } else {
          const err = await idsRes.json().catch(() => ({}));
          setDbError(err.error || 'Failed to connect to database');
        }

        if (coinsRes.ok) {
          const coinsData = await coinsRes.json();
          setCoinPackages(coinsData.coinPackages || []);
        }

        if (reviewsRes.ok) {
          const revData = await reviewsRes.json();
          setReviews(revData.reviews || []);
        }

        if (settingsRes.ok) {
          const settData = await settingsRes.json();
          setSettings(settData.settings);
        }
      } catch (err) {
        console.warn('[Data Fetch Notice]:', err);
        setDbError('Could not reach backend API. Verify server and network connection.');
      }
    };

    loadData();
  }, []);

  const handleOrderSuccess = (_orderId: string) => {
    setCurrentTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyId = (item: IFootballID) => {
    if (!user) {
      showToast('Please login to purchase this Football ID', 'info');
      openAuthModal('login');
      return;
    }
    setSelectedIdForDetail(null);
    setSelectedIdForOrder(item);
  };

  const handleBuyCoins = (pkg: ICoinPackage) => {
    if (!user) {
      showToast('Please login to purchase game coins', 'info');
      openAuthModal('login');
      return;
    }
    setSelectedCoinForOrder(pkg);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {dbError && (
        <div className="bg-rose-950/80 border-b border-rose-500/30 px-4 py-2 text-xs text-rose-200 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{dbError}</span>
        </div>
      )}

      <main className="flex-1">
        {/* TAB: HOME */}
        {currentTab === 'home' && (
          <div className="space-y-0">
            {/* Hero Section */}
            <HeroSection
              onBrowseIds={() => {
                setCurrentTab('ids');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBuyCoins={() => {
                setCurrentTab('coins');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Featured Football IDs Section */}
            <section className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-950">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      FEATURED SQUADS
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      Top Verified Football IDs
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      High OVR dream teams, legendary booster cards, and clean Konami/EA login credentials.
                    </p>
                  </div>

                  {featuredIds.length > 0 && (
                    <button
                      onClick={() => {
                        setCurrentTab('ids');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 font-semibold group self-start sm:self-end"
                    >
                      <span>View all listings ({featuredIds.length})</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                {featuredIds.length === 0 ? (
                  <div className="py-12 text-center p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
                    <Shield className="w-10 h-10 text-neutral-600 mx-auto" />
                    <h3 className="text-base font-semibold text-white">No football IDs available yet.</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      Tournament squads will appear here as soon as they are listed in MongoDB.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredIds.slice(0, 3).map((item) => (
                      <FootballIdCard
                        key={item.id}
                        item={item}
                        onViewDetails={(selected) => setSelectedIdForDetail(selected)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Coin Packages Section */}
            <section className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-900/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" />
                      IN-GAME CURRENCY
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      Football Game Coin Packages
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      100% password-free server top-up using only your public Player ID.
                    </p>
                  </div>

                  {coinPackages.length > 0 && (
                    <button
                      onClick={() => {
                        setCurrentTab('coins');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 font-semibold group self-start sm:self-end"
                    >
                      <span>View all packages</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                {coinPackages.length === 0 ? (
                  <div className="py-12 text-center p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
                    <Coins className="w-10 h-10 text-neutral-600 mx-auto" />
                    <h3 className="text-base font-semibold text-white">No coin packages available yet.</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      Coin packages created by the administrator in MongoDB will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coinPackages.slice(0, 3).map((pkg) => (
                      <CoinPackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onBuyCoins={handleBuyCoins}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Why Choose Us */}
            <WhyChooseUs />

            {/* How It Works */}
            <HowItWorks />

            {/* Customer Reviews */}
            <ReviewsSection reviews={reviews} />

            {/* FAQ */}
            <FaqSection settings={settings} />

            {/* Contact CTA */}
            <ContactSection settings={settings} />
          </div>
        )}

        {/* TAB: FOOTBALL IDS MARKETPLACE */}
        {currentTab === 'ids' && (
          <FootballIdsView
            onViewDetails={(item) => setSelectedIdForDetail(item)}
          />
        )}

        {/* TAB: BUY COINS */}
        {currentTab === 'coins' && (
          <BuyCoinsView
            onBuyCoins={handleBuyCoins}
          />
        )}

        {/* TAB: DASHBOARD */}
        {currentTab === 'dashboard' && <CustomerDashboard />}

        {/* TAB: ADMIN */}
        {currentTab === 'admin' && <AdminDashboard />}

        {/* TAB: CONTACT */}
        {currentTab === 'contact' && <ContactSection settings={settings} />}
      </main>

      <Footer onNav={(tab) => {
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Global Modals */}
      <AuthModal />

      {/* Football ID Details Modal */}
      <FootballIdDetailsModal
        item={selectedIdForDetail}
        onClose={() => setSelectedIdForDetail(null)}
        onBuyId={handleBuyId}
        onContactSupport={() => {
          setSelectedIdForDetail(null);
          setCurrentTab('contact');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Coin Order Modal */}
      <CoinOrderModal
        pkg={selectedCoinForOrder}
        settings={settings}
        onClose={() => setSelectedCoinForOrder(null)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* ID Order Modal */}
      <IdOrderModal
        item={selectedIdForOrder}
        settings={settings}
        onClose={() => setSelectedIdForOrder(null)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
