import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mobile-network-classroom-th-v2.duyinw.chatgpt.site"),
  title: "Mobile Network Classroom | เรียนรู้เครือข่ายมือถืออย่างเป็นระบบ",
  description:
    "ศูนย์รวมบทเรียนภาษาไทยเรื่องวิวัฒนาการ 1G–5G, RF, โครงสร้าง 5G NR, คุณภาพสัญญาณ, Mobility, 5G Core, Network Slicing และ Security",
  openGraph: {
    title: "Mobile Network Classroom",
    description: "จาก 1G และพื้นฐาน RF ไปจนถึง 5G NR, Mobility, 5G Core, Network Slicing และ Security",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Network Classroom",
    description: "6 บทเรียนเครือข่ายมือถือภาษาไทย จากพื้นฐานถึง 5G Core, Network Slicing และ Security",
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
