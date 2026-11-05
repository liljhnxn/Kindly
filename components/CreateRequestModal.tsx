"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { KINDLY_ABI, CATEGORIES, Category, DEFAULT_CONTRACT_ADDRESS } from "@/config/contract";
import { X, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contractAddress: `0x${string}`;
}

export function CreateRequestModal({
  isOpen,
  onClose,
  onSuccess,
  contractAddress,
}: CreateRequestModalProps) {
  const { isConnected } = useAccount();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Community");
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("Community");
    setValidationError(null);
    resetWrite();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isConnected) {
      setValidationError("Please connect your MetaMask wallet before publishing a request.");
      return;
    }

    if (!title.trim()) {
      setValidationError("Please provide a title for your request.");
      return;
    }

    if (title.trim().length < 5) {
      setValidationError("Title should be at least 5 characters long.");
      return;
    }

    if (title.trim().length > 120) {
      setValidationError("Title is too long (maximum 120 characters).");
      return;
    }

    if (!description.trim()) {
      setValidationError("Please explain what kind of assistance you need.");
      return;
    }

    if (description.trim().length < 15) {
      setValidationError("Description is a bit too short. Please add a little more detail (at least 15 characters).");
      return;
    }

    const targetAddress = contractAddress || DEFAULT_CONTRACT_ADDRESS;
    if (targetAddress === "0x0000000000000000000000000000000000000000") {
      setValidationError("Contract address not configured. Please check the network deployment.");
      return;
    }

    writeContract({
      address: targetAddress,
      abi: KINDLY_ABI,
      functionName: "createRequest",
      args: [title.trim(), description.trim(), category],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-lifted border border-ivory-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ivory-200 bg-ivory-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-terracotta-500" />
            </div>
            <div>
              <h2 className="serif-heading text-lg font-bold text-forest-950">Create a Help Request</h2>
              <p className="text-xs text-charcoal-500">Record your request permanently on Botchain</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Banner */}
          {isConfirmed && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">Request published successfully!</p>
                <p className="text-xs text-emerald-700 mt-0.5">Your request is now live for volunteers.</p>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Contract / Tx Error */}
          {(submitError || confirmError) && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="overflow-hidden">
                <p className="font-semibold">Transaction Failed</p>
                <p className="text-[11px] text-red-700 truncate mt-0.5">
                  {submitError?.message || confirmError?.message || "User rejected or failed transaction."}
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="req-title" className="text-xs font-semibold text-charcoal-700">
                Request Title <span className="text-terracotta-500">*</span>
              </label>
              <span className="text-[11px] text-charcoal-400">{title.length}/120</span>
            </div>
            <input
              id="req-title"
              type="text"
              maxLength={120}
              placeholder="e.g. Need assistance setting up an email newsletter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-600 text-sm text-charcoal-900 placeholder-charcoal-400 bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="req-category" className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Category <span className="text-terracotta-500">*</span>
            </label>
            <select
              id="req-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-600 text-sm text-charcoal-900 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="req-desc" className="text-xs font-semibold text-charcoal-700">
                Detailed Description <span className="text-terracotta-500">*</span>
              </label>
              <span className="text-[11px] text-charcoal-400">{description.length} chars</span>
            </div>
            <textarea
              id="req-desc"
              rows={4}
              placeholder="Provide context on what you need, estimated time commitment, and any tools required..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-600 text-sm text-charcoal-900 placeholder-charcoal-400 bg-white resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isConfirming}
              className="px-5 py-2.5 text-xs font-medium text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isConfirming || isConfirmed}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 disabled:bg-charcoal-300 text-ivory-50 text-xs font-semibold shadow-soft hover:shadow-lifted transition-all"
            >
              {(isSubmitting || isConfirming) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? "Confirm in Wallet..."
                  : isConfirming
                  ? "Writing to Botchain..."
                  : isConfirmed
                  ? "Published!"
                  : "Publish Request"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

