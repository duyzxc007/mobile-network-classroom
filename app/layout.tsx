import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mobile-network-classroom-th-v2.duyinw.chatgpt.site"),
  title: "Mobile Network Classroom | เรียนรู้เครือข่ายมือถืออย่างเป็นระบบ",
  description:
    "ศูนย์รวมบทเรียนภาษาไทยเรื่องวิวัฒนาการ 1G–5G, RF และ Digital Modulation, โครงสร้าง 5G NR, คุณภาพสัญญาณ และการเชื่อมต่อกับ Handover",
  openGraph: {
    title: "Mobile Network Classroom",
    description: "จาก 1G และพื้นฐาน RF ไปจนถึง 5G NR การวัดคุณภาพสัญญาณ และ Handover",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Network Classroom",
    description: "5 บทเรียนเครือข่ายมือถือภาษาไทย จากพื้นฐานถึงการเชื่อมต่อและ Handover",
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
