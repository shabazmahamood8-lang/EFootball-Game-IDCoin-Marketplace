import React, { useState } from 'react';
import { Shield, Coins, User as UserIcon, LogOut, LayoutDashboard, Settings, Menu, X, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSelectIdForDetail?: (id: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAdmin, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 group-hover:bg-emerald-500/20 transition-all duration-200">
            <Shield className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-none">
              FOOTBALL <span className="text-emerald-400">ID STORE</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase block mt-0.5">
              Verified Accounts & Coins
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single-line, quiet typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <button
            onClick={() => handleNav('home')}
            className={`transition-colors hover:text-white ${currentTab === 'home' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('ids')}
            className={`transition-colors hover:text-white ${currentTab === 'ids' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Football IDs
          </button>
          <button
            onClick={() => handleNav('coins')}
            className={`flex items-center gap-1.5 transition-colors hover:text-white ${currentTab === 'coins' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            Buy Coins
          </button>
          <button
            onClick={() => {
              handleNav('home');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="transition-colors hover:text-white"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              handleNav('home');
              setTimeout(() => {
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="transition-colors hover:text-white"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNav('contact')}
            className={`transition-colors hover:text-white ${currentTab === 'contact' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                    currentTab === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-amber-300 hover:border-amber-500/30'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => handleNav('dashboard')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dashboard</span>
              </button>
              <div className="h-4 w-px bg-neutral-800" />
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={() => handleNav('dashboard')}
              className="p-1.5 text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
              aria-label="User Dashboard"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950 px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentTab === 'home' ? 'bg-emerald-500/10 text-emerald-400' : 'text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('ids')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentTab === 'ids' ? 'bg-emerald-500/10 text-emerald-400' : 'text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            Football IDs
          </button>
          <button
            onClick={() => handleNav('coins')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${
              currentTab === 'coins' ? 'bg-emerald-500/10 text-emerald-400' : 'text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            <span>Buy Coins</span>
            <span className="text-xs text-amber-400 font-mono">1K - 100K</span>
          </button>
          <button
            onClick={() => {
              handleNav('home');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-900 rounded-lg transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              handleNav('home');
              setTimeout(() => {
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-900 rounded-lg transition-colors"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNav('contact')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentTab === 'contact' ? 'bg-emerald-500/10 text-emerald-400' : 'text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            Contact Support
          </button>

          <div className="pt-3 border-t border-neutral-800/80 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-neutral-900 rounded-lg flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Customer Dashboard</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-amber-400 hover:bg-neutral-900 rounded-lg flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-400 hover:bg-neutral-900 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout ({user.email})</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2 text-center text-sm font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="w-full py-2 text-center text-sm font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
