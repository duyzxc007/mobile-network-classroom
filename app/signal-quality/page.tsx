import type { Metadata } from "next";
import SignalQualityClient from "./SignalQualityClient";
import "./signal-quality.css";

export const metadata: Metadata = {
  title: "คุณภาพสัญญาณ, Beamforming และการวัดภาคสนาม | Mobile Network Classroom",
  description:
    "บทเรียนภาษาไทยเรื่อง RSRP, SS-RSRP, RSRQ, SINR, SISO, MIMO, Massive MIMO, SSB Index, Beam Coverage, PCI และความต่างระหว่าง Scanner กับโทรศัพท์",
  alternates: {
    canonical: "/signal-quality",
  },
  openGraph: {
    title: "คุณภาพสัญญาณ, Beamforming และการวัดภาคสนาม",
    description: "อ่านค่าให้เป็น เห็นลำคลื่น และเลือกเครื่องมือวัดให้ตรงคำถาม",
    type: "article",
    url: "/signal-quality",
    images: [{ url: "/og-signal-quality.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "คุณภาพสัญญาณ, Beamforming และการวัดภาคสนาม",
    description: "RSRP, RSRQ, SINR, MIMO, Beam, PCI และ Scanner เทียบโทรศัพท์",
    images: ["/og-signal-quality.png"],
  },
};

export default function SignalQualityPage() {
  return <SignalQualityClient />;
}
