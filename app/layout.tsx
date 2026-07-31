import type { Metadata } from "next";
import { Anuphan, Prompt } from "next/font/google";
import { OutdoorModeToggle, ReadingProgress } from "./components/LearningSupport";
import "./globals.css";

const bodyFont = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const headingFont = Prompt({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mobile-network-classroom-th-v2.duyinw.chatgpt.site"),
  title: "Mobile Network Classroom | เรียนรู้เครือข่ายมือถืออย่างเป็นระบบ",
  description:
    "บทเรียนเครือข่ายมือถือภาษาไทยแบบเข้าใจง่าย พร้อม TL;DR อุปมา สื่อโต้ตอบ และคู่มือภาคสนาม ตั้งแต่ 1G–5G ถึง 5G Core และ Security",
  openGraph: {
    title: "Mobile Network Classroom",
    description: "เรียนจากภาษาบ้าน ๆ ไปสู่รายละเอียด 1G–5G, RF, 5G NR, Mobility, Core, Slicing และ Security",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Network Classroom",
    description: "6 บทเรียนพร้อม TL;DR สื่อโต้ตอบ แบบทดสอบ และคู่มือภาคสนาม",
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
    <html lang="th" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        <ReadingProgress />
        {children}
        <OutdoorModeToggle />
      </body>
    </html>
  );
}
