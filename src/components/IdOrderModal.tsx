import React, { useState } from 'react';
import { X, Shield, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { IFootballID, ISiteSettings } from '../server/models/types.js';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface IdOrderModalProps {
  item: IFootballID | null;
  settings: ISiteSettings | null;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const IdOrderModal: React.FC<IdOrderModalProps> = ({
  item,
  settings,
  onClose,
  onOrderSuccess,
}) => {
  const { user, token, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Bank Transfer'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const bKashNumber = settings?.paymentNumberBkash || '+880 1712-345678';
  const nagadNumber = settings?.paymentNumberNagad || '+880 1812-345678';
  const currentPaymentNumber = paymentMethod === 'bKash' ? bKashNumber : nagadNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      showToast('Please login to buy this Football ID', 'info');
      openAuthModal('login');
      return;
    }

    if (!phone.trim()) {
      showToast('Phone number is required for account handover', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderType: 'ID',
          footballId: item.id,
          customerName,
          email,
          phone,
          paymentMethod,
          paymentTransactionId: trxId.trim(),
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to place order', 'error');
        return;
      }

      showToast(`Order #${data.order.id} placed successfully! ID is reserved for you.`, 'success');
      onOrderSuccess(data.order.id);
      onClose();
    } catch (err) {
      showToast((err as Error).message || 'Server error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Purchase Football ID</h3>
            <p className="text-xs text-neutral-400 font-mono">
              ID #{item.id} · Verified Price: ৳ {item.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Selected Item Summary */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 mb-5 flex items-center justify-between">
          <div className="space-y-0.5 max-w-[260px]">
            <span className="text-xs text-neutral-400 font-mono block">{item.game}</span>
            <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
              <Star className="w-3 h-3 fill-amber-300" />
              <span>{item.overallRating} OVR</span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span>{item.coinBalance.toLocaleString()} Coins</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-emerald-400 font-mono tabular-nums block">
              ৳ {item.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Handover Notice */}
        <div className="mb-5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Direct Account Credentials Handover</span>
          </div>
          <p className="text-neutral-400 text-[11px]">
            Our support will deliver the original Konami ID / EA login and guide you through changing to your personal email within 15–30 minutes of payment confirmation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                WhatsApp / Phone <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 17..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email for Account Details</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['bKash', 'Nagad', 'Bank Transfer'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                    paymentMethod === method
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Instructions Box */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
            {paymentMethod === 'Bank Transfer' ? (
              <div>
                <span className="text-neutral-400 block font-mono">Bank Account Details:</span>
                <span className="text-white font-mono font-bold block">{settings?.bankDetails}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-neutral-400 block font-mono">
                    Send Money ({paymentMethod} Personal):
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-sm block">
                    {currentPaymentNumber}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-neutral-300">
                  Amount: ৳ {item.price.toLocaleString()}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
              {settings?.paymentInstructions || 'Send Money to the number above, then enter the Transaction ID (TrxID) below.'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Transaction ID (TrxID) <span className="text-neutral-500 font-normal">(Optional if paying shortly)</span>
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. 9B8K12049"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Handover Note / Details (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Please message me on WhatsApp before sending code"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Reserving ID...</span>
            ) : (
              <>
                <span>Confirm Purchase (৳ {item.price.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
