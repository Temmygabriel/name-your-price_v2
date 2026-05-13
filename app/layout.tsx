import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Name Your Price",
  description: "A price-guessing party game on GenLayer. Vote FAIR, OVERPRICED, or STEAL. AI judges your instincts.",
  openGraph: {
    title: "Name Your Price",
    description: "Multiplayer price-guessing game. AI judges every verdict. Instant on-chain results.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
