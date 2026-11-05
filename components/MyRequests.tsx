"use client";

import React, { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  HelpRequestItem,
  KINDLY_ABI,
  RequestStatus,
  DEFAULT_CONTRACT_ADDRESS,
} from "@/config/contract";
import {
  shortenAddress,
  formatDate,
  getStatusInfo,
  getCategoryBadgeClass,
} from "@/lib/utils";
import {
  UserCheck,
  HandHeart,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  User,
  Plus,
  Wallet,
  Inbox,
} from "lucide-react";

interface MyRequestsProps {
  requests: HelpRequestItem[];
  isLoading: boolean;
  onSelectRequest: (request: HelpRequestItem) => void;
  onOpenCreate: () => void;
  onSuccess: () => void;
  contractAddress: `0x${string}`;
}

export function MyRequests({
  requests,
  isLoading,
  onSelectRequest,
  onOpenCreate,
  onSuccess,
  contractAddress,
}: MyRequestsProps) {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"created" | "volunteered">("created");
  const [actingRequestId, setActingRequestId] = useState<bigint | null>(null);

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
      setActingRequestId(null);
      resetWrite();
    }
  }, [isConfirmed]);

  const myCreatedRequests = React.useMemo(() => {
    if (!address) return [];
    return requests
      .filter((r) => r.requester.toLowerCase() === address.toLowerCase())
      .reverse();
  }, [requests, address]);

  const myVolunteeredRequests = React.useMemo(() => {
    if (!address) return [];
    return requests
      .filter(
        (r) =>
          r.volunteer &&
          r.volunteer !== "0x0000000000000000000000000000000000000000" &&
          r.volunteer.toLowerCase() === address.toLowerCase()
      )
      .reverse();
  }, [requests, address]);

  const handleCancel = (e: React.MouseEvent, req: HelpRequestItem) => {
    e.stopPropagation();
    setActingRequestId(req.id);
    const targetAddress = contractAddress || DEFAULT_CONTRACT_ADDRESS;
    writeContract({
      address: targetAddress,
      abi: KINDLY_ABI,
      functionName: "cancelRequest",
      args: [req.id],
    });
  };

  const handleComplete = (e: React.MouseEvent, req: HelpRequestItem) => {
    e.stopPropagation();
    setActingRequestId(req.id);
    const targetAddress = contractAddress || DEFAULT_CONTRACT_ADDRESS;
    writeContract({
      address: targetAddress,
      abi: KINDLY_ABI,
      functionName: "completeRequest",
      args: [req.id],
    });
  };

  return (
    <section id="my-requests" className="py-16 bg-white border-t border-ivory-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-700 mb-1">
              <UserCheck className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Personal Dashboard</span>
            </div>
            <h2 className="serif-heading text-3xl font-bold text-forest-950">
              My Requests & Contributions
            </h2>
            <p className="text-sm text-charcoal-500 mt-1">
              Track your open needs and community tasks you have volunteered for.
            </p>
          </div>

          {isConnected && (
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold shadow-soft hover:shadow-lifted transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-terracotta-300" />
              <span>New Request</span>
            </button>
          )}
        </div>

        {/* Wallet Not Connected State */}
        {!isConnected ? (
          <div className="py-16 px-6 max-w-lg mx-auto bg-ivory-50 rounded-3xl border border-ivory-300 text-center shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-forest-100 text-forest-800 mx-auto flex items-center justify-center mb-4">
              <Wallet className="w-7 h-7 text-forest-700" />
            </div>
            <h3 className="serif-heading text-xl font-bold text-forest-950 mb-2">
              Connect Your MetaMask Wallet
            </h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-6">
              Connect to Botchain Testnet to manage your requests, mark volunteers as completed, or review the help you promised to provide.
            </p>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex items-center gap-3 border-b border-ivory-200 mb-6">
              <button
                onClick={() => setActiveTab("created")}
                className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "created"
                    ? "border-forest-800 text-forest-950"
                    : "border-transparent text-charcoal-400 hover:text-charcoal-700"
                }`}
              >
                <span>Created by Me</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 font-mono">
                  {myCreatedRequests.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("volunteered")}
                className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "volunteered"
                    ? "border-forest-800 text-forest-950"
                    : "border-transparent text-charcoal-400 hover:text-charcoal-700"
                }`}
              >
                <HandHeart className="w-4 h-4 text-terracotta-500" />
                <span>I Volunteered For</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800 font-mono">
                  {myVolunteeredRequests.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Created by Me */}
            {activeTab === "created" && (
              <div>
                {myCreatedRequests.length === 0 ? (
                  <div className="py-14 px-4 bg-ivory-50/60 rounded-3xl border border-dashed border-ivory-300 text-center max-w-md mx-auto">
                    <Inbox className="w-10 h-10 text-charcoal-400 mx-auto mb-3" />
                    <h3 className="serif-heading text-lg font-bold text-forest-950">
                      No requests published yet
                    </h3>
                    <p className="text-xs text-charcoal-500 mt-1 mb-5">
                      Need assistance with education, tech, design, or local tasks? Submit a request!
                    </p>
                    <button
                      onClick={onOpenCreate}
                      className="px-5 py-2.5 rounded-full bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900 transition-colors"
                    >
                      Create Request Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {myCreatedRequests.map((req) => {
                      const statusInfo = getStatusInfo(req.status);
                      const isActing =
                        actingRequestId === req.id && (isSubmitting || isConfirming);
                      const hasVolunteer =
                        req.volunteer &&
                        req.volunteer !== "0x0000000000000000000000000000000000000000";

                      return (
                        <div
                          key={req.id.toString()}
                          onClick={() => onSelectRequest(req)}
                          className="bg-ivory-50/40 hover:bg-white rounded-3xl border border-ivory-200 hover:border-forest-300 p-6 shadow-soft hover:shadow-lifted transition-all flex flex-col justify-between cursor-pointer"
                        >
                          <div>
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

                            <h3 className="serif-heading text-lg font-bold text-forest-950 line-clamp-1 mb-2">
                              {req.title}
                            </h3>

                            <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed mb-4">
                              {req.description}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-ivory-200 space-y-3">
                            <div className="flex items-center justify-between text-xs text-charcoal-500">
                              <div className="flex items-center gap-1.5">
                                <HandHeart className="w-3.5 h-3.5 text-terracotta-500" />
                                <span>
                                  {hasVolunteer
                                    ? `Volunteer: ${shortenAddress(req.volunteer)}`
                                    : "No volunteer yet"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-charcoal-400">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(req.createdAt)}</span>
                              </div>
                            </div>

                            {/* Actions for Requester */}
                            <div className="flex items-center gap-2 pt-1">
                              {req.status === RequestStatus.Open && (
                                <button
                                  onClick={(e) => handleCancel(e, req)}
                                  disabled={isActing}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-charcoal-100 hover:bg-red-50 text-charcoal-700 hover:text-red-700 border border-charcoal-200 hover:border-red-300 text-xs font-medium transition-colors"
                                >
                                  {isActing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )}
                                  <span>Cancel Request</span>
                                </button>
                              )}

                              {req.status === RequestStatus.InProgress && (
                                <button
                                  onClick={(e) => handleComplete(e, req)}
                                  disabled={isActing}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-ivory-50 text-xs font-semibold shadow-soft transition-all"
                                >
                                  {isActing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                  <span>Mark Completed</span>
                                </button>
                              )}

                              {req.status === RequestStatus.Completed && (
                                <div className="w-full text-center py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                                  Completed & Verified
                                </div>
                              )}

                              {req.status === RequestStatus.Cancelled && (
                                <div className="w-full text-center py-1.5 text-xs text-charcoal-400 bg-charcoal-50 rounded-xl">
                                  Cancelled
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Volunteered By Me */}
            {activeTab === "volunteered" && (
              <div>
                {myVolunteeredRequests.length === 0 ? (
                  <div className="py-14 px-4 bg-ivory-50/60 rounded-3xl border border-dashed border-ivory-300 text-center max-w-md mx-auto">
                    <HandHeart className="w-10 h-10 text-terracotta-400 mx-auto mb-3" />
                    <h3 className="serif-heading text-lg font-bold text-forest-950">
                      You haven't volunteered yet
                    </h3>
                    <p className="text-xs text-charcoal-500 mt-1 mb-5">
                      Check out open requests on the community board and offer your help!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {myVolunteeredRequests.map((req) => {
                      const statusInfo = getStatusInfo(req.status);

                      return (
                        <div
                          key={req.id.toString()}
                          onClick={() => onSelectRequest(req)}
                          className="bg-ivory-50/40 hover:bg-white rounded-3xl border border-ivory-200 hover:border-forest-300 p-6 shadow-soft hover:shadow-lifted transition-all flex flex-col justify-between cursor-pointer"
                        >
                          <div>
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

                            <h3 className="serif-heading text-lg font-bold text-forest-950 line-clamp-1 mb-2">
                              {req.title}
                            </h3>

                            <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed mb-4">
                              {req.description}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-ivory-200 space-y-3">
                            <div className="flex items-center justify-between text-xs text-charcoal-500">
                              <div className="flex items-center gap-1.5 font-mono">
                                <User className="w-3.5 h-3.5 text-forest-600" />
                                <span>Requester: {shortenAddress(req.requester)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-charcoal-400">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(req.createdAt)}</span>
                              </div>
                            </div>

                            <div className="pt-1">
                              {req.status === RequestStatus.InProgress ? (
                                <div className="text-center py-2 px-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
                                  You are assigned to assist with this task
                                </div>
                              ) : req.status === RequestStatus.Completed ? (
                                <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Task completed & thank you for helping!</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

