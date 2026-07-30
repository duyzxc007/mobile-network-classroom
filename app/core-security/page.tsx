import type { Metadata } from "next";
import CoreSecurityLessonClient from "./CoreSecurityLessonClient";
import "./core-security.css";

export const metadata: Metadata = {
  title: "5G Core, Network Slicing และความปลอดภัย | Mobile Network Classroom",
  description:
    "บทเรียนภาษาไทยเรื่อง AMF, SMF, UPF, Network Slicing, QoS Flow, Edge Computing, SIM Authentication, Encryption, SUPI/SUCI และสถานีฐานปลอม",
  alternates: {
    canonical: "/core-security",
  },
  openGraph: {
    title: "5G Core, Slicing & Security",
    description: "ตามเส้นทาง Control Plane, User Plane และกุญแจความปลอดภัยของ 5G",
    type: "article",
    url: "/core-security",
    images: [{ url: "/og-core-security.png", width: 1731, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "5G Core, Slicing & Security",
    description: "AMF, SMF, UPF, QoS Flow, Edge, 5G-AKA, SUCI และการรับมือสถานีฐานปลอม",
    images: ["/og-core-security.png"],
  },
};

export default function CoreSecurityLessonPage() {
  return <CoreSecurityLessonClient />;
}
