"use client";

import React from "react";
import { Sparkles, Heart, CheckCircle2, ArrowRight, ShieldCheck, Users } from "lucide-react";

interface HeroProps {
  totalRequests: number;
  completedRequests: number;
  openRequests: number;
  onOpenCreate: () => void;
  onExplore: () => void;
}

export function Hero({
  totalRequests,
  completedRequests,
  openRequests,
  onOpenCreate,
  onExplore,
}: HeroProps) {
  return (
    <section id="hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-forest-100/50 via-ivory-100/40 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-medium shadow-soft">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Decentralized Mutual Aid & Community Support</span>
          </div>

          {/* Headline */}
          <h1 className="serif-heading text-4xl sm:text-5xl md:text-6xl font-bold text-forest-950 tracking-tight leading-[1.15]">
            Someone out there <br className="hidden sm:inline" />
            <span className="italic font-normal text-terracotta-600">can help.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-charcoal-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Share what you need, connect with people willing to help, and make small acts of kindness count.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenCreate}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-base font-semibold shadow-lifted hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              <span>Create a Request</span>
              <ArrowRight className="w-4 h-4 text-terracotta-300" />
            </button>

            <button
              onClick={onExplore}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-ivory-100 text-forest-900 border border-ivory-300 hover:border-forest-300 text-base font-semibold shadow-soft hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              <span>Explore Requests</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-forest-600" />
              100% On-Chain Records
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-terracotta-500" />
              Zero Platform Fees
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-forest-600" />
              Botchain Testnet
            </span>
          </div>
        </div>

        {/* Live Metrics Counter Cards */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="p-5 md:p-6 rounded-3xl bg-white border border-ivory-200 shadow-soft text-center group hover:border-forest-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-forest-50 text-forest-700 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-forest-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-forest-950 font-serif">
              {totalRequests}
            </div>
            <div className="text-xs sm:text-sm font-medium text-charcoal-500 mt-1">
              Total Requests
            </div>
          </div>

          <div className="p-5 md:p-6 rounded-3xl bg-white border border-ivory-200 shadow-soft text-center group hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-forest-950 font-serif">
              {completedRequests}
            </div>
            <div className="text-xs sm:text-sm font-medium text-charcoal-500 mt-1">
              Acts of Kindness Completed
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 p-5 md:p-6 rounded-3xl bg-white border border-ivory-200 shadow-soft text-center group hover:border-terracotta-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-50 text-terracotta-600 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-terracotta-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-forest-950 font-serif">
              {openRequests}
            </div>
            <div className="text-xs sm:text-sm font-medium text-charcoal-500 mt-1">
              Requests Open for Help
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

