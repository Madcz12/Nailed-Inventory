import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Nailed Inventory | Panel de Control",
  description: "Plataforma de inventario para productos de belleza - Nailed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
