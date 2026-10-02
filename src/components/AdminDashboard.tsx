import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Shield,
  Coins,
  ShoppingBag,
  Users,
  Star,
  Settings as SettingsIcon,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Upload,
  Save,
} from 'lucide-react';
import {
  IFootballID,
  ICoinPackage,
  IOrder,
  IReview,
  ISiteSettings,
  IContactMessage,
  IUser,
  OrderStatus,
} from '../server/models/types.js';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'stats' | 'ids' | 'coins' | 'orders' | 'users' | 'reviews' | 'settings' | 'contact'
  >('stats');

  // Stats state
  const [stats, setStats] = useState({
    totalIds: 0,
    availableIds: 0,
    soldIds: 0,
    totalCoinPackages: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });

  // Data lists
  const [footballIds, setFootballIds] = useState<IFootballID[]>([]);
  const [coinPackages, setCoinPackages] = useState<ICoinPackage[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [contactMessages, setContactMessages] = useState<IContactMessage[]>([]);

  const [loading, setLoading] = useState(false);

  // Modals state
  const [editingId, setEditingId] = useState<Partial<IFootballID> | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  const [editingCoin, setEditingCoin] = useState<Partial<ICoinPackage> | null>(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);

  // Fetch admin stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // offline
    }
  }, [token]);

  // Fetch IDs
  const fetchIds = useCallback(async () => {
    try {
      const res = await fetch('/api/ids');
      if (res.ok) {
        const data = await res.json();
        setFootballIds(data.ids || []);
      }
    } catch {}
  }, []);

  // Fetch Coins
  const fetchCoins = useCallback(async () => {
    try {
      const res = await fetch('/api/coins');
      if (res.ok) {
        const data = await res.json();
        setCoinPackages(data.coinPackages || []);
      }
    } catch {}
  }, []);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {}
  }, [token]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {}
  }, [token]);

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/reviews/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {}
  }, [token]);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch {}
  }, []);

  // Fetch Messages
  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/contact/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContactMessages(data.contactMessages || []);
      }
    } catch {}
  }, [token]);

  const refreshAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchStats(),
      fetchIds(),
      fetchCoins(),
      fetchOrders(),
      fetchUsers(),
      fetchReviews(),
      fetchSettings(),
      fetchMessages(),
    ]).finally(() => setLoading(false));
  }, [
    fetchStats,
    fetchIds,
    fetchCoins,
    fetchOrders,
    fetchUsers,
    fetchReviews,
    fetchSettings,
    fetchMessages,
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Admin Privileges Required</h2>
        <p className="text-sm text-neutral-400">
          You must be logged in as an administrator to view this area.
        </p>
      </div>
    );
  }

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchOrders();
        fetchStats();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update', 'error');
      }
    } catch {
      showToast('Server error', 'error');
    }
  };

  // Save Football ID
  const handleSaveFootballId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const isUpdating = Boolean(editingId.id);
      const url = isUpdating ? `/api/ids/${editingId.id}` : '/api/ids';
      const method = isUpdating ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingId),
      });

      if (res.ok) {
        showToast(isUpdating ? 'Listing updated!' : 'Listing created!', 'success');
        setIsIdModalOpen(false);
        setEditingId(null);
        fetchIds();
        fetchStats();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save', 'error');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  // Delete Football ID
  const handleDeleteFootballId = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Football ID listing?')) return;
    try {
      const res = await fetch(`/api/ids/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Listing deleted', 'info');
        fetchIds();
        fetchStats();
      }
    } catch {}
  };

  // Save Coin Package
  const handleSaveCoinPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoin) return;

    try {
      const isUpdating = Boolean(editingCoin.id);
      const url = isUpdating ? `/api/coins/${editingCoin.id}` : '/api/coins';
      const method = isUpdating ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingCoin),
      });

      if (res.ok) {
        showToast(isUpdating ? 'Coin package updated!' : 'Coin package created!', 'success');
        setIsCoinModalOpen(false);
        setEditingCoin(null);
        fetchCoins();
        fetchStats();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save', 'error');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  // Delete Coin Package
  const handleDeleteCoinPackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coin package?')) return;
    try {
      const res = await fetch(`/api/coins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Coin package deleted', 'info');
        fetchCoins();
        fetchStats();
      }
    } catch {}
  };

  // Toggle Review Status
  const handleToggleReview = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    try {
      const res = await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Review is now ${newStatus}`, 'success');
        fetchReviews();
      }
    } catch {}
  };

  // Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast('Site settings updated successfully!', 'success');
      }
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ADMIN MANAGEMENT PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Store Administration
          </h1>
        </div>

        <button
          onClick={refreshAll}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-mono rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1 bg-neutral-900/90 p-1.5 rounded-xl border border-neutral-800 overflow-x-auto mb-8">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('ids')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ids'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Football IDs ({footballIds.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('coins')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'coins'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Coin Packages ({coinPackages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Reviews ({reviews.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Payment & Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'contact'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Inquiries ({contactMessages.length})</span>
        </button>
      </div>

      {/* Tab: Overview Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 block font-mono">Total ID Listings</span>
              <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
                {stats.totalIds}
              </span>
              <div className="text-[11px] text-emerald-400 font-mono mt-2">
                {stats.availableIds} Available · {stats.soldIds} Sold
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 block font-mono">Coin Packages</span>
              <span className="text-3xl font-extrabold text-amber-400 font-mono mt-1 block">
                {stats.totalCoinPackages}
              </span>
              <div className="text-[11px] text-neutral-400 font-mono mt-2">Active Top-up Tiers</div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 block font-mono">Total Orders</span>
              <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
                {stats.totalOrders}
              </span>
              <div className="text-[11px] text-amber-400 font-mono mt-2">
                {stats.pendingOrders} Pending / In-progress
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 block font-mono">Total Completed Revenue</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1 block">
                ৳ {stats.totalRevenue.toLocaleString()}
              </span>
              <div className="text-[11px] text-neutral-400 font-mono mt-2">
                {stats.completedOrders} Delivered orders
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Manage Football IDs
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Add newly acquired 100+ OVR accounts, upload squad formations, set prices in BDT ৳, or toggle sold status.
              </p>
              <button
                onClick={() => {
                  setEditingId({
                    title: '',
                    game: 'eFootball 2026',
                    price: 2500,
                    originalPrice: 3000,
                    overallRating: 99,
                    accountLevel: 50,
                    platform: 'Mobile (Android/iOS)',
                    region: 'Global',
                    coinBalance: 2000,
                    gpBalance: 1000000,
                    players: ['L. Messi', 'E. Haaland', 'K. Mbappé'],
                    rarePlayers: ['Big Time Messi'],
                    specialCards: ['10 Epic Cards'],
                    description: 'Clean Konami ID ready to link directly to your email.',
                    status: 'available',
                    featured: true,
                    images: ['/src/assets/images/card_superstar_squad_1790958699479.jpg'],
                  });
                  setIsIdModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Football ID</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Manage Coin Packages
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Update coin amounts, set discounted promotional rates, or add custom top-up tiers for eFootball & FC Mobile.
              </p>
              <button
                onClick={() => {
                  setEditingCoin({
                    coinAmount: 15000,
                    price: 3200,
                    originalPrice: 3800,
                    discount: 15,
                    game: 'eFootball 2026',
                    platform: 'All Platforms (Mobile / PC / Console)',
                    deliveryInfo: 'Instant safe top-up via Player ID. 10 - 20 mins delivery.',
                    status: 'active',
                  });
                  setIsCoinModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Coin Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Football IDs CRUD */}
      {activeTab === 'ids' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">All Football ID Listings</h2>
            <button
              onClick={() => {
                setEditingId({
                  title: '',
                  game: 'eFootball 2026',
                  price: 2500,
                  originalPrice: 3000,
                  overallRating: 99,
                  accountLevel: 50,
                  platform: 'Mobile (Android/iOS)',
                  region: 'Global',
                  coinBalance: 2000,
                  gpBalance: 1000000,
                  players: [],
                  rarePlayers: [],
                  specialCards: [],
                  description: '',
                  status: 'available',
                  featured: false,
                  images: ['/src/assets/images/card_superstar_squad_1790958699479.jpg'],
                });
                setIsIdModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New ID Listing</span>
            </button>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-mono uppercase">
                <tr>
                  <th className="p-4">Listing / Title</th>
                  <th className="p-4">Game & Platform</th>
                  <th className="p-4">OVR / Level</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {footballIds.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-850">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm truncate max-w-xs">{item.title}</div>
                      <div className="text-[11px] font-mono text-neutral-500">ID: {item.id}</div>
                    </td>
                    <td className="p-4 font-mono text-neutral-300">
                      <div>{item.game}</div>
                      <div className="text-[11px] text-neutral-500">{item.platform}</div>
                    </td>
                    <td className="p-4 font-mono">
                      <span className="text-amber-400 font-bold">{item.overallRating} OVR</span>
                      <span className="text-neutral-500 block">Lvl {item.accountLevel}</span>
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-bold text-sm">
                      ৳ {item.price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      {item.status === 'available' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                          AVAILABLE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[11px] font-bold">
                          SOLD OUT
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(item);
                          setIsIdModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-emerald-400 rounded hover:bg-neutral-800"
                        title="Edit ID"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFootballId(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800"
                        title="Delete ID"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Coin Packages CRUD */}
      {activeTab === 'coins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">All Coin Top-up Packages</h2>
            <button
              onClick={() => {
                setEditingCoin({
                  coinAmount: 5000,
                  price: 1200,
                  originalPrice: 1400,
                  discount: 14,
                  game: 'eFootball 2026',
                  platform: 'All Platforms (Mobile / PC / Console)',
                  deliveryInfo: 'Instant safe top-up via Player ID. 10 - 20 mins delivery.',
                  status: 'active',
                });
                setIsCoinModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coin Package</span>
            </button>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-mono uppercase">
                <tr>
                  <th className="p-4">Coin Amount</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Game</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {coinPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-neutral-850">
                    <td className="p-4 font-mono font-bold text-amber-400 text-sm">
                      {pkg.coinAmount.toLocaleString()} Coins
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                      ৳ {pkg.price.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-neutral-300">
                      {pkg.discount ? `${pkg.discount}%` : '-'}
                    </td>
                    <td className="p-4 text-neutral-300 font-mono">{pkg.game}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                          pkg.status === 'active'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {pkg.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingCoin(pkg);
                          setIsCoinModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-amber-400 rounded hover:bg-neutral-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoinPackage(pkg.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Customer Orders ({orders.length})</h2>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-mono uppercase">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Customer & Contact</th>
                  <th className="p-4">Payment & TrxID</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-850">
                    <td className="p-4 font-mono">
                      <span className="font-bold text-emerald-400 text-sm">{ord.id}</span>
                      <span className="text-[11px] text-neutral-500 block">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {ord.orderType === 'ID' ? (
                        <div>
                          <span className="font-bold text-white block truncate max-w-xs">
                            {ord.footballIdTitle || `ID #${ord.footballId}`}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400">Account ID</span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-amber-300 block">
                            {ord.coinAmount?.toLocaleString()} Coins
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            Player ID: <strong>{ord.playerID}</strong>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{ord.phone}</div>
                      <div className="text-[11px] text-neutral-500">{ord.email}</div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="text-white font-bold">{ord.paymentMethod}</div>
                      <div className="text-[11px] text-emerald-400">
                        {ord.paymentTransactionId ? `Trx: ${ord.paymentTransactionId}` : 'No TrxID entered'}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                      ৳ {ord.price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-mono"
                      >
                        <option value="pending">pending</option>
                        <option value="payment_submitted">payment_submitted</option>
                        <option value="confirmed">confirmed</option>
                        <option value="processing">processing</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users List */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Registered Users</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-mono uppercase">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-850">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4 font-mono text-neutral-300">{u.email}</td>
                    <td className="p-4 font-mono text-neutral-400">{u.phone || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-neutral-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Reviews Moderation</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{rev.userName}</span>
                    <span className="text-neutral-500 text-xs font-mono">· {rev.product}</span>
                    <span className="text-amber-400 font-mono font-bold text-xs">
                      ★ {rev.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 italic">"{rev.comment}"</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleReview(rev.id, rev.status)}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                      rev.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {rev.status.toUpperCase()}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Payment Gateways & Store Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">bKash Personal Number</label>
              <input
                type="text"
                value={settings.paymentNumberBkash}
                onChange={(e) => setSettings({ ...settings, paymentNumberBkash: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Nagad Personal Number</label>
              <input
                type="text"
                value={settings.paymentNumberNagad}
                onChange={(e) => setSettings({ ...settings, paymentNumberNagad: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Bank Account Information</label>
              <input
                type="text"
                value={settings.bankDetails}
                onChange={(e) => setSettings({ ...settings, bankDetails: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Payment Instructions</label>
              <textarea
                rows={3}
                value={settings.paymentInstructions}
                onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Support WhatsApp</label>
                <input
                  type="text"
                  value={settings.supportWhatsapp}
                  onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: Contact Messages */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Customer Support Inquiries</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            {contactMessages.map((msg) => (
              <div key={msg.id} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{msg.subject}</div>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-300">{msg.message}</p>
                <div className="text-[11px] text-neutral-400 font-mono">
                  From: {msg.name} ({msg.email}) {msg.phone && `· Phone: ${msg.phone}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit / Add Football ID */}
      {isIdModalOpen && editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsIdModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">
              {editingId.id ? 'Edit Football ID' : 'Add Football Game ID'}
            </h3>

            <form onSubmit={handleSaveFootballId} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Listing Title</label>
                <input
                  type="text"
                  required
                  value={editingId.title || ''}
                  onChange={(e) => setEditingId({ ...editingId, title: e.target.value })}
                  placeholder="e.g. 102 OVR Big Time Messi + Epic Booster Haaland"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Game</label>
                  <select
                    value={editingId.game || 'eFootball 2026'}
                    onChange={(e) => setEditingId({ ...editingId, game: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="eFootball 2026">eFootball 2026</option>
                    <option value="EA FC Mobile">EA FC Mobile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Platform</label>
                  <select
                    value={editingId.platform || 'Mobile (Android/iOS)'}
                    onChange={(e) => setEditingId({ ...editingId, platform: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Mobile (Android/iOS)">Mobile (Android/iOS)</option>
                    <option value="PC (Steam)">PC (Steam)</option>
                    <option value="Console (PS/Xbox)">Console (PS/Xbox)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Price (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    value={editingId.price || ''}
                    onChange={(e) => setEditingId({ ...editingId, price: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Original Price (৳)</label>
                  <input
                    type="number"
                    value={editingId.originalPrice || ''}
                    onChange={(e) => setEditingId({ ...editingId, originalPrice: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Overall (OVR)</label>
                  <input
                    type="number"
                    required
                    value={editingId.overallRating || 99}
                    onChange={(e) => setEditingId({ ...editingId, overallRating: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Account Level</label>
                  <input
                    type="number"
                    value={editingId.accountLevel || 50}
                    onChange={(e) => setEditingId({ ...editingId, accountLevel: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Coins Balance</label>
                  <input
                    type="number"
                    value={editingId.coinBalance || 0}
                    onChange={(e) => setEditingId({ ...editingId, coinBalance: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">GP / Currency Balance</label>
                  <input
                    type="number"
                    value={editingId.gpBalance || 0}
                    onChange={(e) => setEditingId({ ...editingId, gpBalance: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Star Players (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingId.rarePlayers) ? editingId.rarePlayers.join(', ') : ''}
                  onChange={(e) =>
                    setEditingId({
                      ...editingId,
                      rarePlayers: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  placeholder="e.g. Big Time Messi, Booster Haaland, Epic Vieira"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Special Cards Summary (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingId.specialCards) ? editingId.specialCards.join(', ') : ''}
                  onChange={(e) =>
                    setEditingId({
                      ...editingId,
                      specialCards: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  placeholder="e.g. 15 Epic Cards, 22 Highlights, 4 Show Time"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingId.description || ''}
                  onChange={(e) => setEditingId({ ...editingId, description: e.target.value })}
                  placeholder="Full squad description, login provider details, and manager info."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Status</label>
                  <select
                    value={editingId.status || 'available'}
                    onChange={(e) => setEditingId({ ...editingId, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold Out</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featuredId"
                    checked={Boolean(editingId.featured)}
                    onChange={(e) => setEditingId({ ...editingId, featured: e.target.checked })}
                    className="rounded text-emerald-400"
                  />
                  <label htmlFor="featuredId" className="text-neutral-300 font-medium">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl"
              >
                Save Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit / Add Coin Package */}
      {isCoinModalOpen && editingCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsCoinModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">
              {editingCoin.id ? 'Edit Coin Package' : 'Create Coin Package'}
            </h3>

            <form onSubmit={handleSaveCoinPackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Coin Amount</label>
                <input
                  type="number"
                  required
                  value={editingCoin.coinAmount || ''}
                  onChange={(e) => setEditingCoin({ ...editingCoin, coinAmount: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Price (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    value={editingCoin.price || ''}
                    onChange={(e) => setEditingCoin({ ...editingCoin, price: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Original Price (৳)</label>
                  <input
                    type="number"
                    value={editingCoin.originalPrice || ''}
                    onChange={(e) =>
                      setEditingCoin({ ...editingCoin, originalPrice: Number(e.target.value) })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Discount %</label>
                <input
                  type="number"
                  value={editingCoin.discount || 0}
                  onChange={(e) => setEditingCoin({ ...editingCoin, discount: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Delivery Info</label>
                <input
                  type="text"
                  value={editingCoin.deliveryInfo || ''}
                  onChange={(e) => setEditingCoin({ ...editingCoin, deliveryInfo: e.target.value })}
                  placeholder="e.g. 10 - 20 mins delivery via Player ID"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Status</label>
                <select
                  value={editingCoin.status || 'active'}
                  onChange={(e) => setEditingCoin({ ...editingCoin, status: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl"
              >
                Save Package
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
