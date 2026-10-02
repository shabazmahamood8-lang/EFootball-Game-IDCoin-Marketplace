import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, ShoppingBag, User as UserIcon, Clock, CheckCircle2, AlertCircle, Coins, Shield, Star, Send } from 'lucide-react';
import { IOrder, OrderStatus } from '../server/models/types.js';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CustomerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'review'>('orders');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review submission state
  const [reviewProduct, setReviewProduct] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      showToast('Error loading your orders', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) =>
    ['pending', 'payment_submitted', 'processing'].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;
  const totalSpent = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.price, 0);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setIsSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: reviewProduct,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to submit review', 'error');
        return;
      }

      showToast('Review submitted successfully! Thank you.', 'success');
      setReviewComment('');
      setReviewProduct('');
      setActiveTab('orders');
    } catch (err) {
      showToast((err as Error).message || 'Server error', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            DELIVERED
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            PROCESSING
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            CONFIRMED
          </span>
        );
      case 'payment_submitted':
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            VERIFYING TRX
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-neutral-900 text-neutral-400 border border-neutral-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            PENDING PAYMENT
          </span>
        );
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            CUSTOMER PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Welcome back, <span className="text-white font-medium">{user?.name}</span> ({user?.email})
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>My Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Write Review</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 block font-mono">Total Orders</span>
          <span className="text-2xl font-bold text-white font-mono">{totalOrders}</span>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 block font-mono">In Progress</span>
          <span className="text-2xl font-bold text-amber-400 font-mono">{pendingOrders}</span>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 block font-mono">Delivered</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">{completedOrders}</span>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400 block font-mono">Total Spent</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            ৳ {totalSpent.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Purchase History</h2>
            <button
              onClick={fetchOrders}
              className="text-xs text-emerald-400 hover:underline font-mono"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-neutral-400 font-mono text-sm">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-base font-semibold text-white">No orders found</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                You haven’t purchased any football IDs or coins yet. Browse our catalog to assemble your squad!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {orders.map((order) => (
                <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-850 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{order.id}</span>
                      <span aria-hidden="true" className="text-neutral-700">·</span>
                      <span className="text-xs font-mono text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.orderType === 'ID' ? (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <span>{order.footballIdTitle || `Football ID #${order.footballId}`}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span>{order.coinAmount?.toLocaleString()} Football Coins</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-neutral-400 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                      <span>Method: <strong className="text-neutral-200">{order.paymentMethod}</strong></span>
                      {order.paymentTransactionId && (
                        <span>TrxID: <strong className="text-neutral-200">{order.paymentTransactionId}</strong></span>
                      )}
                      {order.playerID && (
                        <span>Player ID: <strong className="text-amber-300">{order.playerID}</strong></span>
                      )}
                      {order.phone && (
                        <span>Contact: <strong className="text-neutral-200">{order.phone}</strong></span>
                      )}
                    </div>

                    {order.note && (
                      <p className="text-xs text-neutral-400 italic bg-neutral-950 p-2 rounded border border-neutral-800/60 mt-1">
                        Note: {order.note}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono tabular-nums">
                      ৳ {order.price.toLocaleString()}
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-2xl space-y-6">
          <h2 className="text-lg font-bold text-white">Profile Details</h2>
          <div className="space-y-4 text-sm">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-xs text-neutral-500 font-mono block">Full Name</span>
              <span className="text-base font-semibold text-white block mt-0.5">{user?.name}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-xs text-neutral-500 font-mono block">Email Address</span>
              <span className="text-base font-semibold text-white block mt-0.5">{user?.email}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-xs text-neutral-500 font-mono block">Phone / WhatsApp</span>
              <span className="text-base font-semibold text-white block mt-0.5">{user?.phone || 'Not provided'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-xs text-neutral-500 font-mono block">Account Role</span>
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 block mt-0.5">{user?.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Leave a Review */}
      {activeTab === 'review' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white">Share Your Review</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Review your squad or coin top-up purchase to help other gamers.
            </p>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Product Purchased</label>
              <input
                type="text"
                required
                value={reviewProduct}
                onChange={(e) => setReviewProduct(e.target.value)}
                placeholder="e.g. 102 OVR Messi Big Time Squad or 10,000 Coins"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= reviewRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono text-neutral-400 ml-2">{reviewRating} of 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Review Comment</label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the delivery speed, customer service, and squad accuracy?"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingReview ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
