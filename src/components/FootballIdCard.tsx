import React, { useState } from 'react';
import { Star, Shield, ArrowRight, CheckCircle, Flame, Eye } from 'lucide-react';
import { IFootballID } from '../server/models/types.js';

interface FootballIdCardProps {
  item: IFootballID;
  onViewDetails: (item: IFootballID) => void;
}

export const FootballIdCard: React.FC<FootballIdCardProps> = ({ item, onViewDetails }) => {
  const [imageError, setImageError] = useState(false);
  const isSold = item.status === 'sold';
  const mainImage = item.images && item.images.length > 0 ? item.images[0] : '';

  return (
    <div
      onClick={() => onViewDetails(item)}
      className={`group relative rounded-2xl bg-neutral-900 border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
        isSold
          ? 'border-neutral-800/60 opacity-80'
          : 'border-neutral-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20 hover:-translate-y-0.5'
      }`}
    >
      {/* Top Media Container */}
      <div className="relative aspect-[4/3] w-full bg-neutral-950 overflow-hidden">
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt={item.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isSold ? 'grayscale' : 'group-hover:scale-105'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-600 p-4">
            <Shield className="w-12 h-12 text-emerald-500/30 mb-2" />
            <span className="text-xs font-mono">{item.game}</span>
          </div>
        )}

        {/* Status Overlay Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isSold ? (
            <span className="px-2.5 py-1 text-xs font-bold font-mono tracking-wider uppercase rounded-md bg-neutral-900/90 text-neutral-400 border border-neutral-700/80 backdrop-blur-md">
              SOLD OUT
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-bold font-mono tracking-wider uppercase rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AVAILABLE
            </span>
          )}
        </div>

        {/* Overall Rating (OVR) Badge */}
        <div className="absolute top-3 right-3 bg-neutral-950/90 border border-amber-500/40 backdrop-blur-md px-2.5 py-1 rounded-md text-amber-300 font-mono text-xs font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{item.overallRating} OVR</span>
        </div>

        {/* Featured Tag if applicable */}
        {item.featured && !isSold && (
          <div className="absolute bottom-3 left-3 bg-neutral-950/90 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>FEATURED</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Platform & Region metadata */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-1.5">
            <span>{item.game}</span>
            <span aria-hidden="true">·</span>
            <span>{item.platform}</span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-emerald-300 transition-colors">
            {item.title}
          </h3>

          {/* Squad Highlights List */}
          <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5 text-xs text-neutral-300">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Account Level</span>
              <span className="font-mono font-medium text-white">Lvl {item.accountLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Coins Balance</span>
              <span className="font-mono font-semibold text-amber-300">
                {item.coinBalance.toLocaleString()} Coins
              </span>
            </div>
            {item.rarePlayers && item.rarePlayers.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Star Players</span>
                <span className="font-medium text-white truncate max-w-[150px] text-right">
                  {item.rarePlayers.slice(0, 2).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Price & CTA */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
          <div>
            {item.originalPrice > item.price && (
              <div className="text-xs text-neutral-500 line-through font-mono">
                ৳ {item.originalPrice.toLocaleString()}
              </div>
            )}
            <div className="text-lg font-extrabold text-emerald-400 font-mono tabular-nums leading-none">
              ৳ {item.price.toLocaleString()}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              isSold
                ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 cursor-pointer'
                : 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 shadow-sm shadow-emerald-500/20'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View ID</span>
          </button>
        </div>
      </div>
    </div>
  );
};
