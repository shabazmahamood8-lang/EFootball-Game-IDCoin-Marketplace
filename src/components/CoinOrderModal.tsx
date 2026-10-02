import React, { useState } from 'react';
import { X, Coins, ShieldCheck, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { ICoinPackage, ISiteSettings } from '../server/models/types.js';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CoinOrderModalProps {
  pkg: ICoinPackage | null;
  settings: ISiteSettings | null;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CoinOrderModal: React.FC<CoinOrderModalProps> = ({
  pkg,
  settings,
  onClose,
  onOrderSuccess,
}) => {
  const { user, token, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [playerId, setPlayerId] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Bank Transfer'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pkg) return null;

  const bKashNumber = settings?.paymentNumberBkash || '+880 1712-345678';
  const nagadNumber = settings?.paymentNumberNagad || '+880 1812-345678';
  const currentPaymentNumber = paymentMethod === 'bKash' ? bKashNumber : nagadNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      showToast('Please login to place an order', 'info');
      openAuthModal('login');
      return;
    }

    if (!playerId.trim()) {
      showToast('Player ID / Game ID is required for coin top-up', 'error');
      return;
    }

    if (!phone.trim()) {
      showToast('Phone number is required for transaction confirmation', 'error');
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
          orderType: 'COINS',
          coinPackageId: pkg.id,
          playerID: playerId.trim(),
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

      showToast(`Order #${data.order.id} placed successfully!`, 'success');
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Buy Football Coins</h3>
            <p className="text-xs text-neutral-400 font-mono">
              {pkg.coinAmount.toLocaleString()} Coins · Verified Price: ৳ {pkg.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Security Assurance Banner */}
        <div className="mb-5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Safe Server Top-up (No Password Needed)</span>
          </div>
          <p className="text-neutral-400 text-[11px]">
            Coins are credited via Konami / EA direct server routing using only your public Player ID.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required Player ID */}
          <div>
            <label className="block text-xs font-semibold text-neutral-200 mb-1 flex items-center justify-between">
              <span>Player ID / Game ID <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-neutral-400 font-normal">e.g. 9-10 digit User ID</span>
            </label>
            <input
              type="text"
              required
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              placeholder="e.g. 194-820-391 (Find in Extras > User Details)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Your Name</label>
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
              <label className="block text-xs font-medium text-neutral-300 mb-1">Phone / WhatsApp</label>
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
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
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

          {/* Payment Details Box */}
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
                  Amount: ৳ {pkg.price.toLocaleString()}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
              {settings?.paymentInstructions || 'Send Money to the number above, then enter the Transaction ID (TrxID) below.'}
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Transaction ID (TrxID) <span className="text-neutral-500 font-normal">(Optional if paying shortly)</span>
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. BKASH8X9201"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 font-mono uppercase"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any specific note for admin"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Order...</span>
            ) : (
              <>
                <span>Confirm Coin Order (৳ {pkg.price.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
