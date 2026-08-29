import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const hud = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hud",
});

export const metadata: Metadata = {
  title: "Eyewall Labs",
  description:
    "Official website of Eyewall Labs. The channel is live. Work will transmit from this scope.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hud.variable} h-full`}>
      <body className={`${hud.className} min-h-full`}>{children}</body>
    </html>
  );
}
