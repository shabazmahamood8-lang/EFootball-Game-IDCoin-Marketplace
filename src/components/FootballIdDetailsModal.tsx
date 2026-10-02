import React, { useState } from 'react';
import { X, Star, Shield, Coins, Check, MessageSquare, AlertCircle, Sparkles, Layers, Globe, Smartphone } from 'lucide-react';
import { IFootballID } from '../server/models/types.js';

interface FootballIdDetailsModalProps {
  item: IFootballID | null;
  onClose: () => void;
  onBuyId: (item: IFootballID) => void;
  onContactSupport: () => void;
}

export const FootballIdDetailsModal: React.FC<FootballIdDetailsModalProps> = ({
  item,
  onClose,
  onBuyId,
  onContactSupport,
}) => {
  if (!item) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const isSold = item.status === 'sold';
  const images = item.images && item.images.length > 0 ? item.images : ['/src/assets/images/card_superstar_squad_1790958699479.jpg'];
  const discountPercent = item.originalPrice > item.price
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400">ID #{item.id}</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="text-xs font-medium text-neutral-300">{item.game}</span>
            {isSold ? (
              <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                SOLD OUT
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                AVAILABLE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Image Gallery */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-neutral-950/90 border border-amber-500/40 px-3 py-1 rounded-lg text-amber-300 font-mono text-sm font-bold flex items-center gap-1.5 shadow-lg">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{item.overallRating} OVR</span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Account Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                  <span className="text-[11px] font-mono text-neutral-400 block uppercase">Team Strength</span>
                  <span className="text-base font-bold text-amber-300 font-mono">{item.overallRating} OVR</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                  <span className="text-[11px] font-mono text-neutral-400 block uppercase">Account Lvl</span>
                  <span className="text-base font-bold text-white font-mono">Lvl {item.accountLevel}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                  <span className="text-[11px] font-mono text-neutral-400 block uppercase">Coins Balance</span>
                  <span className="text-base font-bold text-amber-400 font-mono">{item.coinBalance.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                  <span className="text-[11px] font-mono text-neutral-400 block uppercase">GP / Currency</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {item.gpBalance ? `${(item.gpBalance / 1000000).toFixed(1)}M` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Pricing, Specs & Purchase CTA */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {item.title}
                </h2>

                <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                    {item.platform}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-neutral-500" />
                    {item.region}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-5 p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 block mb-0.5">Verified Price</span>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                          ৳ {item.price.toLocaleString()}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-neutral-500 line-through font-mono">
                            ৳ {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {discountPercent > 0 && (
                      <span className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification Badges */}
                <div className="mt-4 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Clean Konami / EA Link (Ready to bind to your email)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full login credential transfer within 15–30 mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Payment via bKash, Nagad, or Bank Transfer</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-neutral-800/80">
                {isSold ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-neutral-800 text-neutral-500 font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>SOLD OUT — ACCOUNT HANDED OVER</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onBuyId(item)}
                    className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Buy This ID Now (৳ {item.price.toLocaleString()})</span>
                  </button>
                )}

                <button
                  onClick={onContactSupport}
                  className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ask Question About This ID</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Squad Details & Lists */}
          <div className="pt-6 border-t border-neutral-800/80 space-y-6">
            {/* Squad Description */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Account Overview & Description
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line bg-neutral-950 p-4 rounded-xl border border-neutral-800/60">
                {item.description}
              </p>
            </div>

            {/* Special Cards & Rare Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.rarePlayers && item.rarePlayers.length > 0 && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/60 space-y-2">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Star & Rare Players
                  </h5>
                  <ul className="space-y-1.5 text-xs text-neutral-200">
                    {item.rarePlayers.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.specialCards && item.specialCards.length > 0 && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/60 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Special Cards & Boosters
                  </h5>
                  <ul className="space-y-1.5 text-xs text-neutral-200">
                    {item.specialCards.map((c, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Full Player Roster */}
            {item.players && item.players.length > 0 && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/60 space-y-2.5">
                <h5 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Squad Starting XI & Key Substitutes
                </h5>
                <div className="flex flex-wrap gap-2">
                  {item.players.map((player, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-md font-mono"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
