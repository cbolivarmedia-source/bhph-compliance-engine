import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BHPH Compliance Engine",
  description: "Buy Here Pay Here compliance management",
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
