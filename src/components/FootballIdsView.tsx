import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, Shield, Sparkles, RefreshCw, X } from 'lucide-react';
import { IFootballID } from '../server/models/types.js';
import { FootballIdCard } from './FootballIdCard';

interface FootballIdsViewProps {
  onViewDetails: (item: IFootballID) => void;
}

export const FootballIdsView: React.FC<FootballIdsViewProps> = ({ onViewDetails }) => {
  const [items, setItems] = useState<IFootballID[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [region, setRegion] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (platform !== 'all') params.append('platform', platform);
      if (region !== 'all') params.append('region', region);
      if (minRating !== 'all') params.append('overallRating', minRating);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (availability !== 'all') params.append('availability', availability);
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/ids?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.ids || []);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  }, [search, platform, region, minRating, minPrice, maxPrice, availability, sort]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const clearFilters = () => {
    setSearch('');
    setPlatform('all');
    setRegion('all');
    setMinRating('all');
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setSort('featured');
  };

  const hasActiveFilters =
    Boolean(search) ||
    platform !== 'all' ||
    region !== 'all' ||
    minRating !== 'all' ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    availability !== 'all';

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Kicker */}
      <div className="mb-8">
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
          OFFICIAL VERIFIED LISTINGS
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Football Game IDs Marketplace
        </h1>
        <p className="mt-1 text-sm text-neutral-400 max-w-2xl">
          Browse verified eFootball and EA FC Mobile accounts with maxed team ratings, booster legends, and ready-to-play squads.
        </p>
      </div>

      {/* Search & Main Filter Controls Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by squad name, player (Messi, Mbappé, Haaland), or game..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-emerald-400"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden px-3 py-2 bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-xl text-xs flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className={`grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-neutral-800/80 ${showMobileFilters ? 'block' : 'hidden sm:grid'}`}>
          {/* Platform */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-2 font-mono focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Platforms</option>
              <option value="Mobile">Mobile (iOS / Android)</option>
              <option value="PC">PC (Steam)</option>
              <option value="Console">Console (PS/Xbox)</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-2 font-mono focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Regions</option>
              <option value="Global">Global</option>
              <option value="Asia">Asia</option>
            </select>
          </div>

          {/* Min OVR */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Min OVR Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-2 font-mono focus:outline-none focus:border-emerald-400"
            >
              <option value="all">Any Rating</option>
              <option value="98">98+ OVR</option>
              <option value="100">100+ OVR</option>
              <option value="102">102+ OVR</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-2 font-mono focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Listings</option>
              <option value="available">Available Only</option>
              <option value="sold">Sold Out Only</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Price (৳ BDT)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-1/2 bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2 py-2 font-mono placeholder-neutral-600 focus:outline-none focus:border-emerald-400"
              />
              <span className="text-neutral-600">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-1/2 bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2 py-2 font-mono placeholder-neutral-600 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400">Filters applied ({items.length} accounts found)</span>
            <button
              onClick={clearFilters}
              className="text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-sm font-mono text-neutral-400">Loading football squad listings...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <Shield className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No football IDs match your criteria</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Try adjusting your search terms, minimum OVR rating, or price parameters to find available accounts.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <FootballIdCard
              key={item.id}
              item={item}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
