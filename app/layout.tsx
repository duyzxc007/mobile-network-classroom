import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "พื้นฐานเครือข่าย 1G–5G | Mobile Network Classroom",
  description:
    "บทเรียนภาษาไทยเรื่องวิวัฒนาการ GSM, CDMA, LTE, LTE-Advanced, 5G NR และบทบาทของ 3GPP กับ ITU",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
