"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BeginnerBridge, QuizSummary } from "../components/LearningSupport";

type Generation = {
  id: number;
  years: string;
  title: string;
  subtitle: string;
  promise: string;
  radio: string;
  network: string;
  services: string;
  examples: string;
  takeaway: string;
};

const generations: Generation[] = [
  {
    id: 1,
    years: "ราว ค.ศ. 1980",
    title: "1G",
    subtitle: "โทรศัพท์ไร้สายแบบแอนะล็อก",
    promise: "ทำให้การโทรศัพท์เคลื่อนที่เกิดขึ้นจริงในวงกว้าง",
    radio: "เสียงแอนะล็อก และการแบ่งช่องความถี่แบบ FDMA",
    network: "เครือข่ายแยกตามประเทศหรือภูมิภาค ความเข้ากันได้ยังต่ำ",
    services: "โทรศัพท์เสียงเป็นหลัก แทบไม่มีบริการข้อมูล",
    examples: "AMPS, NMT, TACS",
    takeaway:
      "1G พิสูจน์ว่ามือถือใช้งานได้จริง แต่ความจุต่ำ คุณภาพเสียงแปรผัน และป้องกันการดักฟังได้ไม่ดี",
  },
  {
    id: 2,
    years: "ราว ค.ศ. 1990",
    title: "2G",
    subtitle: "โลกดิจิทัล GSM และ CDMA",
    promise: "เพิ่มจำนวนผู้ใช้ คุณภาพเสียง ความปลอดภัย และเปิดทางให้ SMS",
    radio: "GSM ใช้ FDMA/TDMA ส่วน IS-95 ใช้ CDMA แบบ Spread Spectrum",
    network: "ระบบดิจิทัล มีการยืนยันตัวตนและบริหารผู้ใช้เป็นระบบมากขึ้น",
    services: "เสียงดิจิทัล, SMS และข้อมูลความเร็วต่ำผ่าน GPRS/EDGE",
    examples: "GSM, IS-95 cdmaOne, GPRS, EDGE",
    takeaway:
      "2G ไม่ได้มีเส้นทางเดียว โลกแบ่งเป็นตระกูล GSM และ CDMA ก่อนจะค่อย ๆ รวมทิศทางเข้าหาเครือข่ายข้อมูล",
  },
  {
    id: 3,
    years: "ราว ค.ศ. 2000",
    title: "3G",
    subtitle: "อินเทอร์เน็ตเริ่มอยู่ในโทรศัพท์",
    promise: "รองรับข้อมูลเคลื่อนที่จริงจัง พร้อมเสียงและวิดีโอคอล",
    radio: "UMTS/WCDMA และ cdma2000 เป็นเทคโนโลยีหลักในกลุ่ม IMT-2000",
    network: "ผสมโลก Circuit-switched สำหรับเสียง กับ Packet-switched สำหรับข้อมูล",
    services: "เว็บบนมือถือ, อีเมล, วิดีโอคอล และ Mobile Broadband ยุคแรก",
    examples: "UMTS, WCDMA, HSPA/HSPA+, cdma2000, EV-DO",
    takeaway:
      "3G เปลี่ยนมือถือจากเครื่องโทรศัพท์ให้กลายเป็นอุปกรณ์เชื่อมต่ออินเทอร์เน็ต แต่โครงข่ายยังซับซ้อนเพราะต้องรองรับทั้งเสียงแบบเดิมและข้อมูล",
  },
  {
    id: 4,
    years: "ราว ค.ศ. 2010",
    title: "4G",
    subtitle: "บรอดแบนด์มือถือแบบ All-IP",
    promise: "ทำให้วิดีโอ แอป และบริการข้อมูลตอบสนองได้ใกล้เคียงอินเทอร์เน็ตบ้าน",
    radio: "LTE ใช้ OFDMA ใน Downlink และ SC-FDMA ใน Uplink",
    network: "Evolved Packet Core หรือ EPC เน้นการรับส่งแบบ Packet และ IP",
    services: "สตรีมวิดีโอ, แอปเรียลไทม์, VoLTE และ Mobile Broadband ความเร็วสูง",
    examples: "LTE Release 8, LTE-Advanced Release 10 และหลังจากนั้น",
    takeaway:
      "LTE วางฐาน 4G ส่วน LTE-Advanced เพิ่ม Carrier Aggregation, MIMO และความสามารถที่ผ่านเกณฑ์ IMT-Advanced ของ ITU",
  },
  {
    id: 5,
    years: "ราว ค.ศ. 2020",
    title: "5G",
    subtitle: "เครือข่ายสำหรับคน เครื่องจักร และอุตสาหกรรม",
    promise: "รองรับความต้องการที่แตกต่างกันมาก ทั้งความเร็วสูง ความหน่วงต่ำ และอุปกรณ์จำนวนมาก",
    radio: "5G NR ใช้ OFDM ที่ยืดหยุ่น รองรับหลายย่านความถี่และ Beamforming",
    network: "ทำงานได้ทั้ง NSA ที่พึ่ง LTE และ SA ที่ใช้ 5G Core เต็มรูปแบบ",
    services: "eMBB, URLLC, mMTC, Network Slicing, Edge และบริการอุตสาหกรรม",
    examples: "3GPP Release 15 เป็นต้นมา, 5G NR, 5GC",
    takeaway:
      "5G ไม่ใช่แค่ 4G ที่เร็วขึ้น แต่เป็นระบบที่ออกแบบให้ปรับเครือข่ายตามงาน ตั้งแต่มือถือทั่วไปจนถึงโรงงานและระบบวิกฤต",
  },
];

const quiz = [
  {
    question: "ข้อใดอธิบายความเปลี่ยนแปลงสำคัญจาก 1G ไป 2G ได้ดีที่สุด?",
    choices: [
      "เปลี่ยนจากเสียงแอนะล็อกเป็นระบบดิจิทัล",
      "เปลี่ยนจาก LTE เป็น 5G NR",
      "เริ่มใช้ Network Slicing",
    ],
    answer: 0,
    explain: "2G ทำให้การรับส่งเสียงและการควบคุมระบบเปลี่ยนเป็นดิจิทัล พร้อมเปิดทางให้ SMS",
  },
  {
    question: "GSM และ IS-95 แตกต่างกันเด่นที่สุดในเรื่องใด?",
    choices: [
      "GSM ไม่มีบริการเสียง",
      "GSM ใช้แนวทาง TDMA ส่วน IS-95 ใช้ CDMA",
      "IS-95 เป็นมาตรฐาน 5G",
    ],
    answer: 1,
    explain: "GSM แบ่งผู้ใช้ด้วยช่องความถี่และช่วงเวลา ขณะที่ IS-95 ใช้รหัสแยกผู้ใช้ในย่านความถี่ร่วมกัน",
  },
  {
    question: "เทคโนโลยีใดได้รับการยอมรับว่าเป็น IMT-Advanced?",
    choices: ["GSM", "LTE Release 8 ทุกกรณี", "LTE-Advanced"],
    answer: 2,
    explain: "ITU ระบุ LTE-Advanced เป็นหนึ่งในเทคโนโลยีที่ผ่านเกณฑ์ IMT-Advanced",
  },
  {
    question: "Release แรกที่วางมาตรฐาน 5G NR และ 5G System คือข้อใด?",
    choices: ["3GPP Release 8", "3GPP Release 10", "3GPP Release 15"],
    answer: 2,
    explain: "Release 15 เป็นชุดมาตรฐาน 5G ระยะแรก ครอบคลุมทั้ง NSA และ SA",
  },
  {
    question: "ข้อใดอธิบายบทบาท 3GPP และ ITU ได้ถูกต้อง?",
    choices: [
      "3GPP ออกใบอนุญาตคลื่นความถี่ให้ทุกประเทศ",
      "3GPP จัดทำสเปกระบบ ส่วน ITU วางกรอบ IMT และกระบวนการประเมินระดับโลก",
      "ITU เป็นผู้ผลิตสถานีฐาน 5G",
    ],
    answer: 1,
    explain: "ทั้งสององค์กรทำงานเชื่อมโยงกัน แต่มีบทบาทต่างกัน และหน่วยงานกำกับของแต่ละประเทศยังเป็นผู้จัดสรรคลื่นในประเทศ",
  },
];

const glossary = [
  ["FDMA", "แบ่งทรัพยากรด้วยช่องความถี่ ผู้ใช้แต่ละรายอยู่คนละช่วงความถี่"],
  ["TDMA", "แบ่งการใช้งานด้วยช่วงเวลา ผู้ใช้ผลัดกันส่งข้อมูลบนช่องสัญญาณ"],
  ["CDMA", "ให้ผู้ใช้หลายรายใช้เวลาและความถี่ร่วมกัน แล้วแยกด้วยรหัส"],
  ["OFDMA", "แบ่งช่องสัญญาณเป็น Subcarrier จำนวนมากและจัดสรรให้ผู้ใช้ได้ยืดหยุ่น"],
  ["Core Network", "ส่วนกลางของเครือข่ายที่จัดการผู้ใช้ การเคลื่อนที่ บริการ และเส้นทางข้อมูล"],
  ["RAN", "Radio Access Network ส่วนที่เชื่อมอุปกรณ์ผู้ใช้กับ Core Network ผ่านสถานีฐาน"],
  ["NSA", "5G แบบ Non-Standalone ใช้ 5G NR ร่วมกับโครงสร้าง LTE/EPC"],
  ["SA", "5G แบบ Standalone ใช้ 5G NR และ 5G Core เต็มรูปแบบ"],
];

function GenerationInteractiveDiagram({ genId }: { genId: number }) {
  const configs: Record<number, { title: string; badge: string; desc: string }> = {
    1: {
      title: "1G Analog Architecture",
      badge: "คลื่นเสียงแอนะล็อกต่อเนื่อง (AMPS / NMT)",
      desc: "เสียงถูกมอดูเลตแบบแอนะล็อกบนคลื่นวิทยุและแบ่งช่องด้วย FDMA ระบบยุคนั้นไม่มีการปกป้องแบบเครือข่ายดิจิทัลสมัยใหม่ จึงเสี่ยงต่อการดักฟัง",
    },
    2: {
      title: "2G Digital Architecture (GSM / cdmaOne)",
      badge: "เสียงและ Signalling แบบดิจิทัล",
      desc: "GSM ใช้ TDMA และ SIM ขณะที่ cdmaOne ใช้ Code Division และอาจจัดการตัวตนต่างกัน ทั้งสองตระกูลรองรับเสียงแบบ Circuit-Switched และบริการข้อความ/ข้อมูลตามระบบของตน",
    },
    3: {
      title: "3G IMT-2000 Architecture",
      badge: "อินเทอร์เน็ตบนมือถือ + WCDMA / HSPA",
      desc: "ผสานเครือข่ายโทรศัพท์ (Circuit-Switched) กับเครือข่ายอินเทอร์เน็ต (Packet-Switched) เพื่อเปิดเว็บและวิดีโอ",
    },
    4: {
      title: "4G All-IP Broadband Architecture",
      badge: "All-IP Packet Core (EPC) + OFDMA / MIMO",
      desc: "เครือข่ายส่งข้อมูลแบบ IP ทั้งหมด (VoLTE) ใช้เทคนิค OFDMA และเสาหลายแกน (MIMO) รองรับสตรีมมิงความเร็วสูง",
    },
    5: {
      title: "5G NR และ 5G Core แบบ Service-Based",
      badge: "5G SA: 5G NR + 5G Core",
      desc: "5G System รองรับความสามารถอย่าง eMBB, URLLC และ Massive IoT; Network Slice เป็นการแบ่งเชิงตรรกะตามบริการและอาจใช้โครงสร้างกายภาพร่วมกัน",
    },
  };

  const currentConfig = configs[genId] ?? configs[5];

  return (
    <div className="gen-interactive-diagram" style={{
      margin: "24px 0",
      padding: "24px",
      borderRadius: "20px",
      background: "var(--paper-strong)",
      border: "1px solid var(--line)",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span className="glow-badge" style={{ fontSize: "0.75rem", marginBottom: "6px", display: "inline-block" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--good)", display: "inline-block", marginRight: "6px" }}></span>
            {currentConfig.badge}
          </span>
          <h4 style={{ margin: "4px 0 0", fontSize: "1.15rem", color: "var(--ink)" }}>{currentConfig.title}</h4>
        </div>
        <span style={{ fontSize: "0.8rem", color: "var(--blue)", fontWeight: 700 }}>
          แบบจำลองเพื่อการสอน อ้างอิงกรอบ 3GPP / ITU
        </span>
      </div>

      <p style={{ fontSize: "0.95rem", color: "var(--ink-soft)", margin: "0 0 20px" }}>
        {currentConfig.desc}
      </p>

      {/* Visual Animation Stage */}
      <div className="gen-diagram-stage" style={{
        minHeight: "140px",
        borderRadius: "16px",
        background: "var(--paper)",
        border: "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "20px",
        position: "relative"
      }}>
        {genId === 1 && (
          <div className="demo-1g" style={{ display: "flex", alignItems: "center", gap: "24px", width: "100%", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--blue-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 800 }}>UE</div>
              <small style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>มือถือแอนะล็อก</small>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} style={{
                  width: "6px",
                  height: `${20 + ((i % 3) * 15)}px`,
                  background: "var(--accent-strong)",
                  borderRadius: "4px",
                  animation: "pulse-ring-glow 1.8s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`
                }} />
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "54px", height: "54px", borderRadius: "12px", background: "var(--ink)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 800 }}>BS</div>
              <small style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>สถานีฐาน (FDMA)</small>
            </div>
          </div>
        )}

        {genId === 2 && (
          <div className="demo-2g" style={{ display: "flex", alignItems: "center", gap: "20px", width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--blue-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 800 }}>ID</div>
              <small style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>SIM ใน GSM · วิธีอื่นใน cdmaOne</small>
            </div>
            <div style={{ flex: 1, display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              {["Slot A", "Slot B", "Slot C", "SMS #1"].map((label, idx) => (
                <div key={idx} style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: idx === 3 ? "var(--good)" : "var(--ink)",
                  color: idx === 3 ? "var(--ink)" : "var(--paper)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  animation: "pulse-ring-glow 2.5s ease-in-out infinite",
                  animationDelay: `${idx * 0.4}s`
                }}>
                  {label}
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "54px", height: "54px", borderRadius: "12px", background: "var(--ink)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 800 }}>MSC</div>
              <small style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>เครือข่ายสลับสาย</small>
            </div>
          </div>
        )}

        {genId === 3 && (
          <div className="demo-3g" style={{ display: "flex", alignItems: "center", gap: "20px", width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--blue-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 800 }}>3G</div>
              <small style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>มือถือ + เน็ต</small>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", background: "var(--paper-strong)", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, border: "1px solid var(--line)" }}>
                CS Domain (เสียงคอล)
              </div>
              <div style={{ padding: "8px", borderRadius: "8px", background: "var(--blue)", color: "var(--paper)", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, animation: "pulse-ring-glow 2.2s ease-in-out infinite" }}>
                PS Domain (เว็บ / อีเมล)
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "54px", height: "54px", borderRadius: "12px", background: "var(--ink)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 800 }}>RNC</div>
              <small style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>WCDMA Radio</small>
            </div>
          </div>
        )}

        {genId === 4 && (
          <div className="demo-4g" style={{ display: "flex", alignItems: "center", gap: "20px", width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--blue-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 800 }}>LTE</div>
              <small style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>VoLTE / HD Streaming</small>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              {["OFDMA Downlink", "All-IP Core (EPC)", "MIMO / Beamforming"].map((tag, idx) => (
                <span key={idx} style={{
                  padding: "8px 12px",
                  borderRadius: "99px",
                  background: "var(--ink)",
                  color: "var(--paper)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  animation: "pulse-ring-glow 3s ease-in-out infinite",
                  animationDelay: `${idx * 0.5}s`
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {genId === 5 && (
          <div className="demo-5g" style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            <div className="gen-slice-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { title: "eMBB", desc: "Mobile Broadband ความจุสูง", bg: "var(--blue-soft)", color: "var(--blue)" },
                { title: "URLLC", desc: "งานที่ออกแบบเพื่อความหน่วงต่ำและความเชื่อถือสูง", bg: "oklch(0.93 0.06 88)", color: "var(--accent-strong)" },
                { title: "Massive IoT", desc: "อุปกรณ์จำนวนมากและประหยัดพลังงาน", bg: "var(--paper-strong)", color: "var(--ink)" },
              ].map((slice, idx) => (
                <div key={idx} style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: slice.bg,
                  textAlign: "center",
                  border: "1px solid var(--line)",
                  animation: "pulse-ring-glow 2.8s ease-in-out infinite",
                  animationDelay: `${idx * 0.6}s`
                }}>
                  <strong style={{ display: "block", color: slice.color, fontSize: "0.95rem" }}>{slice.title}</strong>
                  <small style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>{slice.desc}</small>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--ink-soft)", marginTop: "4px" }}>
              ★ Slice เป็นเครือข่ายเชิงตรรกะและอาจใช้ RAN, Transport หรือ Core Platform ร่วมกัน ไม่ใช่วงจรกายภาพแยกเสมอ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NetworkEvolutionClient() {
  const [activeGeneration, setActiveGeneration] = useState(5);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const current =
    generations.find((generation) => generation.id === activeGeneration) ??
    generations[4];

  const score = useMemo(
    () =>
      quiz.reduce(
        (total, item, index) =>
          total + (answers[index] === item.answer ? 1 : 0),
        0,
      ),
    [answers],
  );

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="กลับสู่ด้านบน">
          <span className="brand-mark" aria-hidden="true">
            RF
          </span>
          <span>
            <strong>Mobile Network Classroom</strong>
            <small>บทเรียนที่ 01</small>
          </span>
        </a>
        <nav aria-label="หัวข้อในบทเรียน">
          <a href="#timeline">เส้นเวลา</a>
          <a href="#standards">มาตรฐาน</a>
          <Link href="/field-guide">คู่มือภาคสนาม</Link>
          <a href="#quiz">แบบทดสอบ</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">พื้นฐานเครือข่ายมือถือ 1G ถึง 5G</p>
          <h1>จากเสียงแอนะล็อก<br />สู่เครือข่ายอัจฉริยะ</h1>
          <p className="hero-lead">
            เรียนรู้ว่า GSM, CDMA, LTE, LTE-Advanced และ 5G NR
            เชื่อมต่อกันอย่างไร พร้อมเข้าใจบทบาทของ 3GPP และ ITU
            โดยไม่ต้องเริ่มจากศัพท์เทคนิคยาก ๆ
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#timeline">
              เริ่มเรียน
              <span aria-hidden="true">↓</span>
            </a>
            <span className="reading-time">ใช้เวลาประมาณ 20 นาที</span>
          </div>
        </div>

        <div className="signal-story" aria-label="ภาพรวมวิวัฒนาการเครือข่าย">
          <div className="signal-rings" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="generation-stack">
            {generations.map((generation) => (
              <span key={generation.id}>
                <b>{generation.title}</b>
                <small>{generation.years.replace("ราว ", "")}</small>
              </span>
            ))}
          </div>
          <p>ทุกยุคแก้ข้อจำกัดของยุคก่อน และเพิ่มชนิดบริการที่เครือข่ายรองรับ</p>
        </div>
      </section>

      <BeginnerBridge
        lesson="evolution"
        tldr={[
          "1G ถึง 5G คือรุ่นใหญ่ของระบบมือถือ แต่ละรุ่นเปลี่ยนทั้งคลื่น โครงข่าย และบริการ ไม่ใช่แค่เพิ่มความเร็ว",
          "GSM, UMTS/WCDMA, LTE และ 5G NR อยู่ในสายมาตรฐาน 3GPP ส่วน cdmaOne/cdma2000 เติบโตในสาย 3GPP2",
          "ITU กำหนดกรอบ IMT ระดับโลก ส่วน 3GPP เขียนรายละเอียดทางเทคนิคให้ผู้ผลิตและผู้ให้บริการนำไปสร้างระบบร่วมกันได้",
        ]}
        analogy={{
          title: "ห้องประชุมเดียวกัน แต่แบ่งคนละวิธี",
          body: "FDMA เหมือนกั้นห้องย่อยให้คุยคนละห้อง, TDMA เหมือนผลัดกันพูดตามคิวเวลา และ CDMA เหมือนพูดพร้อมกันแต่ใช้รหัสหรือภาษาคนละชุด ผู้รับจึงแยกคู่สนทนาของตนออกมาได้",
        }}
        scenario={{
          title: "ทำไมมือถือรุ่นใหม่ยังตกกลับไป 4G?",
          body: "คำว่า 5G บนเครื่องไม่ได้หมายความว่าทุกพื้นที่มี 5G ครบทุกย่านและทุกโหมด เครือข่ายอาจใช้ LTE ช่วยในแบบ NSA หรือเลือก 4G เมื่อ Coverage, ความจุ และนโยบายเครือข่ายเหมาะกว่า",
        }}
        technicalNotes={[
          {
            title: "CDMA กับ WCDMA ไม่ใช่คำแทนกัน",
            body: "CDMA เป็นแนวคิดการเข้าถึงด้วยรหัสและยังใช้เรียกตระกูล cdmaOne/cdma2000 ของ 3GPP2 ส่วน WCDMA คือ Radio Interface ของ UMTS ในสาย 3GPP แม้ทั้งคู่ใช้แนวคิด Code Division",
          },
          {
            title: "Generation ไม่เท่ากับชื่อเทคโนโลยีเดียว",
            body: "3G อยู่ภายใต้กรอบ IMT-2000 ซึ่งมีหลาย Radio Interface ขณะที่ LTE ถูกเรียก 4G ในตลาด และ LTE-Advanced จึงตอบเกณฑ์ IMT-Advanced อย่างเต็มรูปแบบ",
          },
        ]}
        terms={[
          { term: "Generation", engineering: "ช่วงวิวัฒนาการใหญ่ของระบบมือถือ", plain: "รุ่นใหญ่ของเครือข่าย เช่น 3G, 4G หรือ 5G" },
          { term: "RAT", engineering: "Radio Access Technology", plain: "ภาษาวิทยุที่มือถือกับเสาสัญญาณใช้คุยกัน" },
          { term: "Core Network", engineering: "ระบบกลางสำหรับตัวตน บริการ และเส้นทางข้อมูล", plain: "ศูนย์ควบคุมหลังสถานีฐาน" },
          { term: "Handover", engineering: "การส่งต่อการเชื่อมต่อระหว่าง Cell", plain: "ส่งไม้ต่อให้เสาถัดไปโดยพยายามไม่ให้สายหลุด" },
        ]}
      />

      <section className="learning-outcomes" aria-labelledby="outcome-title">
        <p className="section-index">ก่อนเริ่มเรียน</p>
        <div>
          <h2 id="outcome-title">เมื่อจบบทนี้ คุณจะตอบได้ 4 เรื่อง</h2>
          <ol>
            <li><span>01</span>แต่ละ Generation เปลี่ยนอะไรจากยุคก่อน</li>
            <li><span>02</span>GSM และ CDMA ใช้แนวคิดแบ่งผู้ใช้อย่างไร</li>
            <li><span>03</span>LTE ต่างจาก LTE-Advanced และ 5G NR ตรงไหน</li>
            <li><span>04</span>3GPP กับ ITU ทำหน้าที่ต่างกันอย่างไร</li>
          </ol>
        </div>
      </section>

      <section className="lesson-section timeline-section" id="timeline">
        <div className="section-heading">
          <p className="section-index">01 / วิวัฒนาการ</p>
          <h2>ห้ารุ่นใหญ่ ไม่ได้เปลี่ยนแค่ความเร็ว</h2>
          <p>
            เลือกแต่ละยุคเพื่อดูว่า Radio, Network และบริการเปลี่ยนไปอย่างไร
          </p>
        </div>

        <div
          className="generation-tabs"
          role="tablist"
          aria-label="เลือกรุ่นเครือข่าย"
        >
          {generations.map((generation) => (
            <button
              key={generation.id}
              type="button"
              role="tab"
              aria-selected={activeGeneration === generation.id}
              aria-controls="generation-panel"
              id={`generation-tab-${generation.id}`}
              className={activeGeneration === generation.id ? "active" : ""}
              onClick={() => setActiveGeneration(generation.id)}
            >
              <strong>{generation.title}</strong>
              <small>{generation.years}</small>
            </button>
          ))}
        </div>

        <article
          className="generation-panel"
          id="generation-panel"
          role="tabpanel"
          aria-labelledby={`generation-tab-${current.id}`}
        >
          <div className="generation-intro">
            <span className="giant-number">{current.id}</span>
            <div>
              <p>{current.years}</p>
              <h3>{current.subtitle}</h3>
              <strong>{current.promise}</strong>
            </div>
          </div>
          <GenerationInteractiveDiagram genId={current.id} />
          <dl>
            <div>
              <dt>Radio Access</dt>
              <dd>{current.radio}</dd>
            </div>
            <div>
              <dt>โครงสร้างเครือข่าย</dt>
              <dd>{current.network}</dd>
            </div>
            <div>
              <dt>บริการที่เด่น</dt>
              <dd>{current.services}</dd>
            </div>
            <div>
              <dt>ตัวอย่างเทคโนโลยี</dt>
              <dd>{current.examples}</dd>
            </div>
          </dl>
          <p className="takeaway">
            <span>จำง่าย ๆ</span>
            {current.takeaway}
          </p>
        </article>
      </section>

      <section className="lesson-section split-history">
        <div className="section-heading">
          <p className="section-index">02 / สองเส้นทางของ 2G และ 3G</p>
          <h2>GSM กับ CDMA คือคนละวิธีจัดระเบียบผู้ใช้</h2>
          <p>
            ทั้งสองตระกูลแก้ปัญหาเดียวกัน คือทำให้ผู้ใช้จำนวนมากแบ่งทรัพยากรวิทยุร่วมกันได้
          </p>
        </div>

        <div className="comparison">
          <article>
            <p className="tech-label">GSM FAMILY</p>
            <h3>แบ่งด้วยความถี่และเวลา</h3>
            <div className="slot-demo" aria-label="ตัวอย่างการแบ่งช่องเวลา">
              <span>A</span><span>B</span><span>C</span><span>A</span><span>B</span><span>C</span>
            </div>
            <p>
              GSM วางผู้ใช้ลงในช่องความถี่และ Time Slot ที่กำหนด
              มี SIM เป็นหัวใจของตัวตนผู้ใช้ และพัฒนาต่อผ่าน GPRS, EDGE,
              UMTS/WCDMA และ HSPA
            </p>
            <p className="path">GSM → GPRS/EDGE → UMTS/HSPA → LTE</p>
          </article>

          <article>
            <p className="tech-label">CDMA FAMILY</p>
            <h3>ใช้ความถี่ร่วมกัน แยกด้วยรหัส</h3>
            <div className="code-demo" aria-label="ตัวอย่างรหัสของผู้ใช้">
              <span>+ − + +</span>
              <span>− + + −</span>
              <span>+ + − +</span>
            </div>
            <p>
              IS-95 หรือ cdmaOne ใช้ Spread Spectrum
              ให้ผู้ใช้หลายรายอยู่ในย่านความถี่เดียวกันและแยกกันด้วยรหัส
              จากนั้นพัฒนาไปสู่ cdma2000 และ EV-DO
            </p>
            <p className="path">IS-95 → cdma2000/EV-DO → LTE</p>
          </article>
        </div>

        <div className="convergence">
          <span>จุดสำคัญ</span>
          <p>
            LTE ไม่ได้ใช้ Radio Access แบบ GSM หรือ CDMA เดิม
            แต่เป็นจุดที่อุตสาหกรรมส่วนใหญ่รวมทิศทางเข้าสู่ระบบ OFDMA และโครงข่ายแบบ All-IP
          </p>
        </div>
      </section>

      <section className="lesson-section lte-section">
        <div className="section-heading">
          <p className="section-index">03 / LTE สู่ 5G NR</p>
          <h2>จากเครือข่ายข้อมูลเร็ว สู่เครือข่ายที่ปรับตามงาน</h2>
        </div>

        <div className="evolution-steps">
          <article>
            <span className="step-number">A</span>
            <div>
              <p className="tech-label">LTE · RELEASE 8</p>
              <h3>วางฐานบรอดแบนด์แบบ All-IP</h3>
              <p>
                LTE ลดความซับซ้อนของ Radio Access และ Core Network
                เพื่อเพิ่มความเร็ว ความจุ และลดความหน่วง โดยใช้ E-UTRA ร่วมกับ EPC
              </p>
            </div>
          </article>
          <article>
            <span className="step-number">B</span>
            <div>
              <p className="tech-label">LTE-ADVANCED · RELEASE 10+</p>
              <h3>รวมคลื่นและเสาอากาศให้ทำงานร่วมกัน</h3>
              <p>
                Carrier Aggregation รวมหลาย Carrier, MIMO เพิ่ม Spatial Stream
                และการจัดการ Interference ช่วยเพิ่มประสิทธิภาพทั้งระบบ
              </p>
            </div>
          </article>
          <article>
            <span className="step-number">C</span>
            <div>
              <p className="tech-label">5G NR + 5GC · RELEASE 15+</p>
              <h3>แยกความสามารถตาม Use Case</h3>
              <p>
                5G รองรับ eMBB สำหรับข้อมูลสูง, URLLC สำหรับงานที่ต้องเชื่อถือได้และหน่วงต่ำ
                และ mMTC สำหรับอุปกรณ์จำนวนมาก
              </p>
            </div>
          </article>
        </div>

        <aside className="myth-check">
          <div>
            <p className="section-index">คำที่มักสับสน</p>
            <h3>LTE เท่ากับ 4G เลยหรือไม่?</h3>
          </div>
          <p>
            ในตลาด คำว่า 4G ถูกใช้กับ LTE และเทคโนโลยีที่พัฒนาจาก 3G หลายรูปแบบ
            แต่ ITU ระบุชัดว่า LTE-Advanced เป็นเทคโนโลยีที่ได้รับสถานะ IMT-Advanced
            จึงควรแยกคำเรียกทางการตลาดออกจากกระบวนการรับรองมาตรฐาน
          </p>
        </aside>
      </section>

      <section className="lesson-section standards-section" id="standards">
        <div className="section-heading">
          <p className="section-index">04 / ใครกำหนดมาตรฐาน</p>
          <h2>3GPP เขียนสเปก ส่วน ITU วางกรอบระดับโลก</h2>
          <p>
            องค์กรทั้งสองเชื่อมโยงกัน แต่ไม่ได้ทำหน้าที่เดียวกัน
          </p>
        </div>

        <div className="standards-map">
          <article>
            <div className="org-heading">
              <span>3GPP</span>
              <small>Partnership Project</small>
            </div>
            <h3>ทำให้ระบบของหลายบริษัทคุยกันรู้เรื่อง</h3>
            <ul>
              <li>จัดทำ Technical Specification ครบทั้ง Radio, Core และบริการ</li>
              <li>รวมงานเป็น Release เช่น Release 8, 10 และ 15</li>
              <li>TSG RAN ดู Radio, SA ดูระบบและบริการ, CT ดู Core และ Terminal</li>
              <li>ชุดเลข 36 ใช้กับ LTE และชุดเลข 38 ใช้กับ 5G NR</li>
            </ul>
          </article>

          <div className="standards-link" aria-hidden="true">
            <span>เสนอเทคโนโลยี</span>
            <b>↔</b>
            <span>เกณฑ์และการประเมิน</span>
          </div>

          <article>
            <div className="org-heading">
              <span>ITU</span>
              <small>United Nations Agency</small>
            </div>
            <h3>สร้างกรอบ IMT และประสานงานคลื่นทั่วโลก</h3>
            <ul>
              <li>กำหนด Vision, Requirement และวิธีประเมินเทคโนโลยี IMT</li>
              <li>IMT-2000 เชื่อมโยงกับ 3G, IMT-Advanced กับ 4G และ IMT-2020 กับ 5G</li>
              <li>ประสานการใช้คลื่นระหว่างประเทศผ่านกระบวนการ ITU-R และ WRC</li>
              <li>ไม่ได้เป็นผู้ผลิตอุปกรณ์หรือผู้ให้บริการเครือข่าย</li>
            </ul>
          </article>
        </div>

        <div className="release-strip" aria-label="Release สำคัญ">
          <div><b>Rel-8</b><span>LTE และ EPC</span></div>
          <div><b>Rel-10</b><span>LTE-Advanced</span></div>
          <div><b>Rel-15</b><span>5G NR และ 5GS ระยะแรก</span></div>
          <div><b>Rel-18</b><span>เริ่มยุค 5G-Advanced</span></div>
        </div>
      </section>

      <section className="lesson-section glossary-section">
        <div className="section-heading">
          <p className="section-index">05 / คำศัพท์จำเป็น</p>
          <h2>เปิดดูเมื่อเจอคำย่อ</h2>
        </div>
        <div className="glossary">
          {glossary.map(([term, description]) => (
            <details key={term}>
              <summary>{term}<span aria-hidden="true">＋</span></summary>
              <p>{description}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lesson-section quiz-section" id="quiz">
        <div className="section-heading">
          <p className="section-index">06 / ตรวจความเข้าใจ</p>
          <h2>แบบทดสอบท้ายบท</h2>
          <p>เลือกคำตอบให้ครบ แล้วกดตรวจคำตอบ คุณแก้คำตอบและลองใหม่ได้เสมอ</p>
        </div>

        {submitted && (
          <QuizSummary
            score={score}
            total={quiz.length}
            onRetry={resetQuiz}
            nextHref="/rf-modulation"
            nextLabel="ไปบทที่ 02"
          />
        )}

        <div className="quiz-list">
          {quiz.map((item, index) => {
            const isCorrect = answers[index] === item.answer;
            return (
              <fieldset
                key={item.question}
                className={
                  submitted
                    ? isCorrect
                      ? "question correct"
                      : "question incorrect"
                    : "question"
                }
              >
                <legend>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.question}
                </legend>
                <div className="choices">
                  {item.choices.map((choice, choiceIndex) => (
                    <label key={choice}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        checked={answers[index] === choiceIndex}
                        onChange={() => {
                          setAnswers((currentAnswers) => ({
                            ...currentAnswers,
                            [index]: choiceIndex,
                          }));
                          setSubmitted(false);
                        }}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
                {submitted && (
                  <p className="feedback" role="status">
                    <strong>{isCorrect ? "ถูกต้อง" : "ทบทวนอีกนิด"}</strong>
                    {item.explain}
                  </p>
                )}
              </fieldset>
            );
          })}
        </div>

        <div className="quiz-actions">
          <button
            type="button"
            className="primary-action"
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length !== quiz.length}
          >
            ตรวจคำตอบ
          </button>
        </div>
      </section>

      <section className="sources-section">
        <div>
          <p className="section-index">แหล่งอ้างอิงหลัก</p>
          <h2>ตรวจสอบต่อจากองค์กรกำหนดมาตรฐาน</h2>
        </div>
        <ul>
          <li>
            <a href="https://www.3gpp.org/technical_specs_and_reports/technical_specifications" target="_blank" rel="noreferrer">
              3GPP: Generations of Mobile Standards
            </a>
          </li>
          <li>
            <a href="https://www.3gpp.org/about-3gpp/about-3gpp/" target="_blank" rel="noreferrer">
              3GPP: WCDMA ในสาย 3GPP และกลุ่ม Radio Interface ของ IMT-2000
            </a>
          </li>
          <li>
            <a href="https://www.3gpp.org/technologies/5g-system-overview" target="_blank" rel="noreferrer">
              3GPP: 5G System Overview
            </a>
          </li>
          <li>
            <a href="https://www.3gpp.org/specifications-technologies/releases/release-15" target="_blank" rel="noreferrer">
              3GPP: Release 15
            </a>
          </li>
          <li>
            <a href="https://www.itu.int/en/ITU-R/Documents/FAQ-IMT-2024.pdf" target="_blank" rel="noreferrer">
              ITU-R: FAQ on International Mobile Telecommunications
            </a>
          </li>
          <li>
            <a href="https://tiaonline.org/standard/tia-95/" target="_blank" rel="noreferrer">
              TIA: TIA-95 CDMA Standard
            </a>
          </li>
        </ul>
      </section>

      <footer>
        <div>
          <p>จบบทเรียนที่ 01</p>
          <h2>ตอนนี้คุณเห็นเส้นทางจาก 1G ถึง 5G แล้ว</h2>
        </div>
        <div className="footer-links">
          <Link href="/">← กลับหน้ารวมบทเรียน</Link>
          <a href="/rf-modulation">บทเรียนถัดไป: RF และ Modulation →</a>
          <a href="#top">กลับไปทบทวนด้านบน ↑</a>
        </div>
      </footer>
    </main>
  );
}
