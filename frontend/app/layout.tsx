import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CNDD-FDD Section Maroc — Gestion des Membres",
  description: "Plateforme officielle de gestion du Bureau CNDD-FDD Section Maroc",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
