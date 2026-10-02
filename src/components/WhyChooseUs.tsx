import React from 'react';
import { ShieldCheck, Zap, Lock, Headphones, RefreshCw, CreditCard } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Unlinkable Accounts',
      description: 'Every football ID is verified with clean Konami ID or EA link, ready to connect directly to your personal email address.',
    },
    {
      icon: Zap,
      title: '15-Minute Fast Delivery',
      description: 'Automated order dispatch and pro gamers on standby ensure swift credential handover and coin top-up.',
    },
    {
      icon: Lock,
      title: 'Zero Password Needed For Coins',
      description: 'Never risk your account credentials. We credit coins directly via official server routing using only your public Player ID.',
    },
    {
      icon: CreditCard,
      title: 'Bangladeshi Payment Gateways',
      description: 'Pay smoothly in Bangladeshi Taka (BDT ৳) using bKash, Nagad, or direct bank transfer with instant payment verification.',
    },
    {
      icon: RefreshCw,
      title: 'Money-Back Guarantee',
      description: 'If an ID is already taken or delivery takes longer than guaranteed, you receive a full 100% immediate refund.',
    },
    {
      icon: Headphones,
      title: '24/7 Dedicated Support',
      description: 'Direct assistance on WhatsApp, Facebook, and phone for step-by-step account handover and setup help.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-neutral-950 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
            TRUST & SECURITY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Football Gamers Choose Us
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Dedicated exclusively to eFootball and FC Mobile players across Bangladesh with guaranteed delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-emerald-500/30 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
