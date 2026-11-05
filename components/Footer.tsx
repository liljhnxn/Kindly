"use client";

import React from "react";
import { HeartHandshake, ExternalLink, ShieldCheck } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

interface FooterProps {
  contractAddress: string;
}

export function Footer({ contractAddress }: FooterProps) {
  const isAddressConfigured =
    contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000";

  return (
    <footer className="bg-forest-950 text-ivory-100/90 pt-16 pb-12 border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-forest-900/80">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-800 text-ivory-50 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-terracotta-400" />
              </div>
              <span className="serif-heading text-2xl font-bold text-white tracking-tight">
                Kindly
              </span>
            </div>
            <p className="text-sm text-forest-200/70 max-w-sm leading-relaxed">
              Small Requests. Real Help. An on-chain community mutual aid protocol built for real human connections without middlemen or fees.
            </p>
          </div>

          {/* Network Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-forest-300">
              Botchain Testnet Network
            </h4>
            <ul className="space-y-2 text-xs text-forest-200/80">
              <li className="flex items-center justify-between py-1 border-b border-forest-900/60">
                <span className="text-forest-400">Chain ID:</span>
                <span className="font-mono text-white font-medium">968</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-forest-900/60">
                <span className="text-forest-400">RPC Endpoint:</span>
                <a
                  href="https://rpc.bohr.life"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-terracotta-300 hover:underline flex items-center gap-1"
                >
                  <span>rpc.bohr.life</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-forest-900/60">
                <span className="text-forest-400">Block Explorer:</span>
                <a
                  href="https://scan.bohr.life"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-terracotta-300 hover:underline flex items-center gap-1"
                >
                  <span>scan.bohr.life</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Smart Contract Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-forest-300">
              Smart Contract Architecture
            </h4>
            <div className="p-4 rounded-2xl bg-forest-900/60 border border-forest-800 space-y-2">
              <div className="flex items-center gap-2 text-xs text-forest-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Single Immutable Contract: Kindly.sol</span>
              </div>
              <div className="pt-1">
                <p className="text-[11px] text-forest-400">Contract Address:</p>
                {isAddressConfigured ? (
                  <a
                    href={`https://scan.bohr.life/address/${contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-terracotta-300 hover:underline flex items-center gap-1 mt-0.5 truncate"
                  >
                    <span>{shortenAddress(contractAddress, 6)}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-forest-400 font-mono italic">
                    Configured via environment variable
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-300/60">
          <p>© {new Date().getFullYear()} Kindly. Small Requests. Real Help. 100% On-chain.</p>
          <p>Decentralized Community Platform</p>
        </div>
      </div>
    </footer>
  );
}

