import React from 'react';
import { Search, CreditCard, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Choose Squad or Coin Package',
      description: 'Explore verified football accounts by OVR, rare player boosters, and level, or pick any coin top-up bundle.',
    },
    {
      num: '02',
      icon: CreditCard,
      title: 'Submit Payment & Game ID',
      description: 'Send money via bKash, Nagad, or Bank Transfer and provide your Player ID or phone number in checkout.',
    },
    {
      num: '03',
      icon: CheckCircle2,
      title: 'Receive Fast Delivery',
      description: 'Receive full account credentials or direct coin balance top-up in 10 to 30 minutes with our support agent.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
            SIMPLE 3-STEP PROCESS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            From squad selection to kicking off on the pitch in under 30 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-center md:text-left flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold font-mono text-neutral-800">{step.num}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
