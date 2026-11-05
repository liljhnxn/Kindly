"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useReadContract, useAccount, useWatchContractEvent } from "wagmi";
import {
  KINDLY_ABI,
  HelpRequestItem,
  RequestStatus,
  DEFAULT_CONTRACT_ADDRESS,
} from "@/config/contract";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ExploreRequests } from "@/components/ExploreRequests";
import { MyRequests } from "@/components/MyRequests";
import { CreateRequestModal } from "@/components/CreateRequestModal";
import { RequestDetailsModal } from "@/components/RequestDetailsModal";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const [contractAddress] = useState<`0x${string}`>(() => {
    return (
      (process.env.NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS as `0x${string}`) ||
      DEFAULT_CONTRACT_ADDRESS
    );
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Read all requests directly from the Kindly smart contract
  const {
    data: rawRequests,
    isLoading,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: KINDLY_ABI,
    functionName: "getAllRequests",
    query: {
      enabled: Boolean(contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000"),
      refetchInterval: 12000, // Poll every 12s for latest on-chain state
    },
  });

  // Watch for smart contract events to automatically refetch
  useWatchContractEvent({
    address: contractAddress,
    abi: KINDLY_ABI,
    eventName: "RequestCreated",
    onLogs() {
      refetch();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: KINDLY_ABI,
    eventName: "VolunteerAssigned",
    onLogs() {
      refetch();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: KINDLY_ABI,
    eventName: "RequestCompleted",
    onLogs() {
      refetch();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: KINDLY_ABI,
    eventName: "RequestCancelled",
    onLogs() {
      refetch();
    },
  });

  // Transform raw contract tuples into typed HelpRequestItem list
  const requests: HelpRequestItem[] = useMemo(() => {
    if (!rawRequests || !Array.isArray(rawRequests)) return [];

    return (rawRequests as any[]).map((r) => ({
      id: BigInt(r.id),
      requester: r.requester as `0x${string}`,
      title: String(r.title),
      description: String(r.description),
      category: String(r.category),
      volunteer: r.volunteer as `0x${string}`,
      createdAt: BigInt(r.createdAt),
      status: Number(r.status) as RequestStatus,
    }));
  }, [rawRequests]);

  // Aggregate community stats
  const totalRequests = requests.length;
  const completedRequests = requests.filter(
    (r) => r.status === RequestStatus.Completed
  ).length;
  const openRequests = requests.filter(
    (r) => r.status === RequestStatus.Open
  ).length;

  const handleSelectRequest = useCallback((req: HelpRequestItem) => {
    setSelectedRequest(req);
    setIsDetailsModalOpen(true);
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTxSuccess = () => {
    refetch();
    // Also update selectedRequest if details modal is open
    if (selectedRequest) {
      setTimeout(() => {
        refetch().then((res) => {
          if (res.data && Array.isArray(res.data)) {
            const found = (res.data as any[]).find(
              (r) => BigInt(r.id) === selectedRequest.id
            );
            if (found) {
              setSelectedRequest({
                id: BigInt(found.id),
                requester: found.requester as `0x${string}`,
                title: String(found.title),
                description: String(found.description),
                category: String(found.category),
                volunteer: found.volunteer as `0x${string}`,
                createdAt: BigInt(found.createdAt),
                status: Number(found.status) as RequestStatus,
              });
            }
          }
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 text-charcoal-900 selection:bg-forest-100 selection:text-forest-900">
      {/* 1. Header / Navigation */}
      <Navbar
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onNavigate={handleScrollToSection}
      />

      {/* Contract address unconfigured alert banner if needed */}
      {(!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 text-center text-xs font-medium">
          Kindly contract is ready to deploy! Run <code className="bg-amber-200/80 px-1.5 py-0.5 rounded font-mono font-semibold">npm run deploy</code> to deploy to Botchain Testnet and set <code className="bg-amber-200/80 px-1.5 py-0.5 rounded font-mono font-semibold">NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS</code>.
        </div>
      )}

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          totalRequests={totalRequests}
          completedRequests={completedRequests}
          openRequests={openRequests}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          onExplore={() => handleScrollToSection("explore")}
        />

        {/* 3. Explore Requests Section */}
        <ExploreRequests
          requests={requests}
          isLoading={isLoading}
          onSelectRequest={handleSelectRequest}
          onSuccess={handleTxSuccess}
          contractAddress={contractAddress}
        />

        {/* 4. My Requests Section */}
        <MyRequests
          requests={requests}
          isLoading={isLoading}
          onSelectRequest={handleSelectRequest}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          onSuccess={handleTxSuccess}
          contractAddress={contractAddress}
        />
      </main>

      {/* 5. Modals */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTxSuccess}
        contractAddress={contractAddress}
      />

      <RequestDetailsModal
        request={selectedRequest}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onSuccess={handleTxSuccess}
        contractAddress={contractAddress}
      />

      {/* 6. Footer */}
      <Footer contractAddress={contractAddress} />
    </div>
  );
}

