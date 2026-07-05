import { Tajawal } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "عدالة — مساعد قانوني ذكي",
  description: "منصة ذكاء اصطناعي قانونية باللغة العربية",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} antialiased`}>{children}</body>
    </html>
  );
}
