import type { Metadata } from "next";
import NetworkEvolutionClient from "./NetworkEvolutionClient";

export const metadata: Metadata = {
  title: "พื้นฐานเครือข่าย 1G–5G | Mobile Network Classroom",
  description:
    "บทเรียนภาษาไทยเรื่องวิวัฒนาการ GSM, CDMA, LTE, LTE-Advanced, 5G NR และบทบาทของ 3GPP กับ ITU",
  alternates: {
    canonical: "/network-evolution",
  },
  openGraph: {
    title: "พื้นฐานเครือข่าย 1G–5G",
    description: "จากเสียงแอนะล็อก สู่ 5G NR และบทบาทขององค์กรกำหนดมาตรฐาน",
    type: "article",
    url: "/network-evolution",
    images: [{ url: "/og.png", width: 1731, height: 907 }],
  },
};

export default function NetworkEvolutionPage() {
  return <NetworkEvolutionClient />;
}
