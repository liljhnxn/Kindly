"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { botchainTestnet } from "@/config/chain";
import { shortenAddress } from "@/lib/utils";
import { Wallet, LogOut, ExternalLink, Copy, Check, AlertTriangle, Plus, HeartHandshake } from "lucide-react";

interface NavbarProps {
  onOpenCreate: () => void;
  onNavigate: (sectionId: string) => void;
}

export function Navbar({ onOpenCreate, onNavigate }: NavbarProps) {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== botchainTestnet.id;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = () => {
    // Prefer MetaMask / Injected
    const metaMaskConnector = connectors.find((c) => c.id === "metaMask") || connectors[0];
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-ivory-50/90 backdrop-blur-md border-b border-ivory-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate("hero")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-forest-800 text-ivory-50 flex items-center justify-center shadow-soft group-hover:bg-forest-700 transition-colors">
            <HeartHandshake className="w-6 h-6 text-terracotta-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="serif-heading text-2xl font-bold text-forest-900 tracking-tight">
                Kindly
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200">
                Web3
              </span>
            </div>
            <p className="text-xs text-charcoal-500 font-medium">Small Requests. Real Help.</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-ivory-100/80 p-1.5 rounded-full border border-ivory-200">
          <button
            onClick={() => onNavigate("explore")}
            className="px-4 py-2 text-sm font-medium text-charcoal-700 hover:text-forest-800 hover:bg-white rounded-full transition-all"
          >
            Explore
          </button>
          <button
            onClick={() => onNavigate("my-requests")}
            className="px-4 py-2 text-sm font-medium text-charcoal-700 hover:text-forest-800 hover:bg-white rounded-full transition-all"
          >
            My Requests
          </button>
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-forest-800 bg-forest-100/70 hover:bg-forest-100 rounded-full transition-all"
          >
            <Plus className="w-4 h-4 text-forest-700" />
            <span>Create Request</span>
          </button>
        </nav>

        {/* Wallet Actions */}
        <div className="flex items-center gap-3">
          {/* Wrong Network Warning */}
          {isWrongNetwork && (
            <button
              onClick={() => switchChain({ chainId: botchainTestnet.id })}
              disabled={isSwitching}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{isSwitching ? "Switching..." : "Switch to Botchain"}</span>
            </button>
          )}

          {/* Network indicator pill when connected */}
          {isConnected && !isWrongNetwork && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-xs font-medium text-forest-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Botchain Testnet</span>
            </div>
          )}

          {/* Connect / Wallet button */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-sm font-medium transition-all shadow-soft hover:shadow-lifted active:scale-[0.98]"
            >
              <Wallet className="w-4 h-4 text-terracotta-300" />
              <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-ivory-300 hover:border-forest-400 text-charcoal-800 text-sm font-medium shadow-soft transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center text-xs font-semibold">
                  {address?.slice(2, 4).toUpperCase()}
                </div>
                <span>{shortenAddress(address)}</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-ivory-300 shadow-lifted p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-ivory-200 mb-2">
                      <p className="text-xs font-medium text-charcoal-500">Connected Wallet</p>
                      <p className="text-sm font-semibold text-charcoal-900 font-mono mt-0.5 truncate">
                        {address}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-charcoal-700 hover:bg-ivory-100 rounded-xl transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-charcoal-500" />
                          )}
                          {copied ? "Copied Address" : "Copy Address"}
                        </span>
                      </button>

                      <a
                        href={`https://scan.bohr.life/address/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-charcoal-700 hover:bg-ivory-100 rounded-xl transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-charcoal-500" />
                          View on Bohr Scan
                        </span>
                      </a>

                      {isWrongNetwork && (
                        <button
                          onClick={() => switchChain({ chainId: botchainTestnet.id })}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Switch to Botchain
                        </button>
                      )}

                      <button
                        onClick={() => {
                          disconnect();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

