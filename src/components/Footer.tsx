import React from 'react';
import { Shield, Coins, Heart } from 'lucide-react';

interface FooterProps {
  onNav: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNav }) => {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                FOOTBALL <span className="text-emerald-400">ID STORE</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Bangladesh’s dedicated marketplace for eFootball and EA FC Mobile account IDs and game coins. 100% verified squads, fast handover, safe top-ups.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNav('ids')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Browse Football IDs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('coins')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Buy Game Coins</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNav('home');
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  How Delivery Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNav('home');
                    setTimeout(() => {
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Payment Methods (BD)
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-emerald-400 font-bold">
                bKash Personal
              </span>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400 font-bold">
                Nagad Personal
              </span>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-sky-400 font-bold">
                City Bank
              </span>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300">
                Direct Bank Transfer
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 pt-1">
              Manual verification ensures 100% dispute protection for Bangladeshi buyers.
            </p>
          </div>

          {/* Col 4: Safety & Support Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Security Guarantee
            </h4>
            <div className="text-xs text-neutral-400 space-y-1.5 leading-relaxed">
              <p>✔ Clean Konami ID & EA accounts</p>
              <p>✔ No password required for coin orders</p>
              <p>✔ 100% refund on unfulfilled requests</p>
              <p>✔ Verified operational daily 9AM – 1AM</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} FOOTBALL ID STORE. Dedicated Football Gaming Marketplace.
          </div>
          <div className="flex items-center gap-1">
            <span>Built for Bangladeshi Football Gamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
