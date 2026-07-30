import type { Metadata } from "next";
import RfLessonClient from "./RfLessonClient";
import "./rf-modulation.css";

export const metadata: Metadata = {
  title: "พื้นฐาน RF และ Digital Modulation | Mobile Network Classroom",
  description:
    "บทเรียนภาษาไทยเรื่อง Time/Frequency Domain, Carrier, ASK, PSK, FSK, QPSK, QAM, Constellation Diagram, FDD/TDD, OFDM, OFDMA, SC-FDMA และ DSS",
  alternates: {
    canonical: "/rf-modulation",
  },
  openGraph: {
    title: "พื้นฐาน RF และ Digital Modulation",
    description: "จากคลื่นพาห์ สู่การแบ่งทรัพยากรคลื่น",
    type: "article",
    url: "/rf-modulation",
    images: [{ url: "/og.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "พื้นฐาน RF และ Digital Modulation",
    description: "จากคลื่นพาห์ สู่การแบ่งทรัพยากรคลื่น",
    images: ["/og.png"],
  },
};

export default function RfModulationPage() {
  return <RfLessonClient />;
}
