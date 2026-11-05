"use client";

import React, { useEffect } from "react";
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
  X,
  User,
  Calendar,
  HandHeart,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

interface RequestDetailsModalProps {
  request: HelpRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contractAddress: `0x${string}`;
}

export function RequestDetailsModal({
  request,
  isOpen,
  onClose,
  onSuccess,
  contractAddress,
}: RequestDetailsModalProps) {
  const { address, isConnected } = useAccount();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

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

  useEffect(() => {
    if (isConfirmed) {
      onSuccess();
      const timer = setTimeout(() => {
        handleClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed]);

  if (!isOpen || !request) return null;

  const handleClose = () => {
    resetWrite();
    onClose();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isRequester =
    isConnected &&
    address &&
    request.requester.toLowerCase() === address.toLowerCase();

  const isVolunteer =
    isConnected &&
    address &&
    request.volunteer &&
    request.volunteer !== "0x0000000000000000000000000000000000000000" &&
    request.volunteer.toLowerCase() === address.toLowerCase();

  const hasVolunteer =
    request.volunteer &&
    request.volunteer !== "0x0000000000000000000000000000000000000000";

  const targetAddress = contractAddress || DEFAULT_CONTRACT_ADDRESS;

  const handleVolunteer = () => {
    writeContract({
      address: targetAddress,
      abi: KINDLY_ABI,
      functionName: "volunteer",
      args: [request.id],
    });
  };

  const handleComplete = () => {
    writeContract({
      address: targetAddress,
      abi: KINDLY_ABI,
      functionName: "completeRequest",
      args: [request.id],
    });
  };

  const handleCancel = () => {
    writeContract({
      address: targetAddress,
      abi: KINDLY_ABI,
      functionName: "cancelRequest",
      args: [request.id],
    });
  };

  const statusInfo = getStatusInfo(request.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-forest-950/45 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-lifted border border-ivory-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-ivory-200 bg-ivory-50/60">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                  request.category
                )}`}
              >
                {request.category}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                {statusInfo.label}
              </span>
            </div>
            <h2 className="serif-heading text-xl font-bold text-forest-950 leading-snug">
              {request.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Action Success / Error Status */}
          {isConfirmed && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">Transaction confirmed on Botchain!</span>
            </div>
          )}

          {(submitError || confirmError) && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="overflow-hidden">
                <p className="font-semibold">Action Failed</p>
                <p className="text-[11px] text-red-700 truncate mt-0.5">
                  {submitError?.message || confirmError?.message || "Transaction was rejected or failed."}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
              Request Details
            </h3>
            <p className="text-sm text-charcoal-800 leading-relaxed whitespace-pre-wrap bg-ivory-50/70 p-4 rounded-2xl border border-ivory-200">
              {request.description}
            </p>
          </div>

          {/* Meta Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Requester */}
            <div className="p-3.5 rounded-2xl bg-white border border-ivory-200 space-y-1">
              <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                <User className="w-3.5 h-3.5 text-forest-700" />
                <span>Requester</span>
                {isRequester && (
                  <span className="text-[10px] bg-forest-100 text-forest-800 px-1.5 py-0.2 rounded font-semibold">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-charcoal-800 font-medium">
                  {shortenAddress(request.requester, 5)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyToClipboard(request.requester, "requester")}
                    className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded transition-colors"
                    title="Copy Address"
                  >
                    {copiedField === "requester" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`https://scan.bohr.life/address/${request.requester}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-charcoal-400 hover:text-forest-700 rounded transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Volunteer */}
            <div className="p-3.5 rounded-2xl bg-white border border-ivory-200 space-y-1">
              <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                <HandHeart className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Assigned Volunteer</span>
                {isVolunteer && (
                  <span className="text-[10px] bg-terracotta-100 text-terracotta-800 px-1.5 py-0.2 rounded font-semibold">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-charcoal-800 font-medium">
                  {hasVolunteer ? shortenAddress(request.volunteer, 5) : "Waiting for helper..."}
                </span>
                {hasVolunteer && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(request.volunteer, "volunteer")}
                      className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded transition-colors"
                      title="Copy Address"
                    >
                      {copiedField === "volunteer" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={`https://scan.bohr.life/address/${request.volunteer}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-charcoal-400 hover:text-forest-700 rounded transition-colors"
                      title="View on Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Date Created */}
            <div className="p-3.5 rounded-2xl bg-white border border-ivory-200 space-y-1">
              <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-forest-700" />
                <span>Published On</span>
              </div>
              <p className="font-medium text-charcoal-800 pt-1">
                {formatDate(request.createdAt)}
              </p>
            </div>

            {/* On-chain ID */}
            <div className="p-3.5 rounded-2xl bg-white border border-ivory-200 space-y-1">
              <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
                <span className="font-mono font-bold text-forest-800">#</span>
                <span>Request ID</span>
              </div>
              <p className="font-mono font-semibold text-charcoal-800 pt-1">
                #{request.id.toString()}
              </p>
            </div>
          </div>

          {/* Contextual Action Buttons */}
          <div className="pt-2">
            {/* 1. If Open and caller is NOT requester -> Volunteer button */}
            {request.status === RequestStatus.Open && !isRequester && (
              <button
                onClick={handleVolunteer}
                disabled={isSubmitting || isConfirming || isConfirmed || !isConnected}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-forest-800 hover:bg-forest-900 disabled:bg-charcoal-300 text-ivory-50 text-sm font-semibold shadow-soft hover:shadow-lifted transition-all"
              >
                {(isSubmitting || isConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {!isConnected
                    ? "Connect Wallet to Volunteer"
                    : isSubmitting
                    ? "Confirm in MetaMask..."
                    : isConfirming
                    ? "Recording Volunteer on Botchain..."
                    : "Volunteer to Assist"}
                </span>
              </button>
            )}

            {/* 2. If caller IS requester and status is Open -> Cancel Request */}
            {request.status === RequestStatus.Open && isRequester && (
              <button
                onClick={handleCancel}
                disabled={isSubmitting || isConfirming || isConfirmed}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-charcoal-100 hover:bg-red-50 text-charcoal-800 hover:text-red-700 border border-charcoal-200 hover:border-red-300 text-sm font-semibold transition-all"
              >
                {(isSubmitting || isConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
                <XCircle className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Confirm in MetaMask..."
                    : isConfirming
                    ? "Cancelling on Botchain..."
                    : "Cancel This Request"}
                </span>
              </button>
            )}

            {/* 3. If caller IS requester and status is InProgress -> Complete Request */}
            {request.status === RequestStatus.InProgress && isRequester && (
              <button
                onClick={handleComplete}
                disabled={isSubmitting || isConfirming || isConfirmed}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-charcoal-300 text-ivory-50 text-sm font-semibold shadow-soft hover:shadow-lifted transition-all"
              >
                {(isSubmitting || isConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Confirm in MetaMask..."
                    : isConfirming
                    ? "Finalizing on Botchain..."
                    : "Mark Request as Completed"}
                </span>
              </button>
            )}

            {/* Notice if completed */}
            {request.status === RequestStatus.Completed && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center text-xs font-medium text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>This act of kindness has been successfully fulfilled and recorded!</span>
              </div>
            )}

            {/* Notice if cancelled */}
            {request.status === RequestStatus.Cancelled && (
              <div className="p-3.5 rounded-2xl bg-charcoal-100/70 border border-charcoal-200 text-center text-xs font-medium text-charcoal-600">
                This request was cancelled by the requester.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

