import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RequestStatus } from "@/config/contract";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  if (address === "0x0000000000000000000000000000000000000000") return "None";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatDate(timestamp: bigint | number): string {
  if (!timestamp) return "Just now";
  const num = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const date = new Date(num * 1000);
  
  // Format readable date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusInfo(status: RequestStatus | number) {
  switch (status) {
    case RequestStatus.Open:
      return {
        label: "Open for Help",
        badgeClass: "bg-forest-100 text-forest-800 border-forest-200",
        dotClass: "bg-forest-600",
      };
    case RequestStatus.InProgress:
      return {
        label: "In Progress",
        badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
        dotClass: "bg-amber-500",
      };
    case RequestStatus.Completed:
      return {
        label: "Completed",
        badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
        dotClass: "bg-emerald-600",
      };
    case RequestStatus.Cancelled:
      return {
        label: "Cancelled",
        badgeClass: "bg-charcoal-100 text-charcoal-600 border-charcoal-200",
        dotClass: "bg-charcoal-400",
      };
    default:
      return {
        label: "Unknown",
        badgeClass: "bg-charcoal-100 text-charcoal-600 border-charcoal-200",
        dotClass: "bg-charcoal-400",
      };
  }
}

export function getCategoryBadgeClass(category: string) {
  switch (category.toLowerCase()) {
    case "education":
      return "bg-sky-50 text-sky-800 border-sky-200";
    case "technology":
      return "bg-indigo-50 text-indigo-800 border-indigo-200";
    case "design":
      return "bg-pink-50 text-pink-800 border-pink-200";
    case "personal assistance":
      return "bg-terracotta-50 text-terracotta-700 border-terracotta-200";
    case "community":
      return "bg-forest-50 text-forest-800 border-forest-200";
    default:
      return "bg-ivory-200 text-charcoal-700 border-ivory-300";
  }
}

