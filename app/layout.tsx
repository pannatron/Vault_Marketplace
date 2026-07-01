import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PromoBar from "./components/PromoBar";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { CurrencyProvider } from "./components/CurrencyProvider";
import { getRates } from "./lib/fx";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Card Mania — Rip digital packs, own real graded cards",
  description:
    "Buy and sell vaulted, insured trading cards as digital packs. Pokémon, One Piece, sports — graded by PSA, CGC & BGS. Rip a pack, reveal the hit.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const rates = await getRates();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolage.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        <CurrencyProvider rates={rates}>
          <PromoBar />
          <div className="flex">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <main id="top" className="min-w-0 flex-1">
                {children}
              </main>
            </div>
          </div>
        </CurrencyProvider>
      </body>
    </html>
  );
}
