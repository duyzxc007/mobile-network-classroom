import type { Metadata } from "next";
import MobilityLessonClient from "./MobilityLessonClient";
import "./mobility.css";

export const metadata: Metadata = {
  title: "การเชื่อมต่อและการเคลื่อนที่ในเครือข่าย 4G/5G | Mobile Network Classroom",
  description:
    "บทเรียนภาษาไทยเรื่อง Cell Search, Cell Selection/Reselection, Random Access, Registration, RRC State, Handover, Event A3 และการวิเคราะห์ปัญหา Mobility",
  alternates: {
    canonical: "/mobility",
  },
  openGraph: {
    title: "จากเปิดเครื่องจนถึง Handover",
    description: "ตามเส้นทางที่โทรศัพท์ค้นหา เลือก เชื่อมต่อ และเปลี่ยน Cell ในเครือข่าย 4G/5G",
    type: "article",
    url: "/mobility",
    images: [{ url: "/og-mobility.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "จากเปิดเครื่องจนถึง Handover",
    description: "Cell Search, Registration, RRC, Random Access และ Mobility แบบเห็นภาพ",
    images: ["/og-mobility.png"],
  },
};

export default function MobilityLessonPage() {
  return <MobilityLessonClient />;
}
