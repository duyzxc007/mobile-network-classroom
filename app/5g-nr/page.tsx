import type { Metadata } from "next";
import NrLessonClient from "./NrLessonClient";
import "./5g-nr.css";

export const metadata: Metadata = {
  title: "โครงสร้างและช่องสัญญาณ 5G NR | Mobile Network Classroom",
  description:
    "บทเรียนภาษาไทยเรื่อง FR1/FR2, NSA/SA, Numerology, Subcarrier Spacing, Resource Grid, RB, RE, Bandwidth Part และ Physical Channels/Signals ของ 5G NR",
  alternates: {
    canonical: "/5g-nr",
  },
  openGraph: {
    title: "โครงสร้างและช่องสัญญาณ 5G NR",
    description: "จาก Spectrum และ Resource Grid สู่ Initial Access ของมือถือ",
    type: "article",
    url: "/5g-nr",
    images: [{ url: "/og-nr.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "โครงสร้างและช่องสัญญาณ 5G NR",
    description: "จาก Spectrum และ Resource Grid สู่ Initial Access ของมือถือ",
    images: ["/og-nr.png"],
  },
};

export default function NrLessonPage() {
  return <NrLessonClient />;
}
