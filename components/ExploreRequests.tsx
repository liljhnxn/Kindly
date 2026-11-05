"use client";

import React, { useState, useMemo } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  HelpRequestItem,
  KINDLY_ABI,
  RequestStatus,
  CATEGORIES,
  Category,
  DEFAULT_CONTRACT_ADDRESS,
} from "@/config/contract";
import {
  shortenAddress,
  formatDate,
  getStatusInfo,
  getCategoryBadgeClass,
} from "@/lib/utils";
import {
  Search,
  Filter,
  HandHeart,
  ExternalLink,
  Loader2,
  Clock,
  User,
  CheckCircle,
  Inbox,
  ArrowUpDown,
} from "lucide-react";

interface ExploreRequestsProps {
  requests: HelpRequestItem[];
  isLoading: boolean;
  onSelectRequest: (request: HelpRequestItem) => void;
  onSuccess: () => void;
  contractAddress: `0x${string}`;
}

export function ExploreRequests({
  requests,
  isLoading,
  onSelectRequest,
  onSuccess,
  contractAddress,
}: ExploreRequestsProps) {
  const { address, isConnected } = useAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [volunteeringId, setVolunteeringId] = useState<bigint | null>(null);

  const {
    writeContract,
    data: txHash,
    isPending: isSubmitting,
    error: submitError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  React.useEffect(() => {
    if (isConfirmed) {
      onSuccess();
      setVolunteeringId(null);
      resetWrite();
    }
  }, [isConfirmed]);

  const handleVolunteerQuick = (e: React.MouseEvent, req: HelpRequestItem) => {
    e.stopPropagation();
    if (!isConnected) return;
    setVolunteeringId(req.id);
    const targetAddress = contractAddress || DEFAULT_CONTRACT_ADDRESS;
    writeContract({
      address: targetAddress,
      abi: KINDLY_ABI,
      functionName: "volunteer",
      args: [req.id],
    });
  };

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        // Search filter
        const matchesQuery =
          req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory =
          selectedCategory === "All" ||
          req.category.toLowerCase() === selectedCategory.toLowerCase();

        // Status filter
        let matchesStatus = true;
        if (selectedStatus === "Open") matchesStatus = req.status === RequestStatus.Open;
        else if (selectedStatus === "InProgress")
          matchesStatus = req.status === RequestStatus.InProgress;
        else if (selectedStatus === "Completed")
          matchesStatus = req.status === RequestStatus.Completed;

        return matchesQuery && matchesCategory && matchesStatus;
      })
      .reverse(); // Newest first
  }, [requests, searchQuery, selectedCategory, selectedStatus]);

  return (
    <section id="explore" className="py-16 bg-ivory-50/50 border-t border-ivory-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-700 mb-1">
              <Filter className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Community Board</span>
            </div>
            <h2 className="serif-heading text-3xl font-bold text-forest-950">
              Explore Help Requests
            </h2>
            <p className="text-sm text-charcoal-500 mt-1">
              Browse small tasks where your skills and time can make a difference.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-charcoal-900 placeholder-charcoal-400 shadow-soft"
            />
          </div>
        </div>

        {/* Filters bar */}
        <div className="space-y-3 mb-8">
          {/* Categories pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                selectedCategory === "All"
                  ? "bg-forest-800 text-ivory-50 shadow-soft"
                  : "bg-white text-charcoal-600 border border-ivory-300 hover:border-forest-300"
              }`}
            >
              All Categories ({requests.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = requests.filter(
                (r) => r.category.toLowerCase() === cat.toLowerCase()
              ).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-forest-800 text-ivory-50 shadow-soft"
                      : "bg-white text-charcoal-600 border border-ivory-300 hover:border-forest-300"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-charcoal-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Status:
            </span>
            {["All", "Open", "InProgress", "Completed"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedStatus === st
                    ? "bg-forest-100 text-forest-900 font-semibold"
                    : "text-charcoal-500 hover:text-charcoal-800 hover:bg-ivory-200"
                }`}
              >
                {st === "InProgress" ? "In Progress" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-charcoal-500">
            <Loader2 className="w-8 h-8 animate-spin text-forest-700 mb-3" />
            <p className="text-sm font-medium">Fetching requests from Botchain...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 px-4 bg-white rounded-3xl border border-ivory-200 text-center max-w-md mx-auto shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-forest-600" />
            </div>
            <h3 className="serif-heading text-lg font-bold text-forest-950">No requests found</h3>
            <p className="text-xs text-charcoal-500 mt-1 mb-4">
              {searchQuery || selectedCategory !== "All" || selectedStatus !== "All"
                ? "Try adjusting your search or category filters."
                : "No help requests have been submitted yet. Be the first to start!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRequests.map((req) => {
              const statusInfo = getStatusInfo(req.status);
              const isRequester =
                isConnected &&
                address &&
                req.requester.toLowerCase() === address.toLowerCase();
              const isCurrentVolunteering =
                volunteeringId === req.id && (isSubmitting || isConfirming);

              return (
                <div
                  key={req.id.toString()}
                  onClick={() => onSelectRequest(req)}
                  className="group bg-white rounded-3xl border border-ivory-200 hover:border-forest-400 p-6 shadow-soft hover:shadow-lifted hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                          req.category
                        )}`}
                      >
                        {req.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="serif-heading text-lg font-bold text-forest-950 group-hover:text-forest-700 transition-colors line-clamp-1 mb-2">
                      {req.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed mb-4">
                      {req.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-ivory-200 space-y-3">
                    {/* Requester & Timestamp */}
                    <div className="flex items-center justify-between text-xs text-charcoal-500">
                      <div className="flex items-center gap-1.5 font-mono">
                        <User className="w-3.5 h-3.5 text-forest-600" />
                        <span>{shortenAddress(req.requester)}</span>
                        {isRequester && (
                          <span className="text-[10px] bg-forest-100 text-forest-800 font-sans font-semibold px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-charcoal-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Volunteer Card Button */}
                    {req.status === RequestStatus.Open && !isRequester ? (
                      <button
                        onClick={(e) => handleVolunteerQuick(e, req)}
                        disabled={isCurrentVolunteering || !isConnected}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:bg-charcoal-300 text-ivory-50 text-xs font-medium shadow-soft transition-all"
                      >
                        {isCurrentVolunteering ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Confirming...</span>
                          </>
                        ) : (
                          <>
                            <HandHeart className="w-3.5 h-3.5 text-terracotta-300" />
                            <span>Volunteer to Help</span>
                          </>
                        )}
                      </button>
                    ) : req.status === RequestStatus.Completed ? (
                      <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed Act of Kindness</span>
                      </div>
                    ) : req.status === RequestStatus.InProgress ? (
                      <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        <span className="font-medium">Volunteer assigned</span>
                        <span className="font-mono text-[11px]">
                          {shortenAddress(req.volunteer)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-1 text-xs text-charcoal-400">
                        View details
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

