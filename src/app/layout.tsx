import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eyewall Labs",
  description: "Eyewall Labs is under construction.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white">{children}</body>
    </html>
  );
}
