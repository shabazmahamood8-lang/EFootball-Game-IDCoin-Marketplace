import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { ISiteSettings } from '../server/models/types.js';
import { useToast } from '../context/ToastContext';

interface ContactSectionProps {
  settings: ISiteSettings | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to send message', 'error');
        return;
      }

      showToast('Your message has been sent to our team!', 'success');
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      showToast((err as Error).message || 'Server error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsapp = settings?.supportWhatsapp || '+880 1712-345678';
  const facebook = settings?.supportFacebook || 'https://facebook.com/footballidstore';
  const emailAddr = settings?.supportEmail || 'support@footballidstore.com';
  const phoneNum = settings?.supportPhone || '+880 1912-345678';

  return (
    <section id="contact" className="py-16 sm:py-20 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
            24/7 SUPPORT DESK
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Football ID Support
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Have questions about an account transfer, custom coin order, or payment confirmation? Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Direct Channels</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                For urgent order delivery or instant payment confirmation, connect with us on WhatsApp for rapid response.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 hover:bg-emerald-950/40 border border-neutral-800 hover:border-emerald-500/40 text-neutral-200 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 block uppercase">WhatsApp Direct</span>
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-300 font-mono">
                      {whatsapp}
                    </span>
                  </div>
                </a>

                <a
                  href={`mailto:${emailAddr}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 hover:bg-neutral-800/60 border border-neutral-800 text-neutral-200 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 block uppercase">Official Email</span>
                    <span className="text-sm font-semibold text-white group-hover:text-amber-300 font-mono">
                      {emailAddr}
                    </span>
                  </div>
                </a>

                <a
                  href={`tel:${phoneNum.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 hover:bg-neutral-800/60 border border-neutral-800 text-neutral-200 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 block uppercase">Customer Hotline</span>
                    <span className="text-sm font-semibold text-white font-mono">{phoneNum}</span>
                  </div>
                </a>
              </div>

              <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-400 space-y-1">
                <span className="font-mono text-emerald-400 block font-semibold">Active Support Hours:</span>
                <span>Everyday: 9:00 AM – 1:00 AM Bangladesh Standard Time (BST)</span>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
              <h3 className="text-xl font-bold text-white mb-1">Send a Message</h3>
              <p className="text-xs text-neutral-400 mb-6">
                Fill in the details below and our football game admin will respond promptly.
              </p>

              {submitted ? (
                <div className="p-8 text-center space-y-3 bg-neutral-950 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Message Received!</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Thank you for reaching out. We will review your inquiry and reply via email or WhatsApp shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Player Name"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">WhatsApp / Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 17..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Account Handover or Coin Query"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your question or request here..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
