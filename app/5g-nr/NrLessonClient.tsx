"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { BeginnerBridge, QuizSummary } from "../components/LearningSupport";

type FrequencyRange = "FR1" | "FR2-1" | "FR2-2";
type Architecture = "NSA" | "SA";
type Scs = 15 | 30 | 60 | 120 | 240;
type BwpMode = "idle" | "data" | "edge";

const frequencyRanges: Record<
  FrequencyRange,
  {
    span: string;
    name: string;
    simple: string;
    strength: string;
    caution: string;
    example: string;
  }
> = {
  FR1: {
    span: "410 MHz ถึง 7.125 GHz",
    name: "ย่านต่ำและย่านกลาง",
    simple: "เดินทางได้ไกลกว่าและทะลุสิ่งกีดขวางได้ดีกว่าย่านความถี่สูง",
    strength: "เหมาะกับ Coverage กว้างและเครือข่ายใช้งานทั่วไป",
    caution: "Bandwidth ต่อ Carrier โดยทั่วไปแคบกว่า FR2",
    example: "ตัวอย่างย่านที่พบได้บ่อย: n28, n41, n77, n78",
  },
  "FR2-1": {
    span: "24.25 ถึง 52.6 GHz",
    name: "ย่านคลื่นมิลลิเมตรช่วงแรก",
    simple: "มีช่องสัญญาณกว้างมาก แต่ระยะครอบคลุมและการทะลุสิ่งกีดขวางลดลง",
    strength: "เหมาะกับ Hotspot ความจุสูงและพื้นที่ผู้ใช้หนาแน่น",
    caution: "ต้องพึ่ง Beamforming และตำแหน่งติดตั้งที่เหมาะสม",
    example: "ตัวอย่างย่าน: n257, n258, n260, n261",
  },
  "FR2-2": {
    span: "52.6 ถึง 71 GHz",
    name: "ส่วนขยายความถี่สูงใน Release 17/18",
    simple: "ขยาย NR ไปสู่ความถี่สูงกว่าเดิม พร้อม Numerology ที่ละเอียดและเร็วขึ้น",
    strength: "เปิดทางให้ใช้ Spectrum กว้างมากในพื้นที่เฉพาะ",
    caution: "การสูญเสียทางอากาศสูงและระบบ RF ซับซ้อนขึ้น",
    example: "ตัวอย่างย่านในสเปกปัจจุบัน: n263",
  },
};

const numerologies: Record<
  Scs,
  { mu: number; slot: string; slots: number; use: string }
> = {
  15: { mu: 0, slot: "1 ms", slots: 1, use: "Coverage กว้างและย่านต่ำ" },
  30: { mu: 1, slot: "0.5 ms", slots: 2, use: "ย่านกลางและการใช้งาน 5G ทั่วไป" },
  60: { mu: 2, slot: "0.25 ms", slots: 4, use: "ย่านกลางหรือ FR2 บางรูปแบบ" },
  120: { mu: 3, slot: "0.125 ms", slots: 8, use: "FR2 และช่องสัญญาณกว้าง" },
  240: { mu: 4, slot: "0.0625 ms", slots: 16, use: "ใช้กับ SSB บางกรณีใน FR2" },
};

const bwpModes: Record<
  BwpMode,
  { label: string; left: string; width: string; note: string }
> = {
  idle: {
    label: "ประหยัดพลังงาน",
    left: "8%",
    width: "22%",
    note: "เปิด BWP แคบสำหรับงานควบคุมหรือช่วงที่ข้อมูลน้อย ลดภาระ RF และการประมวลผลของ UE",
  },
  data: {
    label: "รับส่งข้อมูล",
    left: "22%",
    width: "60%",
    note: "สลับไป BWP กว้างขึ้นเมื่อมีข้อมูลมาก เพื่อใช้ Resource Block ได้มากขึ้น",
  },
  edge: {
    label: "ย้ายตำแหน่ง",
    left: "64%",
    width: "28%",
    note: "BWP กำหนดได้ทั้งขนาด ตำแหน่ง และ Numerology ภายใน Carrier เดียวกัน",
  },
};

const channels = {
  downlink: [
    {
      name: "PSS / SSS",
      type: "Signal",
      purpose: "ให้ UE หา Cell, จับเวลาและความถี่ พร้อมระบุ Physical Cell ID",
      payload: "ไม่บรรทุกข้อมูลจาก Higher Layer",
    },
    {
      name: "PBCH",
      type: "Channel",
      purpose: "ส่ง MIB และข้อมูลพื้นฐานเพื่อเริ่มอ่าน Cell",
      payload: "Broadcast information",
    },
    {
      name: "PDCCH",
      type: "Channel",
      purpose: "ส่ง DCI เพื่อบอก UE ว่าข้อมูลอยู่ที่ไหน ใช้ Resource ใด และส่งอย่างไร",
      payload: "Scheduling และ Control",
    },
    {
      name: "PDSCH",
      type: "Channel",
      purpose: "พื้นที่หลักสำหรับข้อมูลขาลง รวมทั้ง User Data และ System Information",
      payload: "DL-SCH data",
    },
  ],
  uplink: [
    {
      name: "PRACH",
      type: "Channel",
      purpose: "ส่ง Random Access Preamble เพื่อขอเริ่มเชื่อมต่อและช่วยตั้งเวลา Uplink",
      payload: "Preamble ไม่ใช่ User Data",
    },
    {
      name: "PUCCH",
      type: "Channel",
      purpose: "ส่ง UCI เช่น HARQ-ACK, Scheduling Request และ CSI บางรูปแบบ",
      payload: "Uplink Control Information",
    },
    {
      name: "PUSCH",
      type: "Channel",
      purpose: "พื้นที่หลักสำหรับข้อมูลขาขึ้น และสามารถพ่วง UCI ไปพร้อมข้อมูลได้",
      payload: "UL-SCH data และ UCI",
    },
  ],
};

const initialAccess = [
  {
    step: "01",
    title: "ค้นหา SSB",
    detail: "UE สแกนความถี่และทิศทาง Beam จนตรวจพบพลังงานของ SS/PBCH Block",
    tags: "SSB",
  },
  {
    step: "02",
    title: "จับเวลาและรู้ Cell",
    detail: "PSS ช่วยจับจังหวะเบื้องต้น จากนั้น SSS ช่วยระบุ Cell และขอบเขต Frame",
    tags: "PSS + SSS",
  },
  {
    step: "03",
    title: "อ่านข้อมูลตั้งต้น",
    detail: "UE ถอด PBCH เพื่อได้ MIB และข้อมูลที่จำเป็นสำหรับค้นหา Control Channel",
    tags: "PBCH",
  },
  {
    step: "04",
    title: "ขอเข้าใช้งาน",
    detail: "UE ส่ง Preamble บน PRACH เพื่อเริ่ม Random Access และขอปรับ Uplink Timing",
    tags: "PRACH",
  },
  {
    step: "05",
    title: "รับคำตอบจากเครือข่าย",
    detail: "UE เฝ้า PDCCH แล้วรับ Random Access Response บน PDSCH",
    tags: "PDCCH → PDSCH",
  },
  {
    step: "06",
    title: "ส่งข้อมูลระบุตัวตน",
    detail: "UE ใช้ Uplink Grant ส่งข้อความขั้นถัดไปบน PUSCH แล้วเข้าสู่กระบวนการ RRC",
    tags: "PUSCH",
  },
];

const quiz = [
  {
    question: "ข้อใดอธิบาย FR2 ได้เหมาะสมที่สุด?",
    choices: [
      "ความถี่สูง ช่องสัญญาณกว้าง แต่ครอบคลุมและทะลุสิ่งกีดขวางยากขึ้น",
      "ความถี่ต่ำกว่า FR1 และใช้เฉพาะเสียง",
      "เป็นชื่อของ 5G Core Network",
    ],
    answer: 0,
    explain: "FR2 อยู่ที่ความถี่สูงกว่า FR1 จึงรองรับ Bandwidth กว้าง แต่ Path Loss และการบังสัญญาณมีผลมากขึ้น",
  },
  {
    question: "NSA แบบ EN-DC ใช้อะไรเป็น Anchor หลัก?",
    choices: ["LTE และ EPC", "NR และ 5GC เท่านั้น", "Wi-Fi และ Internet"],
    answer: 0,
    explain: "NSA Option 3 ใช้ LTE eNB และ EPC เดิมเป็นแกนหลัก แล้วเพิ่ม NR เป็น Secondary Radio",
  },
  {
    question: "เมื่อ μ = 2 ค่า Subcarrier Spacing เท่าไร?",
    choices: ["30 kHz", "60 kHz", "120 kHz"],
    answer: 1,
    explain: "Δf = 15 × 2^μ kHz ดังนั้น μ = 2 จะได้ 60 kHz และ Slot ปกติยาว 0.25 ms",
  },
  {
    question: "Resource Block ใน NR นิยามอย่างไร?",
    choices: [
      "12 Subcarriers ต่อเนื่องในแกนความถี่",
      "12 Subcarriers × 14 Symbols เสมอ",
      "หนึ่ง Subcarrier × หนึ่ง OFDM Symbol",
    ],
    answer: 0,
    explain: "RB นิยามในแกนความถี่เป็น 12 Subcarriers ส่วนการจัดสรรตามเวลาระบุแยกด้วย OFDM Symbols",
  },
  {
    question: "หนึ่ง Resource Element คืออะไร?",
    choices: [
      "หนึ่ง Carrier ทั้งก้อน",
      "หนึ่ง Subcarrier × หนึ่ง OFDM Symbol",
      "หนึ่ง Slot × 12 Frames",
    ],
    answer: 1,
    explain: "RE คือช่องเล็กที่สุดใน Resource Grid ที่จุดตัดของความถี่หนึ่ง Subcarrier กับเวลาหนึ่ง OFDM Symbol",
  },
  {
    question: "องค์ประกอบหลักของ SSB คือข้อใด?",
    choices: ["PSS, SSS และ PBCH", "PDCCH, PDSCH และ PUSCH", "PUCCH และ PRACH"],
    answer: 0,
    explain: "SS/PBCH Block ประกอบด้วย PSS, SSS, PBCH และ DM-RS สำหรับ PBCH ภายใน 4 OFDM Symbols",
  },
  {
    question: "PDCCH และ PDSCH ทำงานร่วมกันอย่างไร?",
    choices: [
      "PDCCH บอกตำแหน่งและรูปแบบ ส่วน PDSCH บรรทุกข้อมูลขาลง",
      "ทั้งสองใช้ส่ง Random Access Preamble",
      "PDSCH ใช้ส่ง Uplink Control Information เท่านั้น",
    ],
    answer: 0,
    explain: "UE อ่าน DCI บน PDCCH เพื่อรู้ว่าจะถอดข้อมูลบน PDSCH ที่ Resource ใดและด้วยพารามิเตอร์ใด",
  },
  {
    question: "ช่องใดเริ่มกระบวนการ Random Access จากฝั่ง UE?",
    choices: ["PBCH", "PRACH", "PDSCH"],
    answer: 1,
    explain: "UE ส่ง Random Access Preamble บน PRACH ก่อนรอคำตอบจากเครือข่าย",
  },
];

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotionPreference() {
  return false;
}

function ArchitectureDiagram({ mode }: { mode: Architecture }) {
  if (mode === "NSA") {
    return (
      <div className="nr-architecture-visual nsa" role="img" aria-label="NSA ใช้ LTE eNB และ EPC เป็นแกนหลัก โดยเพิ่ม 5G en-gNB เป็น Secondary Node">
        <div className="nr-node ue"><b>UE</b><small>LTE + NR</small></div>
        <div className="nr-path nr-path-lte"><span>LTE Anchor</span></div>
        <div className="nr-node enb"><b>eNB</b><small>Master Node</small></div>
        <div className="nr-path nr-path-core"><span>S1</span></div>
        <div className="nr-node core"><b>EPC</b><small>4G Core</small></div>
        <div className="nr-path nr-path-nr"><span>NR Capacity</span></div>
        <div className="nr-node gnb secondary"><b>en-gNB</b><small>Secondary Node</small></div>
        <div className="nr-path nr-path-x2"><span>X2</span></div>
      </div>
    );
  }

  return (
    <div className="nr-architecture-visual sa" role="img" aria-label="SA ใช้ 5G NR gNB เชื่อมตรงกับ 5G Core">
      <div className="nr-node ue"><b>UE</b><small>NR Radio</small></div>
      <div className="nr-path nr-path-nr"><span>NR</span></div>
      <div className="nr-node gnb"><b>gNB</b><small>NG-RAN</small></div>
      <div className="nr-path nr-path-core"><span>NG</span></div>
      <div className="nr-node core"><b>5GC</b><small>Service-Based Core</small></div>
    </div>
  );
}

function ResourceGrid() {
  const cells = Array.from({ length: 12 * 14 }, (_, index) => {
    const row = Math.floor(index / 14);
    const column = index % 14;
    const isSelectedRe = row === 5 && column === 8;
    return (
      <i
        key={index}
        className={`${column === 1 ? "rb-column " : ""}${isSelectedRe ? "selected-re" : ""}`}
      />
    );
  });

  return (
    <div className="nr-grid-wrap">
      <span className="nr-grid-frequency">ความถี่ ↑<b>12 Subcarriers = 1 RB</b></span>
      <div
        className="nr-resource-grid"
        role="img"
        aria-label="Resource Grid หนึ่ง Resource Block มี 12 Subcarriers และหนึ่ง Resource Element คือหนึ่ง Subcarrier คูณหนึ่ง OFDM Symbol"
      >
        {cells}
      </div>
      <span className="nr-grid-time">เวลา, 14 OFDM Symbols ใน Slot ปกติ →</span>
    </div>
  );
}

export default function NrLessonClient() {
  const [frequencyRange, setFrequencyRange] = useState<FrequencyRange>("FR1");
  const [architecture, setArchitecture] = useState<Architecture>("SA");
  const [scs, setScs] = useState<Scs>(30);
  const [bwpMode, setBwpMode] = useState<BwpMode>("idle");
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionPreference,
    getServerReducedMotionPreference,
  );
  const isMotionPlaying = motionEnabled && !prefersReducedMotion;
  const selectedRange = frequencyRanges[frequencyRange];
  const selectedNumerology = numerologies[scs];
  const selectedBwp = bwpModes[bwpMode];

  const score = useMemo(
    () => quiz.reduce(
      (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
      0,
    ),
    [answers],
  );

  const subcarrierLines = 11 - selectedNumerology.mu * 2;

  return (
    <main className={`nr-page${isMotionPlaying ? "" : " nr-motion-paused"}`}>
      <header className="nr-header">
        <Link className="nr-brand" href="/">
          <span aria-hidden="true">NR</span>
          <span>
            <strong>Mobile Network Classroom</strong>
            <small>บทเรียนที่ 03</small>
          </span>
        </Link>
        <div className="nr-header-actions">
          <nav aria-label="หัวข้อในบทเรียน 5G NR">
            <a href="#nr-structure">โครงสร้าง</a>
            <a href="#nr-grid">Resource Grid</a>
            <a href="#nr-channels">Channel / Signal</a>
            <Link href="/field-guide">คู่มือภาคสนาม</Link>
            <a href="#nr-quiz">แบบทดสอบ</a>
          </nav>
          <button
            className="nr-motion-toggle"
            type="button"
            aria-pressed={!isMotionPlaying}
            disabled={prefersReducedMotion}
            onClick={() => setMotionEnabled((enabled) => !enabled)}
          >
            <span aria-hidden="true">{isMotionPlaying ? "Ⅱ" : "▶"}</span>
            {prefersReducedMotion
              ? "ระบบหยุดภาพ"
              : isMotionPlaying
                ? "หยุดภาพ"
                : "เล่นภาพ"}
          </button>
        </div>
      </header>

      <section className="nr-hero" id="nr-top">
        <div className="nr-hero-copy">
          <p className="nr-kicker">โครงสร้างและช่องสัญญาณ 5G NR</p>
          <h1>มือถือหา Cell<br />แล้วคุยกับ 5G อย่างไร</h1>
          <p>
            เริ่มจากย่านความถี่และจังหวะ OFDM แล้วซูมเข้าไปถึง Resource Element
            ก่อนตามเส้นทางจริงตั้งแต่ UE เห็น SSB จนส่ง PRACH และเริ่มรับส่งข้อมูล
          </p>
          <div className="nr-hero-actions">
            <a className="nr-primary" href="#nr-structure">เริ่มจากภาพใหญ่ ↓</a>
            <span>ใช้เวลาประมาณ 30 นาที</span>
          </div>
        </div>

        <div className="nr-hero-visual" aria-label="สถานีฐานกวาดลำคลื่น SSB เพื่อให้โทรศัพท์ค้นหา Cell">
          <div className="nr-tower" aria-hidden="true">
            <i /><i /><b>gNB</b>
          </div>
          <div className="nr-beams" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <div className="nr-phone" aria-hidden="true">
            <span>5G</span>
          </div>
          <div className="nr-ssb-chip">
            <small>ค้นพบ Cell ด้วย</small>
            <strong>SSB</strong>
            <span>PSS + SSS + PBCH</span>
          </div>
        </div>
      </section>

      <BeginnerBridge
        lesson="nr"
        tldr={[
          "5G แบ่งคลื่นเป็นตารางเวลา × ความถี่ เพื่อซอยทรัพยากรให้มือถือหลายเครื่องใช้ร่วมกันโดยไม่วางข้อมูลทับกัน",
          "มือถือมองหา SSB เพื่อจับเวลา ระบุ Cell และอ่านข้อมูลตั้งต้นว่าควรฟังระบบต่ออย่างไร",
          "ก่อนส่งข้อมูล มือถือเคาะประตูด้วย PRACH แล้วรับคำสั่งจัดสรรผ่าน PDCCH ก่อนใช้ PDSCH/PUSCH รับส่งข้อมูลจริง",
        ]}
        analogy={{
          title: "Resource Grid เหมือนตารางจองห้อง",
          body: "แกนนอนคือช่วงเวลา แกนตั้งคือช่องความถี่ แต่ละช่องเล็กคือ RE และแถวความถี่ 12 Subcarriers รวมเป็น RB Scheduler ทำหน้าที่จองพื้นที่ให้ข้อมูลและสัญญาณควบคุมในแต่ละจังหวะ",
        }}
        scenario={{
          title: "ทำไมเข้าลิฟต์แล้ว 5G หาย เหลือ 4G?",
          body: "คลื่นย่านกลางหรือย่านสูงสูญเสียมากขึ้นเมื่อผ่านคอนกรีต โลหะ และมุมอับ โทรศัพท์จึงอาจเลือกย่านต่ำหรือ RAT อื่นที่ยังผ่านเกณฑ์ใช้งานได้ ไม่ได้แปลว่าเสา 5G ปิดเสมอไป",
        }}
        technicalNotes={[
          {
            title: "BWP ช่วยลดภาระและประหยัดพลังงาน",
            body: "Cell อาจกว้างมาก แต่ UE ไม่จำเป็นต้องเปิดภาครับส่งเต็ม Bandwidth ตลอดเวลา เครือข่ายกำหนดหลาย BWP และสั่ง Active BWP ให้แคบลงช่วงกิจกรรมน้อย หรือกว้างขึ้นเมื่อมีข้อมูล ช่วยลดการประมวลผลและการใช้พลังงาน",
          },
          {
            title: "PUCCH ไม่ใช่ช่องส่ง User Data",
            body: "PUCCH ส่ง Uplink Control Information เช่น HARQ ACK/NACK, Scheduling Request และ CSI ส่วน PUSCH เป็นช่องข้อมูล Uplink และในบางกรณีสามารถพา UCI ร่วมไปได้",
          },
        ]}
        terms={[
          { term: "SSB", engineering: "ชุด PSS, SSS, PBCH และ PBCH DM-RS", plain: "ป้ายไฟนำทางที่ช่วยให้มือถือพบและเริ่มอ่าน Cell" },
          { term: "Subcarrier", engineering: "ความถี่ย่อยแบบ Orthogonal ใน OFDM", plain: "เลนความถี่ย่อยบนถนนใหญ่" },
          { term: "Resource Block", engineering: "ทรัพยากร 12 Subcarriers ใน Frequency Domain", plain: "กลุ่มเลน 12 ช่องที่ Scheduler ใช้อ้างอิง" },
          { term: "Bandwidth Part", engineering: "ช่วงย่อยของ Carrier ที่ UE ใช้งานอยู่", plain: "เปิดใช้ถนนเฉพาะช่วงที่จำเป็น แทนการเฝ้าทั้งเส้น" },
        ]}
      />

      <section className="nr-roadmap" aria-labelledby="nr-roadmap-title">
        <p className="nr-section-index">แผนที่การเรียนรู้</p>
        <div>
          <h2 id="nr-roadmap-title">จบบทนี้ คุณจะอ่าน 5G NR ได้ 5 ชั้น</h2>
          <ol>
            <li><b>01</b><span>FR1 / FR2 และ NSA / SA</span></li>
            <li><b>02</b><span>Numerology และ Subcarrier Spacing</span></li>
            <li><b>03</b><span>Resource Grid, RB, RE และ BWP</span></li>
            <li><b>04</b><span>Downlink / Uplink Physical Channels</span></li>
            <li><b>05</b><span>ลำดับ Initial Access ตั้งแต่ SSB ถึง PUSCH</span></li>
          </ol>
        </div>
      </section>

      <section className="nr-section" id="nr-structure">
        <div className="nr-heading">
          <p className="nr-section-index">01 / พื้นที่ที่ NR ทำงาน</p>
          <h2>FR บอกย่านความถี่ ไม่ได้บอกว่าเป็น SA หรือ NSA</h2>
          <p>
            Frequency Range อธิบายตำแหน่งบน Spectrum ส่วน SA/NSA
            อธิบายว่า Radio Access เชื่อมกับ Core Network แบบใด สองเรื่องนี้เลือกประกอบกันได้
          </p>
        </div>

        <div className="nr-range-lab">
          <div className="nr-tabs" role="tablist" aria-label="เลือก Frequency Range">
            {(Object.keys(frequencyRanges) as FrequencyRange[]).map((range) => (
              <button
                type="button"
                role="tab"
                aria-selected={frequencyRange === range}
                key={range}
                onClick={() => setFrequencyRange(range)}
              >
                <strong>{range}</strong>
                <small>{frequencyRanges[range].span}</small>
              </button>
            ))}
          </div>

          <div className="nr-spectrum" aria-label={`ตำแหน่ง ${frequencyRange} บน Spectrum`}>
            <div className="nr-spectrum-scale">
              <span>410 MHz</span><span>7.125 GHz</span><span>24.25 GHz</span><span>52.6 GHz</span><span>71 GHz</span>
            </div>
            <div className="nr-spectrum-track">
              <i className={frequencyRange === "FR1" ? "active" : ""}>FR1</i>
              <i className={frequencyRange === "FR2-1" ? "active" : ""}>FR2-1</i>
              <i className={frequencyRange === "FR2-2" ? "active" : ""}>FR2-2</i>
            </div>
          </div>

          <article className="nr-range-note" role="tabpanel">
            <div>
              <p>{selectedRange.span}</p>
              <h3>{selectedRange.name}</h3>
              <strong>{selectedRange.simple}</strong>
            </div>
            <dl>
              <div><dt>เหมาะกับ</dt><dd>{selectedRange.strength}</dd></div>
              <div><dt>ต้องระวัง</dt><dd>{selectedRange.caution}</dd></div>
              <div><dt>ตัวอย่าง</dt><dd>{selectedRange.example}</dd></div>
            </dl>
          </article>
        </div>

        <div className="nr-architecture">
          <div>
            <p className="nr-section-index">รูปแบบการติดตั้งเครือข่าย</p>
            <h3>NSA ใช้ 4G ช่วยตั้งหลัก ส่วน SA ใช้ 5G ครบเส้นทาง</h3>
          </div>
          <div className="nr-architecture-tabs" role="tablist" aria-label="เลือกสถาปัตยกรรม 5G">
            {(["NSA", "SA"] as Architecture[]).map((mode) => (
              <button
                type="button"
                role="tab"
                aria-selected={architecture === mode}
                key={mode}
                onClick={() => setArchitecture(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          <ArchitectureDiagram mode={architecture} />
          <div className="nr-architecture-copy" role="tabpanel">
            {architecture === "NSA" ? (
              <>
                <h4>NSA, EN-DC หรือ Option 3</h4>
                <p>LTE eNB เป็น Master Node และเชื่อมกับ EPC ส่วน NR en-gNB เพิ่มความจุเป็น Secondary Node เหมาะกับการเปิด 5G โดยใช้โครงข่าย 4G เดิม</p>
                <span>จำง่าย: NR Radio + LTE Anchor + 4G Core</span>
              </>
            ) : (
              <>
                <h4>SA หรือ Option 2</h4>
                <p>UE ใช้ NR เชื่อม gNB แล้วเข้าสู่ 5G Core โดยตรง รองรับความสามารถของระบบ 5G เต็มรูปแบบ เช่น Network Slicing และสถาปัตยกรรมบริการของ 5GC</p>
                <span>จำง่าย: NR Radio + gNB + 5G Core</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="nr-section nr-dark" id="nr-numerology">
        <div className="nr-heading">
          <p className="nr-section-index">02 / จังหวะที่ยืดหยุ่น</p>
          <h2>ช่องห่างขึ้น Slot สั้นลง</h2>
          <p>
            NR ใช้สูตร Δf = 15 × 2<sup>μ</sup> kHz เมื่อ Subcarrier Spacing กว้างขึ้น
            OFDM Symbol และ Slot จะสั้นลง จึงเลือกให้เหมาะกับย่านความถี่และสภาพช่องสัญญาณได้
          </p>
        </div>

        <div className="nr-numerology-lab">
          <div className="nr-scs-tabs" role="tablist" aria-label="เลือก Subcarrier Spacing">
            {(Object.keys(numerologies).map(Number) as Scs[]).map((value) => (
              <button
                type="button"
                role="tab"
                aria-selected={scs === value}
                key={value}
                onClick={() => setScs(value)}
              >
                <span>μ {numerologies[value].mu}</span>
                <strong>{value}</strong>
                <small>kHz</small>
              </button>
            ))}
          </div>

          <div className="nr-numerology-readout" role="tabpanel">
            <div>
              <small>SUBCARRIER SPACING</small>
              <strong>{scs} kHz</strong>
              <span>Δf = 15 × 2<sup>{selectedNumerology.mu}</sup></span>
            </div>
            <div>
              <small>SLOT DURATION</small>
              <strong>{selectedNumerology.slot}</strong>
              <span>
                {scs === 60
                  ? "Normal CP: 14 Symbols, Extended CP: 12 Symbols"
                  : "Normal CP: 14 OFDM Symbols"}
              </span>
            </div>
            <div>
              <small>SLOTS PER 1 ms</small>
              <strong>{selectedNumerology.slots}</strong>
              <span>{selectedNumerology.use}</span>
            </div>
          </div>

          <div className="nr-scs-visual">
            <div className="nr-subcarriers" aria-label={`${subcarrierLines} เส้นแทน Subcarriers ภายในช่วงความถี่ตัวอย่าง`}>
              {Array.from({ length: subcarrierLines }, (_, index) => <i key={index} />)}
            </div>
            <p>เมื่อดู Bandwidth เท่ากัน SCS กว้างขึ้น จึงวาง Subcarrier ได้น้อยลง</p>
            <div
              className="nr-slot-line"
              style={{ "--slots": selectedNumerology.slots } as CSSProperties}
              aria-label={`หนึ่งมิลลิวินาทีแบ่งเป็น ${selectedNumerology.slots} Slot`}
            >
              {Array.from({ length: selectedNumerology.slots }, (_, index) => (
                <i key={index}><span>{index + 1}</span></i>
              ))}
            </div>
            <p>เส้นเวลา 1 ms เดิมถูกแบ่งเป็น Slot มากขึ้น</p>
          </div>
        </div>

        <aside className="nr-release-note">
          <b>Release 18 เพิ่มอีกสองค่า</b>
          <p>สเปกปัจจุบันรองรับ μ = 5 และ 6 หรือ SCS 480 และ 960 kHz สำหรับกรณีความถี่สูง เช่น FR2-2 ส่วนภาพหลักใช้ค่าคลาสสิก 15 ถึง 240 kHz เพื่อให้เห็นแนวคิดได้ง่าย</p>
        </aside>
      </section>

      <section className="nr-section" id="nr-grid">
        <div className="nr-heading">
          <p className="nr-section-index">03 / ซูมเข้า Resource Grid</p>
          <h2>RE คือหนึ่งช่อง RB คือความกว้าง 12 แถว</h2>
          <p>
            Resource Grid วางเวลาในแนวนอนและความถี่ในแนวตั้ง
            Scheduler จึงระบุตำแหน่งข้อมูลได้ทั้งสองแกนอย่างละเอียด
          </p>
        </div>

        <div className="nr-grid-layout">
          <ResourceGrid />
          <div className="nr-grid-explain">
            <article>
              <span>RE</span>
              <h3>Resource Element</h3>
              <p>หนึ่ง Subcarrier × หนึ่ง OFDM Symbol เป็นช่องเล็กที่สุดใน Grid และอาจใช้บรรทุกข้อมูล Control หรือ Reference Signal</p>
            </article>
            <article>
              <span>RB</span>
              <h3>Resource Block</h3>
              <p>12 Subcarriers ต่อเนื่องในแกนความถี่ นิยามของ RB ไม่ได้กำหนดว่าต้องยาว 14 Symbols เสมอ</p>
            </article>
            <aside>
              <b>จุดที่มักเข้าใจผิด</b>
              <p>ภาพตาราง 12×14 แสดงหนึ่ง RB ตลอดหนึ่ง Slot แบบ Normal CP เพื่อช่วยมองภาพ แต่การจัดสรรจริงสามารถใช้เพียงบาง OFDM Symbols ได้</p>
            </aside>
          </div>
        </div>

        <div className="nr-bwp">
          <div className="nr-bwp-heading">
            <div>
              <p className="nr-section-index">Bandwidth Part</p>
              <h3>ไม่จำเป็นต้องเปิดรับทั้ง Carrier ตลอดเวลา</h3>
            </div>
            <p>
              BWP คือกลุ่ม Common Resource Blocks ที่ต่อเนื่องกันและใช้ Numerology เดียวกัน
              UE ตั้งค่าได้สูงสุด 4 BWP ต่อทิศทาง แต่โดยทั่วไป Active ครั้งละหนึ่ง BWP
            </p>
          </div>
          <div className="nr-bwp-controls" role="tablist" aria-label="เลือกตัวอย่าง Bandwidth Part">
            {(Object.keys(bwpModes) as BwpMode[]).map((mode) => (
              <button
                type="button"
                role="tab"
                aria-selected={bwpMode === mode}
                key={mode}
                onClick={() => setBwpMode(mode)}
              >
                {bwpModes[mode].label}
              </button>
            ))}
          </div>
          <div className="nr-carrier">
            <span>Carrier Bandwidth</span>
            <i
              className="nr-active-bwp"
              style={{
                "--bwp-left": selectedBwp.left,
                "--bwp-width": selectedBwp.width,
              } as CSSProperties}
            >
              Active BWP
            </i>
          </div>
          <p className="nr-bwp-note">{selectedBwp.note}</p>
        </div>
      </section>

      <section className="nr-section nr-channel-section" id="nr-channels">
        <div className="nr-heading">
          <p className="nr-section-index">04 / Signal กับ Channel</p>
          <h2>Signal ช่วยวัดและซิงก์ Channel มีหน้าที่ขนข้อมูล</h2>
          <p>
            PSS และ SSS เป็น Physical Signals จึงไม่ได้บรรทุกข้อมูลจาก Higher Layer
            ส่วน PBCH, PDCCH, PDSCH, PRACH, PUCCH และ PUSCH เป็น Physical Channels
          </p>
        </div>

        <div className="nr-ssb">
          <div className="nr-ssb-copy">
            <p className="nr-section-index">SS/PBCH Block</p>
            <h3>SSB คือป้ายบอกทางชุดแรกที่ UE ต้องหาให้เจอ</h3>
            <p>
              หนึ่ง SSB กิน 4 OFDM Symbols และ 240 Subcarriers
              ภายในมี PSS, SSS, PBCH และ DM-RS สำหรับ PBCH
            </p>
            <ul>
              <li><b>PSS</b><span>จับ Timing เบื้องต้นและส่วนหนึ่งของ Cell ID</span></li>
              <li><b>SSS</b><span>ช่วยระบุ Cell ID ที่สมบูรณ์และ Frame Timing</span></li>
              <li><b>PBCH</b><span>ส่ง MIB และข้อมูลเริ่มต้นสำหรับค้นหา PDCCH</span></li>
            </ul>
          </div>
          <div className="nr-ssb-grid" role="img" aria-label="แผนผังอย่างง่ายของ SSB สี่ OFDM Symbols และ 240 Subcarriers">
            <span className="nr-symbol-label s0">Symbol 0</span>
            <i className="pss">PSS</i>
            <span className="nr-symbol-label s1">Symbol 1</span>
            <i className="pbch pbch-full-a">PBCH</i>
            <span className="nr-symbol-label s2">Symbol 2</span>
            <i className="pbch pbch-edge-a">PBCH</i>
            <i className="sss">SSS</i>
            <i className="pbch pbch-edge-b">PBCH</i>
            <span className="nr-symbol-label s3">Symbol 3</span>
            <i className="pbch pbch-full-b">PBCH</i>
            <small>240 Subcarriers →</small>
          </div>
        </div>

        <div className="nr-channel-map">
          <div className="nr-direction downlink">
            <div className="nr-direction-heading">
              <span>gNB → UE</span>
              <h3>Downlink</h3>
            </div>
            {channels.downlink.map((channel) => (
              <article key={channel.name}>
                <div><b>{channel.name}</b><small>{channel.type}</small></div>
                <p>{channel.purpose}</p>
                <span>{channel.payload}</span>
              </article>
            ))}
          </div>
          <div className="nr-link-center" aria-hidden="true">
            <i>↓</i>
            <b>gNB</b>
            <span>Radio Link</span>
            <b>UE</b>
            <i>↑</i>
          </div>
          <div className="nr-direction uplink">
            <div className="nr-direction-heading">
              <span>UE → gNB</span>
              <h3>Uplink</h3>
            </div>
            {channels.uplink.map((channel) => (
              <article key={channel.name}>
                <div><b>{channel.name}</b><small>{channel.type}</small></div>
                <p>{channel.purpose}</p>
                <span>{channel.payload}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nr-section nr-access" id="nr-access">
        <div className="nr-heading">
          <p className="nr-section-index">05 / Initial Access</p>
          <h2>จากยังไม่รู้จัก Cell สู่การส่งข้อมูลครั้งแรก</h2>
          <p>
            ลำดับนี้เชื่อมคำศัพท์ทั้งหมดเข้าด้วยกัน
            โปรดจำว่า PDCCH มักเป็นป้ายบอกตำแหน่ง ส่วน PDSCH หรือ PUSCH เป็นพื้นที่บรรทุกข้อมูล
          </p>
        </div>
        <ol className="nr-access-flow">
          {initialAccess.map((item, index) => (
            <li
              key={item.step}
              style={{ "--step": index } as CSSProperties}
            >
              <span>{item.step}</span>
              <div>
                <b>{item.tags}</b>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="nr-section nr-summary">
        <div className="nr-heading">
          <p className="nr-section-index">06 / สรุปภาพใหญ่</p>
          <h2>วางศัพท์ทุกคำไว้ในชั้นที่ถูกต้อง</h2>
        </div>
        <div className="nr-layer-stack">
          <div><b>Spectrum</b><span>FR1 / FR2</span><p>NR ทำงานอยู่ที่ความถี่ใด</p></div>
          <div><b>Architecture</b><span>NSA / SA</span><p>Radio เชื่อมกับ Core แบบใด</p></div>
          <div><b>Timing</b><span>Numerology / SCS</span><p>Subcarrier และ Slot มีจังหวะเท่าไร</p></div>
          <div><b>Resource</b><span>Grid / RE / RB / BWP</span><p>Scheduler วางข้อมูลไว้ตรงไหน</p></div>
          <div><b>Air Interface</b><span>Signal / Channel</span><p>UE หา Cell รับคำสั่ง และรับส่งข้อมูลอย่างไร</p></div>
        </div>
      </section>

      <section className="nr-section nr-quiz-section" id="nr-quiz">
        <div className="nr-heading">
          <p className="nr-section-index">07 / ตรวจความเข้าใจ</p>
          <h2>แบบทดสอบท้ายบท</h2>
          <p>เลือกให้ครบทั้ง {quiz.length} ข้อ แล้วตรวจคำตอบพร้อมคำอธิบายได้ทันที</p>
        </div>

        {submitted && (
          <QuizSummary
            score={score}
            total={quiz.length}
            onRetry={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            nextHref="/signal-quality"
            nextLabel="ไปบทที่ 04"
          />
        )}

        <div className="nr-quiz-list">
          {quiz.map((item, index) => {
            const selected = answers[index];
            const isCorrect = selected === item.answer;
            return (
              <fieldset
                className={`nr-question${submitted ? isCorrect ? " correct" : " incorrect" : ""}`}
                key={item.question}
              >
                <legend><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</legend>
                <div className="nr-choices">
                  {item.choices.map((choice, choiceIndex) => (
                    <label key={choice}>
                      <input
                        type="radio"
                        name={`nr-question-${index}`}
                        checked={selected === choiceIndex}
                        onChange={() => {
                          setAnswers((current) => ({ ...current, [index]: choiceIndex }));
                          setSubmitted(false);
                        }}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
                {submitted && (
                  <p className="nr-feedback">
                    <strong>{isCorrect ? "ถูกต้อง" : "ทบทวนอีกนิด"}</strong>
                    <span>{item.explain}</span>
                  </p>
                )}
              </fieldset>
            );
          })}
        </div>

        <div className="nr-quiz-actions">
          <button
            className="nr-primary"
            type="button"
            disabled={Object.keys(answers).length !== quiz.length}
            onClick={() => setSubmitted(true)}
          >
            ตรวจคำตอบ
          </button>
        </div>
      </section>

      <section className="nr-sources">
        <div>
          <p className="nr-section-index">แหล่งอ้างอิงหลัก</p>
          <h2>ต่อยอดจากสไลด์ และตรวจด้วยมาตรฐานปัจจุบัน</h2>
          <p>สไลด์ต้นทางหน้า 48 ใช้เป็นแผนที่ Channel/Signal ส่วนตัวเลขและนิยามตรวจทานกับเอกสาร 3GPP/ETSI Release 18</p>
        </div>
        <ul>
          <li><a href="https://www.3gpp.org/technologies/5g-system-overview" target="_blank" rel="noreferrer">3GPP: 5G System Overview และ NSA/SA</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138100_138199/138104/18.09.00_60/ts_138104v180900p.pdf" target="_blank" rel="noreferrer">ETSI TS 138 104: Frequency Ranges</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138200_138299/138211/18.07.00_60/ts_138211v180700p.pdf" target="_blank" rel="noreferrer">ETSI TS 138 211: Physical Channels and Modulation</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138200_138299/138201/18.00.00_60/ts_138201v180000p.pdf" target="_blank" rel="noreferrer">ETSI TS 138 201: NR Physical Layer Overview</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138300_138399/138300/18.01.00_60/ts_138300v180100p.pdf" target="_blank" rel="noreferrer">ETSI TS 138 300: NR and NG-RAN Overview</a></li>
        </ul>
      </section>

      <footer className="nr-footer">
        <div>
          <p>จบบทเรียนที่ 03</p>
          <h2>ตอนนี้คุณตามเส้นทางจาก SSB ถึงข้อมูลบน PDSCH และ PUSCH ได้แล้ว</h2>
        </div>
        <div>
          <Link href="/signal-quality">บทต่อไป: คุณภาพสัญญาณ →</Link>
          <Link href="/rf-modulation">← กลับบทเรียน RF</Link>
          <a href="#nr-top">ทบทวนด้านบน ↑</a>
        </div>
      </footer>
    </main>
  );
}
