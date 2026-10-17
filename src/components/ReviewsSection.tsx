import React from 'react';
import { storeConfig } from '../config/storeConfig';
import { MessageSquare, ShieldCheck, Star } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { reviews } = storeConfig;
  const hasReviews = reviews.items && reviews.items.length > 0;

  return (
    <section id="reviews-section" className="py-24 bg-[#0D0F12] border-t border-[#1E2126]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3 mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent block">
            Verified Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Customer<br />
            <span className="bg-gradient-to-r from-[#F6C58D] via-[#EAA968] to-[#CF9258] bg-clip-text text-transparent">
              Reviews.
            </span>
          </h2>
          <p className="text-base text-[#9AA1AD] leading-relaxed font-normal pt-2">
            Transparent community feedback from verified travelers.
          </p>
        </div>

        {hasReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reviews.items.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#131518] border border-[#202328] rounded-3xl p-7 space-y-4"
              >
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'opacity-20'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-white leading-relaxed">
                  "{rev.comment}"
                </p>
                <div className="pt-4 border-t border-[#1E2126] flex items-center justify-between text-xs text-[#8E95A2]">
                  <span className="font-semibold text-white">{rev.author}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Neutral Honest Placeholder (Strict adherence to zero fake reviews) */
          <div className="max-w-xl mx-auto bg-[#131518] border border-[#202328] rounded-3xl p-10 sm:p-14 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1A1D22] border border-[#2B3037] flex items-center justify-center text-accent shadow-inner">
              <MessageSquare className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-wide">
              {reviews.emptyStateMessage}
            </h3>

            <p className="text-sm text-[#9AA1AD] max-w-md mx-auto leading-relaxed">
              {reviews.emptyStateSubtext}
            </p>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-[#8E95A2] font-medium">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Zero fabricated ratings or artificial testimonials policy</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
