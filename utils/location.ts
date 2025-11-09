import type { Apartment } from "@/context/ApartmentsContext";

export function hasGardenOrBalcony(apt: Apartment): boolean {
  try {
    const arr = JSON.parse(apt.LabelsJson || "[]") as Array<{ value?: string } | string>;
    const vals = arr.map((x) => (typeof x === "string" ? x : x.value || "")?.toLowerCase());
    return vals.includes("garden") || vals.includes("balcony");
  } catch {
    return false;
  }
}

export function normalizeString(str: string | undefined | null): string {
  if (!str) return "";
  return str.replace(/[\s\-–"׳"]/g, "").toLowerCase();
}

export function extractCityFromAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(",");
  if (parts.length >= 2) return parts[parts.length - 2].trim();
  return parts[0].trim();
}

export function extractStreetFromAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(",");
  return parts[0].trim();
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}