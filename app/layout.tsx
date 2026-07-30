import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mobile-network-classroom-th.duyinw.chatgpt.site"),
  title: "พื้นฐานเครือข่าย 1G–5G | Mobile Network Classroom",
  description:
    "บทเรียนภาษาไทยเรื่องวิวัฒนาการ GSM, CDMA, LTE, LTE-Advanced, 5G NR และบทบาทของ 3GPP กับ ITU",
  openGraph: {
    title: "Mobile Network Classroom",
    description: "สื่อการสอนภาษาไทยเรื่องเครือข่ายมือถือและพื้นฐาน RF",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
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
