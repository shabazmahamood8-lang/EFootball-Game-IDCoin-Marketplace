import React, { useState, useEffect } from 'react';
import { Coins, Zap, ShieldCheck, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { ICoinPackage } from '../server/models/types.js';
import { CoinPackageCard } from './CoinPackageCard';

interface BuyCoinsViewProps {
  onBuyCoins: (pkg: ICoinPackage) => void;
}

export const BuyCoinsView: React.FC<BuyCoinsViewProps> = ({ onBuyCoins }) => {
  const [packages, setPackages] = useState<ICoinPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/coins');
        if (res.ok) {
          const data = await res.json();
          setPackages(data.coinPackages || []);
        }
      } catch {
        // offline
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Kicker */}
      <div className="mb-8">
        <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5" />
          OFFICIAL IN-GAME CURRENCY STORE
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Football Game Coins Store
        </h1>
        <p className="mt-1 text-sm text-neutral-400 max-w-2xl">
          Purchase verified eFootball and EA FC Mobile coins at discounted Bangladeshi Taka (৳) rates. 100% password-free server top-up using only your Player ID.
        </p>
      </div>

      {/* Safety & Delivery Banner */}
      <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono">100% Safe Server Routing</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
              We never request your password or email code. Top-up is delivered via in-game ID sync.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono">15-Min Average Delivery</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
              Direct credit into your game mailbox. Dedicated delivery agents online 9AM – 1AM daily.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono">bKash & Nagad Supported</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
              Instant mobile payment in BDT with manual verification to ensure transaction accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm font-mono text-neutral-400">Loading coin packages from database...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="py-20 text-center p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
          <Coins className="w-12 h-12 text-neutral-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No coin packages available right now</h3>
          <p className="text-xs text-neutral-400 mt-1">Please check back shortly or message our support.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <CoinPackageCard
              key={pkg.id}
              pkg={pkg}
              onBuyCoins={onBuyCoins}
            />
          ))}
        </div>
      )}
    </div>
  );
};
