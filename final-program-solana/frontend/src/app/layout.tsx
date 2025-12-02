import type { Metadata } from "next";
import { Space_Mono, Varela_Round } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

const varelaRound = Varela_Round({
  weight: "400",
  variable: "--font-varela-round",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ROTOR | Blockchain Time Capsules",
  description: "Securely lock messages and assets for the future.",
};

import { ToastProvider } from "@/components/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceMono.variable} ${varelaRound.variable} antialiased parallax-bg min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <WalletContextProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
