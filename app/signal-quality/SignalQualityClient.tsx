"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { BeginnerBridge, QuizSummary } from "../components/LearningSupport";

type MetricKey = "RSRP" | "RSRQ" | "SINR";
type ScenarioKey = "clean" | "interference" | "edge" | "blocked";
type MimoKey = "SISO" | "MIMO" | "Massive MIMO";
type ToolKey = "scanner" | "phone";

const metrics: Record<
  MetricKey,
  {
    question: string;
    unit: string;
    simple: string;
    technical: string;
    caution: string;
    accent: string;
  }
> = {
  RSRP: {
    question: "สัญญาณอ้างอิงมาถึงแรงแค่ไหน?",
    unit: "dBm",
    simple: "วัดกำลังของ Reference Signal ที่รับได้ ใช้ดูความแรงและแนวโน้ม Coverage",
    technical:
      "LTE ใช้ RSRP จาก Cell-specific Reference Signal ส่วน 5G NR มักรายงาน SS-RSRP จาก RE ที่บรรทุก SSS ภายใน SSB และอาจใช้ PBCH DM-RS เพิ่มตามเงื่อนไข",
    caution: "ค่าใกล้ 0 มากกว่าแปลว่าแรงกว่า เช่น -80 dBm แรงกว่า -105 dBm",
    accent: "strength",
  },
  RSRQ: {
    question: "Reference Signal เด่นแค่ไหนเมื่อเทียบกับพลังงานรวม?",
    unit: "dB",
    simple: "สะท้อนทั้งสัญญาณที่ต้องการ พลังงานรวมในช่องสัญญาณ Load และ Interference",
    technical:
      "แนวคิดของสูตรคือ N × RSRP ÷ RSSI โดยคำนวณในสเกลเชิงเส้นก่อนแปลงเป็น dB สำหรับ NR เรียก SS-RSRQ เมื่ออ้างอิง SSB",
    caution: "RSRP ดีแต่ RSRQ แย่ได้ เมื่อช่องสัญญาณมีโหลดสูงหรือมี Cell อื่นรบกวน",
    accent: "quality",
  },
  SINR: {
    question: "สัญญาณที่ต้องการชนะ Interference และ Noise แค่ไหน?",
    unit: "dB",
    simple: "เปรียบเทียบกำลังสัญญาณที่ต้องการกับผลรวมของสัญญาณรบกวนและ Noise",
    technical:
      "SINR = S ÷ (I + N) ในสเกลเชิงเส้น แล้วรายงานเป็น dB สำหรับ NR มี SS-SINR และ CSI-SINR ตาม Reference Signal ที่ใช้วัด",
    caution: "SINR มีผลต่อ Modulation, Coding, Throughput และความเสถียร แต่ไม่ใช่คำรับประกันความเร็ว",
    accent: "clarity",
  },
};

const scenarios: Record<
  ScenarioKey,
  {
    label: string;
    place: string;
    rsrp: number;
    rsrq: number;
    sinr: number;
    diagnosis: string;
    action: string;
  }
> = {
  clean: {
    label: "ใกล้สถานี สัญญาณสะอาด",
    place: "Coverage ดีและ Interference ต่ำ",
    rsrp: -78,
    rsrq: -8,
    sinr: 24,
    diagnosis: "ทั้งความแรงและคุณภาพดี มีโอกาสใช้ Modulation ลำดับสูงได้",
    action: "ใช้เป็นจุดอ้างอิงก่อนออกไปวัดขอบพื้นที่",
  },
  interference: {
    label: "แรง แต่ถูกรบกวน",
    place: "ได้ยินหลาย Cell พร้อมกัน",
    rsrp: -80,
    rsrq: -17,
    sinr: 1,
    diagnosis: "RSRP ดูดี แต่ RSRQ และ SINR ต่ำ จึงไม่ควรสรุปว่าใช้งานดีจากความแรงอย่างเดียว",
    action: "ตรวจ PCI เพื่อนบ้าน, Beam overlap, โหลด และ Spectrum เพิ่ม",
  },
  edge: {
    label: "ขอบ Cell",
    place: "อยู่ไกลหรือมี Path Loss สูง",
    rsrp: -108,
    rsrq: -14,
    sinr: 2,
    diagnosis: "สัญญาณอ่อนและเหลือระยะห่างจาก Noise/Interference น้อย",
    action: "เดินวัดต่อเนื่องเพื่อหา Coverage hole และจุดเปลี่ยน Serving Cell",
  },
  blocked: {
    label: "ถูกบังและมีสัญญาณสะท้อน",
    place: "หลังอาคารหรือในอาคารลึก",
    rsrp: -105,
    rsrq: -19,
    sinr: -4,
    diagnosis: "ทั้งความแรงและความสะอาดต่ำ การเชื่อมต่ออาจแกว่งหรือหลุด",
    action: "เทียบหลาย Band, หลาย Beam และวัดทั้ง Scanner กับโทรศัพท์",
  },
};

const mimoModes: Record<
  MimoKey,
  {
    short: string;
    paths: number;
    antennas: number;
    goal: string;
    detail: string;
    watch: string;
  }
> = {
  SISO: {
    short: "1 × 1",
    paths: 1,
    antennas: 1,
    goal: "ส่งข้อมูลผ่านเส้นทางหลักหนึ่งชุด",
    detail: "มีสายอากาศส่งหนึ่งชุดและรับหนึ่งชุด เข้าใจง่าย แต่ไม่ใช้มิติเชิงพื้นที่เพิ่มความจุ",
    watch: "ความเร็วและความทนต่อ Fading จำกัดกว่าแบบหลายสายอากาศ",
  },
  MIMO: {
    short: "หลาย Tx × หลาย Rx",
    paths: 4,
    antennas: 4,
    goal: "เพิ่มความทนทานหรือส่งหลาย Data Layer",
    detail: "ใช้ช่องสัญญาณหลายเส้นทางเพื่อทำ Diversity, Beamforming หรือ Spatial Multiplexing",
    watch: "จำนวนเสาไม่เท่ากับจำนวน Layer เสมอ ขึ้นกับ Channel, UE และ Scheduler",
  },
  "Massive MIMO": {
    short: "Antenna Array ขนาดใหญ่",
    paths: 8,
    antennas: 12,
    goal: "สร้าง Beam แคบและให้บริการหลายผู้ใช้เชิงพื้นที่",
    detail: "ใช้ Array ที่มีองค์ประกอบจำนวนมากควบคุม Phase และ Amplitude เพื่อรวมพลังงานไปยังทิศทางที่ต้องการ",
    watch: "คำว่า Massive ไม่ได้กำหนดจำนวนตายตัว และประสิทธิภาพจริงขึ้นกับการติดตั้งกับสภาพแวดล้อม",
  },
};

const tools: Record<
  ToolKey,
  {
    label: string;
    role: string;
    connection: string;
    scope: string;
    strength: string;
    limitation: string;
    answers: string;
  }
> = {
  scanner: {
    label: "Network Scanner",
    role: "มองภาพ RF จากอากาศ",
    connection: "Passive receiver ไม่ Attach เข้ากับเครือข่าย",
    scope: "สแกนหลาย Band, Technology, Operator, Cell และ Beam ได้พร้อมกันตาม License/Configuration",
    strength: "เครื่องมือเฉพาะทางที่มีเส้นทางรับและสายอากาศสำหรับงานวัด ช่วยเปรียบเทียบ RF ได้สม่ำเสมอ",
    limitation: "ไม่สะท้อนการทำงานของ Modem, SIM, Scheduler และ Application แบบผู้ใช้จริง",
    answers: "ตรงนี้มีสัญญาณอะไรบ้าง และ RF แต่ละ Cell/Beam เป็นอย่างไร?",
  },
  phone: {
    label: "Test Phone",
    role: "มองจากประสบการณ์อุปกรณ์ผู้ใช้",
    connection: "Active UE, Attach ตาม SIM, PLMN และนโยบายเครือข่าย",
    scope: "วัด Serving Cell และ Neighbor ที่อุปกรณ์หรือเครือข่ายเปิดให้รายงาน พร้อมทดสอบบริการจริง",
    strength: "เห็นการเลือก Cell, Handover, Throughput, Call, Data Session และผลจาก Modem/เสาอากาศของเครื่อง",
    limitation: "มองเครือข่ายอื่นได้จำกัด และผลขึ้นกับรุ่นเครื่อง Firmware SIM และการควบคุมจาก Network",
    answers: "ผู้ใช้ด้วย SIM และอุปกรณ์นี้ ได้รับบริการจริงอย่างไร?",
  },
};

const quiz = [
  {
    question: "ข้อใดอธิบาย RSRP ได้ถูกต้องที่สุด?",
    choices: [
      "กำลังของ Reference Signal ที่รับได้ ใช้ดูความแรงและ Coverage",
      "สัดส่วนสัญญาณที่ต้องการต่อ Interference และ Noise",
      "ความเร็ว Download ที่วัดได้",
    ],
    answer: 0,
    explain: "RSRP หรือ SS-RSRP เน้นกำลังของ Reference Signal ส่วน SINR ใช้เทียบกับ Interference และ Noise",
  },
  {
    question: "-80 dBm กับ -105 dBm ค่าใดแรงกว่า?",
    choices: ["-105 dBm", "-80 dBm", "เท่ากัน"],
    answer: 1,
    explain: "ค่ากำลังใน dBm ที่ใกล้ 0 มากกว่าจะสูงกว่า ดังนั้น -80 dBm แรงกว่า -105 dBm",
  },
  {
    question: "RSRP ดี แต่ SINR ต่ำ บอกอะไรได้?",
    choices: [
      "สัญญาณแรงแต่มี Interference หรือ Noise สูง",
      "เครือข่ายไม่มีสัญญาณเลย",
      "Throughput ต้องสูงเสมอ",
    ],
    answer: 0,
    explain: "พลังงานของสัญญาณที่ต้องการอาจแรง แต่ถ้ามีพลังงานรบกวนมาก SINR ก็ต่ำและใช้งานได้ไม่เต็มที่",
  },
  {
    question: "Massive MIMO มีเป้าหมายสำคัญข้อใด?",
    choices: [
      "ใช้ Antenna Array สร้าง Beam และแยกผู้ใช้เชิงพื้นที่",
      "เปลี่ยน 5G ให้เป็นระบบสายทองแดง",
      "ยกเลิกการใช้ Reference Signal",
    ],
    answer: 0,
    explain: "Array ขนาดใหญ่ช่วยควบคุมทิศทางพลังงานและรองรับผู้ใช้หลายรายด้วยทรัพยากรเชิงพื้นที่",
  },
  {
    question: "SSB Index กับ PCI ต่างกันอย่างไร?",
    choices: [
      "SSB Index ชี้ SSB/Beam ภายใน Cell ส่วน PCI ระบุ Cell ทางกายภาพ",
      "ทั้งสองเป็นหมายเลข SIM",
      "ทั้งสองต้องไม่ซ้ำกันทั่วโลก",
    ],
    answer: 0,
    explain: "SSB Index ผูกกับ SSB candidate ภายใน Burst Set ส่วน PCI มาจาก PSS/SSS และใช้ระบุ Cell ทางกายภาพ",
  },
  {
    question: "5G NR มี Physical Cell ID กี่ค่า?",
    choices: ["168 ค่า", "504 ค่า", "1008 ค่า, ตั้งแต่ 0 ถึง 1007"],
    answer: 2,
    explain: "NR กำหนด PCI 1008 ค่า จาก N_ID_cell = 3 × N_ID^(1) + N_ID^(2)",
  },
  {
    question: "เครื่องมือใดเหมาะกับคำถามว่าในอากาศมี Cell จากหลายเครือข่ายอะไรบ้าง?",
    choices: ["Passive Scanner", "โทรศัพท์ที่ Attach ด้วย SIM เดียว", "แอป Speed Test เพียงอย่างเดียว"],
    answer: 0,
    explain: "Scanner รับอย่างเดียวและสแกนหลายเครือข่ายได้ตาม Band กับ Configuration โดยไม่ต้อง Attach",
  },
  {
    question: "เหตุใดงานสำรวจที่ดีจึงควรใช้ Scanner และโทรศัพท์ร่วมกัน?",
    choices: [
      "Scanner อธิบาย RF ส่วนโทรศัพท์ยืนยันประสบการณ์บริการจริง",
      "เพื่อให้ค่าทุกตัวเท่ากันเสมอ",
      "เพราะ Scanner โทรออกไม่ได้เท่านั้น",
    ],
    answer: 0,
    explain: "เครื่องมือทั้งสองตอบคนละคำถาม เมื่อนำมาซ้อนกันจะแยกปัญหา RF ออกจากปัญหา Device, SIM, Network และ Service ได้ดีขึ้น",
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

function meterPosition(metric: MetricKey, value: number) {
  if (metric === "RSRP") return Math.max(3, Math.min(97, ((value + 120) / 50) * 100));
  if (metric === "RSRQ") return Math.max(3, Math.min(97, ((value + 24) / 19) * 100));
  return Math.max(3, Math.min(97, ((value + 10) / 40) * 100));
}

function MetricMeter({ metric, value }: { metric: MetricKey; value: number }) {
  return (
    <div className={`sq-meter sq-meter-${metrics[metric].accent}`}>
      <div className="sq-meter-heading">
        <span>{metric === "RSRP" ? "RSRP / SS-RSRP" : metric}</span>
        <strong>{value} {metrics[metric].unit}</strong>
      </div>
      <div className="sq-meter-track" aria-label={`${metric} เท่ากับ ${value} ${metrics[metric].unit}`}>
        <i style={{ "--meter-position": `${meterPosition(metric, value)}%` } as CSSProperties} />
      </div>
      <div className="sq-meter-scale">
        <span>{metric === "RSRP" ? "-120" : metric === "RSRQ" ? "-24" : "-10"}</span>
        <span>{metric === "RSRP" ? "-70" : metric === "RSRQ" ? "-5" : "30"}</span>
      </div>
    </div>
  );
}

function MimoVisual({ mode }: { mode: MimoKey }) {
  const selected = mimoModes[mode];
  return (
    <div className={`sq-mimo-visual sq-mimo-${mode.replace(" ", "-").toLowerCase()}`} role="img" aria-label={`ภาพแนวคิด ${mode}`}>
      <div className="sq-array">
        {Array.from({ length: selected.antennas }, (_, index) => <i key={index} />)}
        <b>Tx</b>
      </div>
      <div className="sq-spatial-paths" aria-hidden="true">
        {Array.from({ length: selected.paths }, (_, index) => (
          <i key={index} style={{ "--path-index": index } as CSSProperties} />
        ))}
      </div>
      <div className="sq-receivers">
        {Array.from({ length: mode === "Massive MIMO" ? 3 : 1 }, (_, index) => (
          <span key={index}>{mode === "Massive MIMO" ? `UE ${index + 1}` : "Rx"}</span>
        ))}
      </div>
    </div>
  );
}

export default function SignalQualityClient() {
  const [metric, setMetric] = useState<MetricKey>("RSRP");
  const [scenario, setScenario] = useState<ScenarioKey>("clean");
  const [mimoMode, setMimoMode] = useState<MimoKey>("SISO");
  const [beamIndex, setBeamIndex] = useState(2);
  const [tool, setTool] = useState<ToolKey>("scanner");
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionPreference,
    getServerReducedMotionPreference,
  );
  const isMotionPlaying = motionEnabled && !prefersReducedMotion;
  const selectedScenario = scenarios[scenario];
  const selectedMetric = metrics[metric];
  const selectedMimo = mimoModes[mimoMode];
  const selectedTool = tools[tool];

  const score = useMemo(
    () => quiz.reduce(
      (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
      0,
    ),
    [answers],
  );

  return (
    <main className={`sq-page${isMotionPlaying ? "" : " sq-motion-paused"}`}>
      <header className="sq-header">
        <Link className="sq-brand" href="/">
          <span aria-hidden="true">RF</span>
          <span>
            <strong>Mobile Network Classroom</strong>
            <small>บทเรียนที่ 04</small>
          </span>
        </Link>
        <div className="sq-header-actions">
          <nav aria-label="หัวข้อในบทเรียนคุณภาพสัญญาณ">
            <a href="#sq-metrics">ค่าที่วัด</a>
            <a href="#sq-beams">Beam &amp; MIMO</a>
            <a href="#sq-tools">เครื่องมือวัด</a>
            <Link href="/field-guide">คู่มือภาคสนาม</Link>
            <a href="#sq-quiz">แบบทดสอบ</a>
          </nav>
          <button
            className="sq-motion-toggle"
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

      <section className="sq-hero" id="sq-top">
        <div className="sq-hero-copy">
          <p className="sq-kicker">Signal Quality, Beamforming &amp; Field Measurement</p>
          <h1>สัญญาณแรง<br />ไม่ได้แปลว่าดีเสมอ</h1>
          <p>
            อ่าน RSRP, RSRQ และ SINR ให้เป็น เห็นภาพว่า Antenna Array สร้าง Beam อย่างไร
            แล้วเลือก Scanner หรือโทรศัพท์ให้ตอบคำถามภาคสนามได้ตรงจุด
          </p>
          <div className="sq-hero-actions">
            <a className="sq-primary" href="#sq-metrics">เริ่มอ่านค่าสัญญาณ ↓</a>
            <span>ใช้เวลาประมาณ 28 นาที</span>
          </div>
        </div>
        <div className="sq-hero-visual" role="img" aria-label="สัญญาณที่แรงอาจมีสัญญาณรบกวนสูง จึงต้องดู RSRP RSRQ และ SINR ร่วมกัน">
          <div className="sq-hero-array" aria-hidden="true">
            {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
          </div>
          <div className="sq-hero-beams" aria-hidden="true"><i /><i /><i /></div>
          <div className="sq-hero-reading">
            <span><b>-80</b> dBm<small>แรง</small></span>
            <span><b>1</b> dB<small>แต่ SINR ต่ำ</small></span>
          </div>
          <p>ดูครบ 3 มุมก่อนสรุป</p>
        </div>
      </section>

      <BeginnerBridge
        lesson="signal"
        tldr={[
          "RSRP บอกว่าคลื่นอ้างอิงมาถึงแรงเท่าไร แต่ยังไม่บอกว่าช่องสัญญาณสะอาดหรือมีคนใช้แน่นแค่ไหน",
          "RSRQ ช่วยมองคุณภาพรวมเมื่อเทียบ Reference Signal กับพลังงานในช่อง ส่วน SINR เปรียบเทียบสัญญาณที่ต้องการกับ Interference และ Noise",
          "Scanner เหมาะกับการเห็น RF หลายเครือข่ายแบบ Passive ส่วนโทรศัพท์เหมาะกับการตาม Signalling และประสบการณ์บริการของ SIM ที่ใช้งานจริง",
        ]}
        analogy={{
          title: "ความดังกับความชัดเป็นคนละเรื่อง",
          body: "RSRP เหมือนความดังของคนที่ตะโกนหาเรา ส่วน SINR เหมือนความชัดของเสียงนั้นเมื่อเทียบกับเสียงคนรอบข้าง แม้เขาตะโกนดัง แต่ถ้าทั้งสนามตะโกนพร้อมกัน เราก็อาจฟังไม่รู้เรื่อง",
        }}
        scenario={{
          title: "ทำไมคอนเสิร์ตขึ้น 5G เต็มขีด แต่เน็ตไม่วิ่ง?",
          body: "ขีดสัญญาณสะท้อนความแรงมากกว่าความจุ เมื่อคนจำนวนมากแย่ง Resource Blocks และ Cell มีโหลดสูง RSRP อาจยังดี แต่ SINR, Scheduler Share หรือเส้นทางหลังสถานีฐานกลายเป็นคอขวดได้",
        }}
        technicalNotes={[
          {
            title: "เกณฑ์สีเป็นแนวทาง ไม่ใช่ Pass/Fail ของ 3GPP",
            body: "ช่วงค่า RSRP/RSRQ/SINR ที่ใช้ในงานภาคสนามขึ้นกับ Band, Bandwidth, Vendor, Measurement Type, โหลด และ KPI ของโครงการ จึงต้องระบุเงื่อนไขก่อนใช้ตัดสิน ดูตารางช่วงค่าแบบใช้งานเร็วได้ในคู่มือภาคสนาม",
          },
          {
            title: "ดูค่าเป็นชุดและดูแนวโน้ม",
            body: "จุดวัดเดียวไม่อธิบาย Coverage ทั้งพื้นที่ ควรดู RSRP, RSRQ, SINR, Serving/Neighbor, Band, PCI/SSB Index และ Service KPI ตามตำแหน่งกับเวลาเดียวกัน",
          },
        ]}
        terms={[
          { term: "RSRP", engineering: "กำลังเฉลี่ยของ Reference Signal ที่รับได้", plain: "ความดังของเสียงจาก Cell ที่มาถึงมือถือ" },
          { term: "SINR", engineering: "สัดส่วน Signal ต่อ Interference และ Noise", plain: "ความชัดของเสียงคุยเทียบกับเสียงรอบข้าง" },
          { term: "PCI", engineering: "Physical Cell Identity ของ Radio Cell", plain: "ป้ายหมายเลขวิทยุของ Cell ไม่ใช่รหัสสถานีทั่วโลก" },
          { term: "SSB Index", engineering: "ดัชนี SSB/Beam ที่ UE ตรวจพบ", plain: "หมายเลขทิศของลำสัญญาณนำทางภายใน Cell" },
        ]}
      />

      <section className="sq-roadmap" aria-labelledby="sq-roadmap-title">
        <p className="sq-section-index">แผนที่การเรียนรู้</p>
        <div>
          <h2 id="sq-roadmap-title">จากตัวเลขบนจอ สู่สาเหตุในอากาศ</h2>
          <ol>
            <li><span>01</span>อ่านความแรง คุณภาพ และ Interference แยกกัน</li>
            <li><span>02</span>เข้าใจ SISO, MIMO, Massive MIMO และการกวาด Beam</li>
            <li><span>03</span>แยก SSB Index ออกจาก PCI และเลือกเครื่องมือวัด</li>
          </ol>
        </div>
      </section>

      <section className="sq-section sq-metrics-section" id="sq-metrics">
        <div className="sq-heading">
          <p className="sq-section-index">01 / ตัวชี้วัดหลัก</p>
          <h2>สามค่าที่ตอบคนละคำถาม</h2>
          <p>แตะชื่อค่าเพื่อดูความหมาย หน่วย สูตรแนวคิด และสิ่งที่ต้องระวัง</p>
        </div>
        <div className="sq-metric-layout">
          <div className="sq-metric-tabs" role="tablist" aria-label="เลือกตัวชี้วัด">
            {(Object.keys(metrics) as MetricKey[]).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={metric === key}
                type="button"
                onClick={() => setMetric(key)}
              >
                <span>{key === "RSRP" ? "RSRP / SS-RSRP" : key}</span>
                <small>{metrics[key].unit}</small>
              </button>
            ))}
          </div>
          <article className={`sq-metric-explainer ${selectedMetric.accent}`}>
            <div>
              <p className="sq-label">คำถามที่ค่านี้ตอบ</p>
              <h3>{selectedMetric.question}</h3>
              <p>{selectedMetric.simple}</p>
            </div>
            <dl>
              <div><dt>เชิงเทคนิค</dt><dd>{selectedMetric.technical}</dd></div>
              <div><dt>อย่าตีความผิด</dt><dd>{selectedMetric.caution}</dd></div>
            </dl>
          </article>
        </div>

        <div className="sq-rule">
          <span>จำง่ายใน 10 วินาที</span>
          <div><b>RSRP</b><p>แรงเท่าไร</p></div>
          <i aria-hidden="true">+</i>
          <div><b>RSRQ</b><p>Reference เด่นแค่ไหน</p></div>
          <i aria-hidden="true">+</i>
          <div><b>SINR</b><p>ชนะสิ่งรบกวนเท่าไร</p></div>
        </div>
      </section>

      <section className="sq-section sq-lab" id="sq-lab">
        <div className="sq-heading sq-heading-light">
          <p className="sq-section-index">02 / ทดลองอ่านสถานการณ์</p>
          <h2>ค่าเดียวกันบางส่วน แต่ประสบการณ์ต่างกันได้</h2>
          <p>เลือกสภาพแวดล้อม แล้วสังเกตว่าความแรงกับคุณภาพไม่ได้เคลื่อนพร้อมกันเสมอ</p>
        </div>
        <div className="sq-scenario-tabs" role="tablist" aria-label="เลือกสถานการณ์สัญญาณ">
          {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={scenario === key}
              type="button"
              onClick={() => setScenario(key)}
            >
              {scenarios[key].label}
            </button>
          ))}
        </div>
        <div className="sq-lab-grid">
          <div className="sq-meter-stack">
            <MetricMeter metric="RSRP" value={selectedScenario.rsrp} />
            <MetricMeter metric="RSRQ" value={selectedScenario.rsrq} />
            <MetricMeter metric="SINR" value={selectedScenario.sinr} />
          </div>
          <article className="sq-diagnosis">
            <p className="sq-label">สภาพแวดล้อม</p>
            <h3>{selectedScenario.place}</h3>
            <p>{selectedScenario.diagnosis}</p>
            <div>
              <b>ตรวจต่ออย่างไร</b>
              <span>{selectedScenario.action}</span>
            </div>
          </article>
        </div>
        <aside className="sq-threshold-note">
          <strong>ช่วงสีเป็นคู่มือภาคสนามโดยประมาณ ไม่ใช่เกณฑ์ Pass/Fail ของ 3GPP</strong>
          <span>ค่าที่เหมาะสมขึ้นกับ Band, Bandwidth, อุปกรณ์, โหลด, Mobility และบริการที่ทดสอบ</span>
        </aside>
        <div className="sq-field-guide" aria-label="ช่วงค่าโดยประมาณสำหรับอ่านค่าภาคสนาม">
          <article>
            <b>RSRP / SS-RSRP</b>
            <span>≥ -80 แรงมาก</span>
            <span>-80 ถึง -90 ดี</span>
            <span>-90 ถึง -100 พอใช้</span>
            <span>-100 ถึง -110 อ่อน</span>
            <span>&lt; -110 อ่อนมาก</span>
          </article>
          <article>
            <b>RSRQ / SS-RSRQ</b>
            <span>≥ -10 ดี</span>
            <span>-10 ถึง -15 พอใช้</span>
            <span>-15 ถึง -20 แย่</span>
            <span>&lt; -20 แย่มาก</span>
          </article>
          <article>
            <b>SINR / SS-SINR</b>
            <span>≥ 20 ดีมาก</span>
            <span>13 ถึง 20 ดี</span>
            <span>0 ถึง 13 จำกัด</span>
            <span>&lt; 0 แย่</span>
          </article>
        </div>
      </section>

      <section className="sq-section sq-mimo-section" id="sq-beams">
        <div className="sq-heading">
          <p className="sq-section-index">03 / Beamforming และ MIMO</p>
          <h2>จากหนึ่งเส้นทาง สู่ทรัพยากรเชิงพื้นที่</h2>
          <p>การมีสายอากาศมากขึ้นไม่ใช่แค่เพิ่มกำลัง แต่เปิดทางให้ควบคุมทิศทางและ Data Layer</p>
        </div>
        <div className="sq-mimo-picker">
          <div className="sq-mimo-tabs" role="tablist" aria-label="เลือกชนิดระบบสายอากาศ">
            {(Object.keys(mimoModes) as MimoKey[]).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={mimoMode === key}
                type="button"
                onClick={() => setMimoMode(key)}
              >
                <span>{key}</span>
                <small>{mimoModes[key].short}</small>
              </button>
            ))}
          </div>
          <MimoVisual mode={mimoMode} />
          <article className="sq-mimo-copy">
            <p className="sq-label">เป้าหมายหลัก</p>
            <h3>{selectedMimo.goal}</h3>
            <p>{selectedMimo.detail}</p>
            <aside><b>ข้อควรจำ</b>{selectedMimo.watch}</aside>
          </article>
        </div>

        <div className="sq-beam-lab">
          <div className="sq-beam-copy">
            <p className="sq-section-index">SSB Index และ Beam Coverage</p>
            <h3>Cell เดียวกวาด SSB หลายทิศทางได้</h3>
            <p>
              gNB ส่ง SS/PBCH Block หลาย candidate ภายใน SS Burst Set
              เครื่องมือจึงอาจแสดง SS-RSRP และ SS-SINR แยกตาม SSB Index เพื่อบอกว่าทิศใดเด่น ณ จุดวัด
            </p>
            <div className="sq-beam-readout">
              <span>Cell PCI <b>321</b></span>
              <span>SSB Index <b>{beamIndex}</b></span>
              <span>SS-RSRP <b>{[-96, -87, -75, -82][beamIndex]} dBm</b></span>
            </div>
            <p className="sq-fine-print">
              SSB Index ระบุ SSB candidate ภายใน Cell ไม่ใช่รหัส Beam ที่ไม่ซ้ำทั่วเครือข่าย
              การผูกหนึ่ง SSB กับหนึ่งทิศ Beam เป็นแนวทางใช้งานที่พบบ่อย แต่รายละเอียดการส่งเป็นเรื่องของ Implementation
            </p>
          </div>
          <div className="sq-beam-map" role="group" aria-label="เลือก SSB Index เพื่อดูทิศทาง Beam">
            <div className="sq-beam-source" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="sq-beam-fans" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => (
                <i key={index} className={beamIndex === index ? "active" : ""} />
              ))}
            </div>
            <div className="sq-beam-target" aria-hidden="true">UE</div>
            <div className="sq-beam-controls">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={beamIndex === index}
                  onClick={() => setBeamIndex(index)}
                >
                  SSB {index}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sq-section sq-pci">
        <div className="sq-heading sq-heading-light">
          <p className="sq-section-index">04 / แยก Cell ด้วย PCI</p>
          <h2>PCI บอกว่าเรากำลังเห็น Cell ใดบนชั้นกายภาพ</h2>
        </div>
        <div className="sq-pci-layout">
          <div className="sq-pci-formula" aria-label="สูตร Physical Cell ID ของ 5G NR">
            <span>N<sub>ID</sub><sup>cell</sup></span>
            <i>=</i>
            <b>3 × N<sub>ID</sub><sup>(1)</sup> + N<sub>ID</sub><sup>(2)</sup></b>
          </div>
          <div className="sq-pci-facts">
            <article><strong>336</strong><span>ค่า SSS Group</span><small>N<sub>ID</sub><sup>(1)</sup> = 0 ถึง 335</small></article>
            <article><strong>3</strong><span>ค่า PSS</span><small>N<sub>ID</sub><sup>(2)</sup> = 0 ถึง 2</small></article>
            <article><strong>1008</strong><span>ค่า PCI</span><small>PCI = 0 ถึง 1007</small></article>
          </div>
          <div className="sq-pci-warning">
            <b>PCI ไม่ใช่หมายเลข Cell ที่ไม่ซ้ำทั่วโลก</b>
            <p>
              เครือข่ายนำ PCI กลับมาใช้ซ้ำได้เมื่ออยู่ห่างกันพอ การระบุ Cell ให้แน่นอนจึงต้องดูร่วมกับ
              Frequency/NR-ARFCN, PLMN และ Global Cell Identity เมื่อเครื่องมืออ่านได้
            </p>
          </div>
        </div>
      </section>

      <section className="sq-section sq-tools" id="sq-tools">
        <div className="sq-heading">
          <p className="sq-section-index">05 / Scanner เทียบกับโทรศัพท์</p>
          <h2>เลือกจากคำถาม ไม่ใช่เลือกผู้ชนะ</h2>
          <p>Scanner และโทรศัพท์เก่งคนละด้าน งานวิเคราะห์ที่ดีใช้ข้อมูลทั้งสองชุดประกอบกัน</p>
        </div>
        <div className="sq-tool-switch" role="tablist" aria-label="เลือกเครื่องมือวัด">
          {(Object.keys(tools) as ToolKey[]).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tool === key}
              type="button"
              onClick={() => setTool(key)}
            >
              {tools[key].label}
            </button>
          ))}
        </div>
        <div className="sq-tool-focus">
          <div className={`sq-device sq-device-${tool}`} aria-hidden="true">
            <span>{tool === "scanner" ? "SCAN" : "5G"}</span>
            <i /><i /><i /><i />
          </div>
          <article>
            <p className="sq-label">{selectedTool.role}</p>
            <h3>{selectedTool.label}</h3>
            <dl>
              <div><dt>วิธีทำงาน</dt><dd>{selectedTool.connection}</dd></div>
              <div><dt>มองเห็น</dt><dd>{selectedTool.scope}</dd></div>
              <div><dt>จุดแข็ง</dt><dd>{selectedTool.strength}</dd></div>
              <div><dt>ข้อจำกัด</dt><dd>{selectedTool.limitation}</dd></div>
            </dl>
            <blockquote>“{selectedTool.answers}”</blockquote>
          </article>
        </div>

        <div className="sq-comparison" aria-label="ตารางเปรียบเทียบ Scanner กับโทรศัพท์">
          <div className="sq-comparison-head"><span>หัวข้อ</span><b>Scanner</b><b>โทรศัพท์</b></div>
          <div><span>การเชื่อมต่อ</span><p>Passive, ไม่ต้องใช้ SIM</p><p>Active, ตาม SIM และ PLMN</p></div>
          <div><span>ขอบเขต RF</span><p>หลาย Operator/Band/Cell/Beam</p><p>Serving และ Neighbor ตามที่รองรับ</p></div>
          <div><span>ความสม่ำเสมอ</span><p>เหมาะกับการเปรียบเทียบ RF แบบ Calibration</p><p>ขึ้นกับรุ่นเครื่อง Modem และ Antenna</p></div>
          <div><span>บริการจริง</span><p>ไม่จำลอง Subscriber Experience ทั้งหมด</p><p>วัด Call, Data, Throughput และ Mobility ได้</p></div>
          <div><span>คำถามหลัก</span><p>ในอากาศมีอะไร?</p><p>ผู้ใช้ได้รับอะไร?</p></div>
        </div>

        <div className="sq-workflow">
          <p className="sq-section-index">Field workflow ที่แนะนำ</p>
          <ol>
            <li><span>1</span><b>Scanner เก็บภาพ RF</b><p>หา Coverage, Neighbor, PCI, SSB และ Interference โดยไม่ถูกผูกกับ SIM</p></li>
            <li><span>2</span><b>โทรศัพท์ทดสอบบริการ</b><p>ทำ Call/Data/Throughput และดู Serving Cell, Handover กับการควบคุมจาก Network</p></li>
            <li><span>3</span><b>ซ้อนข้อมูลตามเวลาและตำแหน่ง</b><p>แยกให้ได้ว่าปัญหาเกิดที่ RF, Cell Selection, Device, SIM, Core หรือ Service</p></li>
          </ol>
        </div>
      </section>

      <section className="sq-section sq-summary">
        <div className="sq-heading">
          <p className="sq-section-index">06 / สรุปก่อนลงพื้นที่</p>
          <h2>อ่านจากพลังงาน ไปสู่คุณภาพ แล้วค่อยหาสาเหตุ</h2>
        </div>
        <div className="sq-summary-flow">
          <div><b>01</b><span>RSRP</span><p>Coverage แรงพอไหม</p></div>
          <i>→</i>
          <div><b>02</b><span>RSRQ + SINR</span><p>สัญญาณสะอาดพอไหม</p></div>
          <i>→</i>
          <div><b>03</b><span>PCI + SSB</span><p>Cell และ Beam ใดกำลังเด่น</p></div>
          <i>→</i>
          <div><b>04</b><span>Scanner + Phone</span><p>RF ตรงกับประสบการณ์จริงไหม</p></div>
        </div>
      </section>

      <section className="sq-section sq-quiz-section" id="sq-quiz">
        <div className="sq-heading">
          <p className="sq-section-index">07 / ตรวจความเข้าใจ</p>
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
            nextHref="/mobility"
            nextLabel="ไปบทที่ 05"
          />
        )}
        <div className="sq-quiz-list">
          {quiz.map((item, index) => {
            const selected = answers[index];
            const isCorrect = selected === item.answer;
            return (
              <fieldset
                className={`sq-question${submitted ? isCorrect ? " correct" : " incorrect" : ""}`}
                key={item.question}
              >
                <legend><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</legend>
                <div className="sq-choices">
                  {item.choices.map((choice, choiceIndex) => (
                    <label key={choice}>
                      <input
                        type="radio"
                        name={`sq-question-${index}`}
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
                  <p className="sq-feedback">
                    <strong>{isCorrect ? "ถูกต้อง" : "ทบทวนอีกนิด"}</strong>
                    <span>{item.explain}</span>
                  </p>
                )}
              </fieldset>
            );
          })}
        </div>
        <div className="sq-quiz-actions">
          <button
            className="sq-primary"
            type="button"
            disabled={Object.keys(answers).length !== quiz.length}
            onClick={() => setSubmitted(true)}
          >
            ตรวจคำตอบ
          </button>
        </div>
      </section>

      <section className="sq-sources">
        <div>
          <p className="sq-section-index">แหล่งอ้างอิงหลัก</p>
          <h2>ยึดนิยามมาตรฐาน และแยกคำแนะนำภาคสนามให้ชัด</h2>
          <p>
            นิยามค่าของ NR และ PCI ตรวจทานกับ 3GPP/ETSI ส่วนแนวทาง Scanner กับโทรศัพท์
            อ้างอิงรูปแบบการวัดของผู้ผลิตเครื่องมือทดสอบและระบุข้อจำกัดไว้ครบ
          </p>
        </div>
        <ul>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138200_138299/138215/18.02.00_60/ts_138215v180200p.pdf" target="_blank" rel="noreferrer">ETSI TS 138 215: NR Physical Layer Measurements</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138200_138299/138211/18.07.00_60/ts_138211v180700p.pdf" target="_blank" rel="noreferrer">ETSI TS 138 211: PSS, SSS, SSB และ Physical Cell ID</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138300_138399/138300/15.19.00_60/ts_138300v151900p.pdf" target="_blank" rel="noreferrer">ETSI TS 138 300: Cell และ Beam Measurement</a></li>
          <li><a href="https://www.3gpp.org/news-events/3gpp-news/rel13" target="_blank" rel="noreferrer">3GPP: Beamforming และ Full-Dimension MIMO</a></li>
          <li><a href="https://www.rohde-schwarz.com/us/solutions/critical-infrastructure/mobile-network-testing/stories-insights/5g-mobile-network-testing-using-a-passive-network-scanner-part-2_255933.html" target="_blank" rel="noreferrer">Rohde &amp; Schwarz: Passive 5G Network Scanner</a></li>
          <li><a href="https://www.rohde-schwarz.com/us/solutions/critical-infrastructure/mobile-network-testing/stories-insights/coverage-and-performance-testing-of-5g-private-networks_255805.html" target="_blank" rel="noreferrer">Rohde &amp; Schwarz: Scanner และ Device-based Test</a></li>
        </ul>
      </section>

      <footer className="sq-footer">
        <div>
          <p>จบบทเรียนที่ 04</p>
          <h2>ตอนนี้คุณอ่านค่าคุณภาพ เห็น Cell กับ Beam และเลือกเครื่องมือวัดได้ตรงคำถามแล้ว</h2>
        </div>
        <div>
          <Link href="/5g-nr">← กลับบทเรียน 5G NR</Link>
          <a href="#sq-top">ทบทวนด้านบน ↑</a>
        </div>
      </footer>
    </main>
  );
}
