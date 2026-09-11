import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const shareDescription = "《满大人》是一部根据葡萄牙作家埃萨·德·凯罗斯同名小说改编的交互叙事游戏。如果你能让一个遥远国度的陌生人立刻死去，并继承他的千万遗产，你会毫不犹豫地杀掉这个素未谋面的人吗？那么，代价又会是什么呢？建议开启声音，并使用横屏或电脑游玩。";

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
    title: "《满大人》· 交互叙事",
    description: shareDescription,
    openGraph: {
      title: "《满大人》· 交互叙事",
      description: shareDescription,
      type: "website",
      locale: "zh_CN",
      images: [{ url: `${origin}/og.webp`, width: 1728, height: 906, alt: "《满大人》交互叙事游戏封面" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "《满大人》· 交互叙事",
      description: shareDescription,
      images: [`${origin}/og.webp`],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
