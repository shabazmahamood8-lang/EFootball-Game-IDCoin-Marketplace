import React from 'react';
import { Star, CheckCircle, MessageSquareQuote } from 'lucide-react';
import { IReview } from '../server/models/types.js';

interface ReviewsSectionProps {
  reviews: IReview[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  return (
    <section className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
            CUSTOMER REVIEWS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What Our Gamers Say
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Real feedback from tournament players and squad builders across Bangladesh.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 text-sm text-neutral-500 font-mono">
            No reviews yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{rev.userName}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono truncate max-w-[190px]">
                      {rev.product}
                    </div>
                  </div>
                  <MessageSquareQuote className="w-5 h-5 text-neutral-700" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
