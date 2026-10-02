import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ISiteSettings } from '../server/models/types.js';

interface FaqSectionProps {
  settings: ISiteSettings | null;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ settings }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs = [
    {
      question: 'How do I buy a football game ID?',
      answer: 'Browse our Football IDs section, click "View ID" to inspect the squad and OVR, then click "Buy This ID". You can submit payment via bKash, Nagad, or Bank Transfer. After payment verification, our admin transfers complete credentials (Konami ID / EA account) directly to your WhatsApp or email.',
    },
    {
      question: 'How do I buy coins?',
      answer: 'Navigate to "Buy Coins", choose your desired coin package (e.g. 1,000, 10,000, or 50,000 Coins), enter your Player ID / Game ID, select your payment method, and complete the order. Coins are safely credited directly to your account.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Coin top-ups are usually processed in 10 to 30 minutes. Football ID account transfers take between 15 to 45 minutes during operational hours (9:00 AM - 1:00 AM BST).',
    },
    {
      question: 'What payment methods are available?',
      answer: 'We support all major Bangladeshi mobile banking channels including bKash (Personal), Nagad (Personal), and direct Bank Transfers. Every payment is checked by our team for safety.',
    },
    {
      question: 'How do I provide my Player ID?',
      answer: 'In eFootball or FC Mobile, tap your User Profile / Extras menu to copy your 9-10 digit User ID / Player ID. Paste that exact string into our Coin checkout form.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'If an ID is no longer available or an order cannot be delivered within 2 hours, we issue an instant 100% money-back refund to your original payment number.',
    },
  ];

  const faqs = settings?.faqs && settings.faqs.length > 0 ? settings.faqs : defaultFaqs;

  return (
    <section id="faq" className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-900/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Got Questions? We’ve Got Answers
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Everything you need to know about buying football game accounts and coins safely.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-neutral-900 border border-neutral-800/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
