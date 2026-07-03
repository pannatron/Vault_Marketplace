import type { CategoryKey, Pull, Rarity } from "./types";

/**
 * Local, no-backend "vault" — the cards a visitor has ripped and kept, stored
 * in localStorage so the collection persists across visits on this device.
 * A stand-in for real ownership until there's an account + ledger behind it.
 */
export interface VaultCard {
  id: string;
  card: string;
  set: string;
  rarity: Rarity;
  category: CategoryKey;
  grade: string;
  value: number;
  pack: string;
  /** ms epoch when it was added */
  acquiredAt: number;
}

const KEY = "cm_vault_v1";
const CAP = 300;

/** dispatched after a write so open views can refresh */
export const VAULT_EVENT = "cm:vault";

export function getVault(): VaultCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as VaultCard[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addToVault(pull: Pull): void {
  if (typeof window === "undefined") return;
  const card: VaultCard = {
    id: `${pull.id}-${Date.now()}`,
    card: pull.card,
    set: pull.set,
    rarity: pull.rarity,
    category: pull.category,
    grade: pull.grade,
    value: pull.value,
    pack: pull.pack,
    acquiredAt: Date.now(),
  };
  const next = [card, ...getVault()].slice(0, CAP);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(VAULT_EVENT));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function vaultTotals(cards: VaultCard[]): { count: number; value: number } {
  return {
    count: cards.length,
    value: cards.reduce((sum, c) => sum + (c.value || 0), 0),
  };
}
