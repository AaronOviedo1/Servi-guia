import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asistente de Emergencias",
  description:
    "Chatbot que te guía paso a paso durante emergencias domésticas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
