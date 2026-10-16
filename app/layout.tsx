import { asset } from "./asset-path";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./pt-PT.css";

const shareDescription = "Uma narrativa interativa adaptada de O Mandarim, de Eça de Queirós. Se pudesses matar um desconhecido num país distante e herdar a sua fortuna, tocarias a campainha? E qual seria o preço? Joga com som, num computador ou com o telemóvel na horizontal.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") || host.includes("[::1]") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "O Mandarim · Narrativa interativa",
    description: shareDescription,
    openGraph: {
      title: "O Mandarim · Narrativa interativa",
      description: shareDescription,
      type: "website",
      locale: "pt_PT",
      images: [{ url: `${origin}${asset("og.webp")}`, width: 1728, height: 906, alt: "Capa da narrativa interativa O Mandarim" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "O Mandarim · Narrativa interativa",
      description: shareDescription,
      images: [`${origin}${asset("og.webp")}`],
    },
    icons: {
      icon: asset("/favicon.svg"),
      shortcut: asset("/favicon.svg"),
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
