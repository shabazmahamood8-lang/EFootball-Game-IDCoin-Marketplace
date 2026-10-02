import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Coins, Trophy, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onBrowseIds: () => void;
  onBuyCoins: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBrowseIds, onBuyCoins }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-neutral-800/80">
      {/* Stadium Pitch Background Image with Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/src/assets/images/hero_football_stadium_1790958685031.jpg"
          alt="Football Stadium Floodlights"
          className="w-full h-full object-cover object-center opacity-25 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Unboxed natural kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>OFFICIAL FOOTBALL GAME ID & COIN STORE</span>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-400">eFootball & FC Mobile</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
              Your Football Game.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Your Ultimate Squad.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Buy football game IDs and coins at affordable prices. Verified 100+ OVR dream teams, epic booster players, and safe instant coin top-ups delivered within 15 minutes.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onBrowseIds}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Browse Football IDs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBuyCoins}
                className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl border border-neutral-700/80 hover:border-amber-400/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Buy Football Coins</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-6 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-neutral-300 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Ban-Free & Clean ID</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>15-Min Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <span className="font-mono text-emerald-400 font-bold">bKash/Nagad</span>
                <span>Supported</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* Card Container with Sleek Border */}
              <div className="relative rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl p-4 overflow-hidden backdrop-blur-md">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-neutral-950">
                  <img
                    src="/src/assets/images/card_superstar_squad_1790958699479.jpg"
                    alt="Featured Football Card Showcase"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>OVR 103 GOD SQUAD</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-emerald-500 text-neutral-950 text-xs font-bold px-2.5 py-0.5 rounded shadow">
                    VERIFIED
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-400">eFootball 2026 Mobile</span>
                    <span className="text-xs font-mono text-emerald-400 font-medium">3,450 Coins Inside</span>
                  </div>
                  <h4 className="text-base font-bold text-white leading-snug">
                    Big Time Messi 103 + Booster Haaland Squad
                  </h4>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                    <div>
                      <div className="text-xs text-neutral-500 line-through">৳ 6,000</div>
                      <div className="text-lg font-extrabold text-emerald-400 font-mono">৳ 4,800</div>
                    </div>
                    <button
                      onClick={onBrowseIds}
                      className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Inspect Squad</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Floating Floating Card */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-neutral-900/95 border border-neutral-800 rounded-xl p-3 shadow-xl backdrop-blur-md items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400 font-mono">DIRECT SERVER TOP-UP</div>
                  <div className="text-xs font-bold text-white">50,000 Coins Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
