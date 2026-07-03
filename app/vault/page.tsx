import type { Metadata } from "next";
import VaultView from "../components/vault/VaultView";
import Footer from "../components/Footer";
import { IconShield } from "../components/Icons";

export const metadata: Metadata = {
  title: "My Vault — your collection | Card Mania",
  description:
    "The cards you've ripped and kept — vaulted, valued, and ready to trade or redeem.",
};

export default function VaultPage() {
  return (
    <>
      <div className="mx-auto max-w-[1080px] px-5 pt-6 sm:px-8">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-[clamp(1.8rem,4.5vw,2.6rem)] font-extrabold leading-none tracking-tight">
            My Vault
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-primary">
            <IconShield width={12} height={12} />
            Vaulted &amp; insured
          </span>
        </header>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Every card you keep from a rip lands here — held in your vault, valued at
          live market prices. Trade it instantly or redeem the physical card.
        </p>

        <VaultView />
      </div>

      <Footer />
    </>
  );
}
