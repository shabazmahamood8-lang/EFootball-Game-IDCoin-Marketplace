import React, { useState } from 'react';
import { X, Shield, Lock, Mail, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalMode === 'login') {
      await login(email, password);
    } else {
      await register(name, email, password, phone);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    await login(userEmail, userPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Subtle Pitch Green Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {authModalMode === 'login'
              ? 'Access your orders, saved IDs, and coin deliveries'
              : 'Join Bangladesh’s trusted football gaming marketplace'}
          </p>
        </div>

        {/* Quick Demo Credentials Access */}
        {authModalMode === 'login' && (
          <div className="mb-5 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs space-y-2">
            <span className="text-[11px] font-mono text-emerald-400 block uppercase tracking-wider font-semibold">
              Instant Demo Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('buyer@footballstore.com', 'buyer123456')}
                className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg text-neutral-200 text-left transition-colors flex items-center justify-between"
              >
                <span>Buyer Demo</span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@footballstore.com', 'admin123456')}
                className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200 text-left transition-colors flex items-center justify-between"
              >
                <span>Admin Demo</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex border-b border-neutral-800 mb-5">
          <button
            type="button"
            onClick={() => setAuthModalMode('login')}
            className={`flex-1 pb-2.5 text-sm font-semibold transition-all border-b-2 ${
              authModalMode === 'login'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('register')}
            className={`flex-1 pb-2.5 text-sm font-semibold transition-all border-b-2 ${
              authModalMode === 'register'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Phone / WhatsApp (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoading
              ? 'Processing...'
              : authModalMode === 'login'
              ? 'Sign In to Account'
              : 'Create My Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Encrypted & Secure Database</span>
          </p>
        </div>
      </div>
    </div>
  );
};
