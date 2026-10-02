import React from 'react';
import { Coins, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { ICoinPackage } from '../server/models/types.js';

interface CoinPackageCardProps {
  pkg: ICoinPackage;
  onBuyCoins: (pkg: ICoinPackage) => void;
}

export const CoinPackageCard: React.FC<CoinPackageCardProps> = ({ pkg, onBuyCoins }) => {
  const isInactive = pkg.status === 'inactive';

  return (
    <div className="relative rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-amber-950/20 group">
      {/* Background Subtle Coin Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full pointer-events-none" />

      <div>
        {/* Top Header: Coin Amount & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Coins className="w-6 h-6" />
          </div>
          {pkg.discount && pkg.discount > 0 ? (
            <span className="px-2 py-0.5 text-xs font-bold font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md">
              SAVE {pkg.discount}%
            </span>
          ) : null}
        </div>

        {/* Amount */}
        <h3 className="text-2xl font-extrabold text-white font-mono tracking-tight">
          {pkg.coinAmount.toLocaleString()}{' '}
          <span className="text-amber-400 font-sans font-bold text-lg">Coins</span>
        </h3>

        <div className="mt-1 text-xs text-neutral-400 font-mono">
          {pkg.game} · {pkg.platform}
        </div>

        {/* Pricing */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
              ৳ {pkg.price.toLocaleString()}
            </span>
            {pkg.originalPrice > pkg.price && (
              <span className="text-xs text-neutral-500 line-through font-mono">
                ৳ {pkg.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="mt-3 space-y-1.5 text-xs text-neutral-300">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{pkg.deliveryInfo}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>No Password Needed (Player ID Only)</span>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <div className="mt-6 pt-3 border-t border-neutral-800/80">
        <button
          onClick={() => onBuyCoins(pkg)}
          disabled={isInactive}
          className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 ${
            isInactive
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md shadow-amber-500/20 cursor-pointer'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{isInactive ? 'Unavailable' : 'Buy Coins'}</span>
          {!isInactive && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
