"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { BeginnerBridge, QuizSummary } from "../components/LearningSupport";

type CandidateKey = "A" | "B" | "C";

const accessSteps = [
  {
    short: "SCAN",
    title: "สแกนย่านความถี่",
    simple: "โทรศัพท์ตรวจความถี่ที่รองรับและใช้ข้อมูลเครือข่ายเดิมช่วยค้นหาให้เร็วขึ้น",
    technical: "UE อาจใช้ Stored Information เพื่อเร่ง Cell Selection แต่ยังต้องตรวจว่า Cell ปัจจุบันเหมาะสมและอนุญาตให้เข้าใช้",
    signal: "ความถี่",
  },
  {
    short: "SYNC",
    title: "จับเวลาและระบุ Cell",
    simple: "PSS และ SSS ช่วยให้มือถือซิงก์กับสัญญาณและคำนวณ Physical Cell ID",
    technical: "ใน NR ค่า PCI มี 1008 ค่า ตั้งแต่ 0–1007 และได้จากการรวมข้อมูลของ PSS กับ SSS",
    signal: "PSS + SSS",
  },
  {
    short: "MIB",
    title: "อ่านข้อมูลตั้งต้น",
    simple: "PBCH ภายใน SSB ส่ง MIB ให้มือถือรู้ข้อมูลพื้นฐานที่จำเป็นต่อการอ่านระบบต่อ",
    technical: "SSB = PSS + SSS + PBCH โดย PBCH มี PBCH DM-RS ช่วยการถอดรหัส",
    signal: "PBCH / MIB",
  },
  {
    short: "SIB1",
    title: "ตรวจเครือข่ายและสิทธิ์เข้าใช้",
    simple: "มือถืออ่าน SIB1 เพื่อรู้ PLMN, Tracking Area, การถูกห้ามเข้า Cell และทรัพยากรที่ต้องใช้ต่อ",
    technical: "เห็นสัญญาณไม่ได้แปลว่าเป็น Suitable Cell เสมอ ต้องผ่าน Cell Selection Criterion และข้อจำกัดการเข้าใช้",
    signal: "SIB1 / PLMN",
  },
  {
    short: "CAMP",
    title: "พักรอฟังอยู่บน Cell",
    simple: "เมื่อเลือก Cell ที่เหมาะสมได้ มือถือจะ Camp เพื่อรับ Paging, System Information และเตรียมขอเชื่อมต่อ",
    technical: "ใน RRC_IDLE หรือ RRC_INACTIVE UE ยังวัด Cell รอบข้างและทำ Reselection ตามเกณฑ์ของเครือข่าย",
    signal: "Serving Cell",
  },
  {
    short: "RACH",
    title: "ขอจังหวะส่งกลับ",
    simple: "มือถือเริ่ม Random Access ผ่าน PRACH เพื่อให้สถานีฐานได้ยินและจัดเวลา Uplink ให้ตรงกัน",
    technical: "4-step contention-based RA ใช้ Msg1–Msg4; NR ยังรองรับ 2-step RA และแบบ contention-free ตามเงื่อนไข",
    signal: "PRACH",
  },
  {
    short: "REG",
    title: "พิสูจน์ตัวตนและลงทะเบียน",
    simple: "เครือข่ายตรวจ SIM/USIM สร้างความปลอดภัย และบันทึกว่ามือถืออยู่ใน Registration Area ใด",
    technical: "NAS Registration อยู่เหนือชั้นวิทยุ โดย 5GC ใช้ AMF ดูแล Access และ Mobility และ AUSF/UDM สนับสนุนการยืนยันตัวตน",
    signal: "NAS / 5GC",
  },
  {
    short: "DATA",
    title: "พร้อมใช้บริการ",
    simple: "หลังลงทะเบียนและตั้ง Data Session แล้วจึงรับส่งข้อมูลแอปพลิเคชันผ่านเครือข่ายได้",
    technical: "การมีไอคอน 5G, การ Registered และการมี PDU Session เป็นคนละสถานะ จึงไม่ควรใช้สิ่งใดสิ่งหนึ่งสรุปทั้งหมด",
    signal: "PDU Session",
  },
];

const candidateInfo: Record<CandidateKey, { name: string; pci: number; priority: number; sinr: number; barred: boolean }> = {
  A: { name: "Cell A · ใกล้ที่สุด", pci: 21, priority: 5, sinr: 5, barred: false },
  B: { name: "Cell B · คุณภาพดี", pci: 142, priority: 7, sinr: 19, barred: false },
  C: { name: "Cell C · แรงแต่ห้ามเข้า", pci: 388, priority: 9, sinr: 11, barred: true },
};

const quiz = [
  {
    question: "สัญญาณชุดใดช่วยให้ UE ซิงก์และระบุ PCI ของ NR Cell?",
    choices: ["PSS และ SSS", "PDSCH และ PUSCH", "PUCCH และ PRACH"],
    answer: 0,
    explain: "PSS และ SSS อยู่ใน SSB ช่วยการซิงก์และใช้คำนวณ PCI ก่อนอ่าน PBCH/MIB ต่อ",
  },
  {
    question: "การ Camp on a Cell หมายถึงอะไร?",
    choices: ["เลือก Cell ที่เหมาะสมและเฝ้าฟังช่องควบคุม", "กำลัง Download เต็มความเร็ว", "ปิด RF ชั่วคราว"],
    answer: 0,
    explain: "UE ที่ Camp จะรับ System Information, Paging และสามารถเริ่มเข้าสู่ Connected Mode ได้",
  },
  {
    question: "เหตุใด Cell ที่ RSRP แรงที่สุดอาจไม่ถูกเลือก?",
    choices: ["อาจถูก Barred, PLMN ไม่ตรง หรือไม่ผ่านเกณฑ์", "RSRP ไม่มีผลใด ๆ", "มือถือเลือก PCI ต่ำสุดเสมอ"],
    answer: 0,
    explain: "ความแรงเป็นเพียงปัจจัยหนึ่ง ต้องดูความเหมาะสม สิทธิ์เข้าใช้ PLMN และพารามิเตอร์ที่เครือข่ายประกาศด้วย",
  },
  {
    question: "Msg1 ของ 4-step Random Access ส่งผ่านอะไร?",
    choices: ["PRACH Preamble", "PDSCH Data", "Paging"],
    answer: 0,
    explain: "Msg1 คือ Random Access Preamble บน PRACH จากนั้น UE รอ Random Access Response",
  },
  {
    question: "Timing Advance มีหน้าที่หลักอะไร?",
    choices: ["ชดเชยเวลา Uplink ให้สัญญาณถึงสถานีฐานตรงจังหวะ", "เพิ่มความจุแบตเตอรี่", "เลือกหมายเลข PCI"],
    answer: 0,
    explain: "ระยะทางแต่ละ UE ไม่เท่ากัน จึงต้องปรับเวลาส่ง Uplink ให้มาถึงกรอบเวลาที่สถานีฐานคาดไว้",
  },
  {
    question: "ข้อใดอธิบาย Event A3 ได้ใกล้เคียงที่สุด?",
    choices: ["Neighbor ดีกว่า Serving ตาม Offset ที่กำหนด", "Serving แรงกว่าค่าศูนย์", "UE พบ PSS ครั้งแรก"],
    answer: 0,
    explain: "A3 ใช้เงื่อนไขว่า Neighbor ดีกว่า SpCell ตาม Offset พร้อม Hysteresis และ Time-to-Trigger ที่กำหนด",
  },
  {
    question: "Hysteresis และ Time-to-Trigger ช่วยลดปัญหาใด?",
    choices: ["การสลับ Cell ไปมาเร็วเกินไป", "การอ่าน SIM", "การคำนวณ QAM"],
    answer: 0,
    explain: "สองค่านี้ช่วยกรองความผันผวนชั่วคราว ลด Ping-pong Handover แต่ถ้าตั้งมากเกินไปอาจย้ายช้า",
  },
  {
    question: "Mobility ใน RRC_IDLE โดยทั่วไปใช้กลไกใด?",
    choices: ["Cell Reselection ที่ UE ตัดสินตามพารามิเตอร์", "Connected-mode Handover ทุกครั้ง", "Beamforming เท่านั้น"],
    answer: 0,
    explain: "ใน Idle/Inactive UE ทำ Cell Reselection ส่วน Connected Mode เครือข่ายควบคุม Handover จาก Measurement Report",
  },
  {
    question: "NSA หรือ EN-DC ใช้อะไรเป็น Master Node โดยทั่วไป?",
    choices: ["LTE eNB", "5G Core เท่านั้น", "โทรศัพท์เครื่องอื่น"],
    answer: 0,
    explain: "ใน Option 3 / EN-DC ฝั่ง LTE eNB เป็น Master Node และ NR en-gNB เป็น Secondary Node",
  },
  {
    question: "หากต้องการพิสูจน์ Call Drop ขณะเปลี่ยน Cell ควรใช้อะไรร่วมกัน?",
    choices: ["Scanner ดู RF และ Test Phone ดู Signalling/บริการ", "RSRP จุดเดียว", "ไอคอน 5G อย่างเดียว"],
    answer: 0,
    explain: "Scanner ช่วยเห็น Cell/Beam รอบข้าง ส่วน Test Phone ยืนยัน Measurement Report, Handover และผลบริการจริง",
  },
];

const issues = [
  {
    symptom: "มีขีดสัญญาณ แต่ขึ้น No Service",
    layer: "Selection / Registration",
    check: "PLMN, Cell Barred, TAC, SIM, Registration Reject และสิทธิ์ Roaming",
    clue: "รับ RF ได้ ไม่ได้แปลว่าลงทะเบียนสำเร็จ",
  },
  {
    symptom: "สัญลักษณ์ 5G ขึ้นแล้วหาย",
    layer: "NSA / NR Availability",
    check: "LTE Anchor, NR Coverage, SSB/Beam, B1/B2 Event และ Network Policy",
    clue: "ไอคอนเป็นเพียงสถานะหนึ่ง ไม่ใช่หลักฐานว่า User Data วิ่งบน NR ตลอดเวลา",
  },
  {
    symptom: "สายหรือข้อมูลหลุดขณะเคลื่อนที่",
    layer: "Connected Mobility",
    check: "Neighbor Relation, A3/A5, TTT, Coverage Gap, RLF และ Handover Result",
    clue: "เทียบจุด Measurement Report กับจุดที่บริการสะดุด",
  },
  {
    symptom: "เปลี่ยน Cell ไปมาบ่อย",
    layer: "Mobility Robustness",
    check: "Hysteresis, Time-to-Trigger, Overshooting, PCI Confusion และสัญญาณสะท้อน",
    clue: "Ping-pong คืออาการ ไม่ใช่คำตอบของต้นเหตุ",
  },
  {
    symptom: "RSRP ดี แต่เริ่มเชื่อมต่อช้า",
    layer: "Random Access / Load",
    check: "PRACH Success, Preamble Collision, RAR, UL Coverage, Access Barring และ Load",
    clue: "Downlink แรงไม่ได้รับประกันว่า Uplink Random Access จะสำเร็จเร็ว",
  },
];

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotionPreference() {
  return false;
}

export default function MobilityLessonClient() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionPreference,
    getServerReducedMotionPreference,
  );
  const [motionPaused, setMotionPaused] = useState(false);
  const [accessStep, setAccessStep] = useState(0);
  const [candidateRsrp, setCandidateRsrp] = useState<Record<CandidateKey, number>>({
    A: -74,
    B: -86,
    C: -69,
  });
  const [position, setPosition] = useState(28);
  const [drivePlaying, setDrivePlaying] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const animationsStopped = motionPaused || prefersReducedMotion;

  useEffect(() => {
    if (!drivePlaying || animationsStopped) return;
    const timer = window.setInterval(() => {
      setPosition((current) => {
        if (current >= 100) {
          setDrivePlaying(false);
          return 100;
        }
        return Math.min(100, current + 1);
      });
    }, 90);
    return () => window.clearInterval(timer);
  }, [drivePlaying, animationsStopped]);

  const selectedCell = useMemo(() => {
    const eligible = (Object.keys(candidateInfo) as CandidateKey[])
      .filter((key) => !candidateInfo[key].barred && candidateRsrp[key] >= -110)
      .sort((left, right) => {
        const priorityDifference = candidateInfo[right].priority - candidateInfo[left].priority;
        return priorityDifference || candidateRsrp[right] - candidateRsrp[left];
      });
    return eligible[0] ?? null;
  }, [candidateRsrp]);

  const servingRsrp = Math.round(-67 - position * 0.58);
  const neighborRsrp = Math.round(-126 + position * 0.62);
  const a3Offset = 3;
  const a3Satisfied = neighborRsrp > servingRsrp + a3Offset;
  const mobilityState =
    position < 48
      ? "อยู่กับ Cell A"
      : !a3Satisfied
        ? "กำลังวัด Neighbor"
        : position < 63
          ? "A3 เข้าเงื่อนไข · รอ TTT"
          : "Handover ไป Cell B";

  const answeredAll = answers.every((answer) => answer !== null);
  const score = answers.reduce<number>(
    (total, answer, index) => total + (answer === quiz[index].answer ? 1 : 0),
    0,
  );

  function restartDrive() {
    setPosition(0);
    if (!animationsStopped) setDrivePlaying(true);
  }

  return (
    <main className={`mv-page${animationsStopped ? " mv-motion-paused" : ""}`}>
      <header className="mv-header">
        <Link className="mv-brand" href="/">
          <span aria-hidden="true">RF</span>
          <span>
            <strong>Mobile Network Classroom</strong>
            <small>บทที่ 05 · Connection & Mobility</small>
          </span>
        </Link>
        <div className="mv-header-actions">
          <nav aria-label="เมนูบทเรียน">
            <a href="#access">เริ่มเชื่อมต่อ</a>
            <a href="#selection">เลือก Cell</a>
            <a href="#handover">Handover</a>
            <a href="#field">ภาคสนาม</a>
            <Link href="/field-guide">คู่มือภาคสนาม</Link>
            <a href="#quiz">แบบทดสอบ</a>
          </nav>
          <button
            className="mv-motion-toggle"
            type="button"
            onClick={() => setMotionPaused((current) => !current)}
            disabled={prefersReducedMotion}
            aria-pressed={animationsStopped}
          >
            <span aria-hidden="true">{animationsStopped ? "▶" : "Ⅱ"}</span>
            {animationsStopped ? "เล่นภาพ" : "หยุดภาพ"}
          </button>
        </div>
      </header>

      <section className="mv-hero" id="top">
        <div className="mv-hero-copy">
          <p className="mv-kicker">Connection, Registration & Mobility</p>
          <h1>จากเปิดเครื่อง<br />จนถึง Handover</h1>
          <p>
            สัญญาณที่มาถึงโทรศัพท์เป็นเพียงจุดเริ่มต้น บทนี้จะตามรอย UE ตั้งแต่ค้นหา SSB,
            เลือก Cell, ขอสิทธิ์ส่งผ่าน PRACH, ลงทะเบียนกับเครือข่าย
            จนถึงเปลี่ยน Cell อย่างต่อเนื่องระหว่างเดินทาง
          </p>
          <div className="mv-hero-actions">
            <a className="mv-primary" href="#access">เริ่มตามเส้นทาง UE ↓</a>
            <span>ประมาณ 35 นาที · พื้นฐาน + โหมดช่างเทคนิค</span>
          </div>
          <dl className="mv-hero-facts">
            <div><dt>8</dt><dd>ขั้นตอนเชื่อมต่อ</dd></div>
            <div><dt>3</dt><dd>ห้องทดลอง</dd></div>
            <div><dt>10</dt><dd>คำถามทบทวน</dd></div>
          </dl>
        </div>

        <div className="mv-hero-visual" aria-label="ภาพเคลื่อนไหวโทรศัพท์เชื่อมต่อระหว่าง Cell A และ Cell B">
          <div className="mv-hero-tower tower-a"><i /><i /><b>A</b><small>PCI 21</small></div>
          <div className="mv-hero-tower tower-b"><i /><i /><b>B</b><small>PCI 142</small></div>
          <div className="mv-hero-beam beam-a" />
          <div className="mv-hero-beam beam-b" />
          <div className="mv-hero-phone"><span /><b>UE</b></div>
          <div className="mv-hero-road"><i /><i /><i /><i /><i /></div>
          <div className="mv-hero-label label-search">SEARCH</div>
          <div className="mv-hero-label label-measure">MEASURE</div>
          <div className="mv-hero-label label-move">MOVE</div>
          <p>ค้นหา → เลือก → เชื่อมต่อ → วัด → เปลี่ยน Cell</p>
        </div>
      </section>

      <BeginnerBridge
        lesson="mobility"
        tldr={[
          "เปิดเครื่องแล้วมือถือยังใช้งานไม่ได้ทันที ต้องค้นหา Cell อ่านข้อมูลระบบ ขอช่องทางวิทยุ และลงทะเบียนให้เครือข่ายรู้จักก่อน",
          "ตอนว่างเครื่องเลือก Cell เองตามเกณฑ์และลำดับความสำคัญ แต่ตอนกำลังเชื่อมต่อ เครือข่ายใช้ Measurement Report ช่วยตัดสิน Handover",
          "Hysteresis และ Time-to-Trigger ช่วยกันไม่ให้มือถือสลับ Cell ไปมาเพราะค่าสัญญาณแกว่งเพียงชั่วคราว",
        ]}
        analogy={{
          title: "Handover เหมือนการวิ่งผลัด",
          body: "Cell เดิมถือไม้ต่ออยู่ ขณะ UE รายงานว่า Cell ข้างหน้าดีกว่า เครือข่ายต้องเตรียมปลายทางและส่งไม้ในจังหวะที่เหมาะ เร็วเกินไปอาจย้ายโดยไม่จำเป็น ช้าเกินไปอาจหลุดก่อนถึง Cell ใหม่",
        }}
        scenario={{
          title: "ทำไมโทรผ่านรถแล้วเสียงสะดุดตรงจุดเดิม?",
          body: "บริเวณรอยต่อ Cell อาจมี Coverage ซ้อน, Interference, Neighbor Relation หรือค่า Handover ไม่เหมาะ การเห็น RSRP ของ Cell ใหม่แรงกว่าอย่างเดียวจึงยังไม่พอ ต้องดู Event, TTT, Failure Cause และคุณภาพ Uplink ร่วมกัน",
        }}
        technicalNotes={[
          {
            title: "S-criteria ก่อนถือว่า Cell เหมาะสม",
            body: "ใน NR Cell Selection ต้องผ่าน Srxlev > 0 และ Squal > 0 โดย Srxlev เปรียบเทียบค่าที่วัดกับ Qrxlevmin พร้อม Offset และ Power Compensation ส่วน Squal เปรียบเทียบคุณภาพกับ Qqualmin จึงไม่ใช่การเลือก RSRP ที่แรงที่สุดอย่างเดียว",
          },
          {
            title: "Beam Switch ไม่เท่ากับ Cell Switch",
            body: "การเปลี่ยน SSB Beam ภายใน Cell เดิมอาจยังใช้ PCI และ Cell Context เดิม ส่วน Cell Reselection/Handover คือการเปลี่ยน Serving Cell และมักเห็น PCI หรือ Cell Identity เปลี่ยน ต้องแยกสองระดับนี้เวลาอ่าน Log",
          },
        ]}
        terms={[
          { term: "Cell Selection", engineering: "การเลือก Suitable Cell เพื่อ Camp", plain: "เลือกจุดบริการแรกที่ผ่านเงื่อนไข" },
          { term: "Event A3", engineering: "Neighbor ดีกว่า Serving มากกว่า Offset ตามเงื่อนไข", plain: "สัญญาณจากตัวเลือกใหม่ดีพอให้เริ่มพิจารณาย้าย" },
          { term: "Hysteresis", engineering: "ระยะเผื่อเพื่อลดการแกว่งของเงื่อนไข", plain: "กันชนไม่ให้สลับไปมาง่ายเกินไป" },
          { term: "Time-to-Trigger", engineering: "เวลาที่เงื่อนไขต้องคงอยู่ก่อน Report", plain: "ต้องดีต่อเนื่องนานพอ ไม่ใช่ดีแวบเดียว" },
        ]}
      />

      <section className="mv-outcomes">
        <div>
          <p className="mv-section-index">เป้าหมายของบท</p>
          <h2>เชื่อมทุกศัพท์<br />ให้กลายเป็นหนึ่งเหตุการณ์</h2>
        </div>
        <ol>
          <li><span>01</span><p>เล่าได้ว่ามือถือพบและเลือกเครือข่ายอย่างไร</p></li>
          <li><span>02</span><p>แยก Cell Selection, Reselection และ Handover ได้</p></li>
          <li><span>03</span><p>ตาม 4-step Random Access และ Registration ได้ถูกลำดับ</p></li>
          <li><span>04</span><p>ใช้ Measurement และ Signalling หาเหตุ Mobility Failure ได้</p></li>
        </ol>
      </section>

      <section className="mv-section mv-access" id="access">
        <div className="mv-section-heading">
          <p className="mv-section-index">01 · Initial Access Story</p>
          <h2>เมื่อกดเปิดเครื่อง<br />UE ทำอะไรบ้าง?</h2>
          <p>กดแต่ละขั้นเพื่อดูว่าความรู้จากบทก่อนหน้าถูกนำมาใช้ตรงไหน</p>
        </div>

        <div className="mv-access-lab">
          <div className="mv-access-stage" aria-live="polite">
            <div className="mv-access-sky" aria-hidden="true">
              <div className="mv-access-tower"><i /><i /><i /><b>gNB</b></div>
              <div className={`mv-access-signal signal-${accessStep}`}><span>{accessSteps[accessStep].signal}</span></div>
              <div className="mv-access-device"><span /><b>UE</b></div>
            </div>
            <div className="mv-access-copy">
              <span>{String(accessStep + 1).padStart(2, "0")} / {accessSteps.length}</span>
              <p>{accessSteps[accessStep].short}</p>
              <h3>{accessSteps[accessStep].title}</h3>
              <p>{accessSteps[accessStep].simple}</p>
              <details>
                <summary>สำหรับช่างเทคนิค <b aria-hidden="true">+</b></summary>
                <p>{accessSteps[accessStep].technical}</p>
              </details>
            </div>
          </div>

          <ol className="mv-access-steps">
            {accessSteps.map((step, index) => (
              <li key={step.short}>
                <button
                  className={accessStep === index ? "active" : ""}
                  type="button"
                  onClick={() => setAccessStep(index)}
                  aria-current={accessStep === index ? "step" : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><small>{step.short}</small><b>{step.title}</b></div>
                  <i aria-hidden="true">→</i>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="mv-distinction">
          <div><span>เห็นสัญญาณ</span><p>ถอด PSS/SSS หรือ SSB ได้</p></div>
          <i aria-hidden="true">≠</i>
          <div><span>Camp สำเร็จ</span><p>เลือก Suitable Cell และเฝ้าฟังได้</p></div>
          <i aria-hidden="true">≠</i>
          <div><span>Registered</span><p>เครือข่ายยืนยันตัวตนและยอมรับ UE</p></div>
          <i aria-hidden="true">≠</i>
          <div><span>ใช้ Data ได้</span><p>มี Session และเส้นทาง User Plane พร้อม</p></div>
        </div>
      </section>

      <section className="mv-section mv-selection" id="selection">
        <div className="mv-section-heading">
          <p className="mv-section-index">02 · Cell Selection / Reselection Lab</p>
          <h2>แรงที่สุด<br />ไม่เท่ากับเหมาะที่สุด</h2>
          <p>
            ระหว่าง Selection UE ต้องตรวจ PLMN, Cell Barred และเกณฑ์ความเหมาะสม
            ส่วน Reselection ยังพิจารณา Priority, Threshold และ Ranking ที่เครือข่ายกำหนด
          </p>
        </div>

        <div className="mv-selection-grid">
          {(Object.keys(candidateInfo) as CandidateKey[]).map((key) => {
            const info = candidateInfo[key];
            const selected = selectedCell === key;
            return (
              <article className={`${selected ? "selected" : ""}${info.barred ? " barred" : ""}`} key={key}>
                <div className="mv-cell-topline">
                  <span>CELL {key}</span>
                  <span>{info.barred ? "BARRED" : selected ? "SELECTED" : "CANDIDATE"}</span>
                </div>
                <div className="mv-mini-tower" aria-hidden="true"><i /><i /><b>{key}</b></div>
                <h3>{info.name}</h3>
                <dl>
                  <div><dt>PCI</dt><dd>{info.pci}</dd></div>
                  <div><dt>Priority</dt><dd>{info.priority}</dd></div>
                  <div><dt>SINR</dt><dd>{info.sinr} dB</dd></div>
                </dl>
                <label htmlFor={`rsrp-${key}`}>
                  <span>ทดลองปรับ RSRP</span>
                  <output>{candidateRsrp[key]} dBm</output>
                </label>
                <input
                  id={`rsrp-${key}`}
                  type="range"
                  min="-120"
                  max="-65"
                  value={candidateRsrp[key]}
                  onChange={(event) => setCandidateRsrp((current) => ({
                    ...current,
                    [key]: Number(event.target.value),
                  }))}
                />
                <p>
                  {info.barred
                    ? "แม้สัญญาณแรง UE ก็ไม่เลือก เพราะ Cell ประกาศห้ามเข้า"
                    : candidateRsrp[key] < -110
                      ? "ตัวอย่างนี้ถือว่าไม่ผ่านเกณฑ์ระดับสัญญาณ"
                      : selected
                        ? "ผ่านเกณฑ์และมี Priority สูงที่สุดในกลุ่มที่เข้าได้"
                        : "เข้าได้ แต่มี Candidate ที่ Priority สูงกว่า"}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mv-model-note">
          <span>แบบจำลองเพื่อการสอน</span>
          <p>
            ห้องทดลองนี้จำลองการคัด Candidate ระหว่าง Idle Reselection เพื่อให้เห็นผลของ Barred,
            Threshold และ Frequency Priority ชัดเจน การทำงานจริงใช้เกณฑ์ Srxlev/Squal,
            พารามิเตอร์ Broadcast, Ranking/Reselection และเงื่อนไขตาม 3GPP TS 38.304
            ไม่ใช่สูตรคะแนนรวมแบบเดียว
          </p>
        </div>

        <div className="mv-mode-compare">
          <article>
            <span>RRC_IDLE / RRC_INACTIVE</span>
            <h3>Cell Reselection</h3>
            <p>UE วัดและตัดสินใจย้าย Cell ตาม Priority, Threshold, Ranking และ Timer ที่เครือข่ายประกาศ</p>
            <b>UE-led mobility</b>
          </article>
          <div aria-hidden="true">VS</div>
          <article>
            <span>RRC_CONNECTED</span>
            <h3>Handover</h3>
            <p>เครือข่ายกำหนด Measurement และสั่งเปลี่ยน Cell โดยใช้รายงานจาก UE และบริบทของระบบ</p>
            <b>Network-controlled mobility</b>
          </article>
        </div>
      </section>

      <section className="mv-section mv-random-access" id="random-access">
        <div className="mv-section-heading">
          <p className="mv-section-index">03 · Random Access & Registration</p>
          <h2>ได้ยินเสาแล้ว<br />ต้องทำให้เสาได้ยินเราด้วย</h2>
          <p>4-step Random Access ช่วยตั้งจังหวะ Uplink และแก้กรณี UE หลายเครื่องขอใช้ทรัพยากรพร้อมกัน</p>
        </div>

        <div className="mv-ra-flow">
          <article>
            <span>MSG1 · UE → gNB</span>
            <i aria-hidden="true">01</i>
            <h3>PRACH Preamble</h3>
            <p>UE เลือก Preamble และส่งใน RACH Occasion เพื่อประกาศว่า “ขอเข้าใช้”</p>
          </article>
          <article>
            <span>MSG2 · gNB → UE</span>
            <i aria-hidden="true">02</i>
            <h3>Random Access Response</h3>
            <p>เครือข่ายตอบ Temporary ID, Timing Advance และ UL Grant ให้ส่งข้อความต่อ</p>
          </article>
          <article>
            <span>MSG3 · UE → gNB</span>
            <i aria-hidden="true">03</i>
            <h3>Scheduled Transmission</h3>
            <p>UE ส่งคำขอ RRC/Identity บนทรัพยากร Uplink ที่ได้รับจัดสรร</p>
          </article>
          <article>
            <span>MSG4 · gNB → UE</span>
            <i aria-hidden="true">04</i>
            <h3>Contention Resolution</h3>
            <p>ยืนยันว่า UE ใดชนะเมื่อหลายเครื่องเลือก Preamble เดียวกัน</p>
          </article>
        </div>

        <div className="mv-ra-notes">
          <article>
            <span aria-hidden="true">↔</span>
            <div><h3>Timing Advance</h3><p>UE ที่อยู่ไกลต้องส่งเร็วขึ้น เพื่อให้ Uplink ของหลายเครื่องมาถึง gNB ในจังหวะที่จัดไว้</p></div>
          </article>
          <article>
            <span aria-hidden="true">2</span>
            <div><h3>NR ยังมี 2-step RA</h3><p>รวมบางข้อความเป็น MsgA/MsgB เพื่อลดขั้นตอน โดยการเลือกใช้ขึ้นกับความสามารถและ Configuration</p></div>
          </article>
          <article>
            <span aria-hidden="true">!</span>
            <div><h3>RSRP ดีแต่ RACH ล้มได้</h3><p>เพราะ Uplink Coverage, Collision, Load หรือ Access Control ไม่ได้สะท้อนจาก Downlink RSRP เพียงค่าเดียว</p></div>
          </article>
        </div>

        <div className="mv-registration">
          <div>
            <p className="mv-section-index">Registration Journey</p>
            <h3>จาก Radio Access ไปถึง 5G Core</h3>
            <p>
              RRC ทำให้มีช่องทาง Signalling ทางวิทยุ ส่วน NAS ใช้ลงทะเบียนและจัดการ Mobility
              กับ Core Network การยืนยันตัวตนไม่ใช่หน้าที่ของ PSS/SSS หรือ PRACH
            </p>
          </div>
          <ol>
            <li><span>01</span><div><b>RRC Setup</b><small>สร้าง Signalling Radio Bearer</small></div></li>
            <li><span>02</span><div><b>Registration Request</b><small>UE ขอเข้าระบบ 5GS ผ่าน AMF</small></div></li>
            <li><span>03</span><div><b>Authentication</b><small>USIM และเครือข่ายพิสูจน์ตัวตน</small></div></li>
            <li><span>04</span><div><b>Security Mode</b><small>เปิดการป้องกัน Signalling</small></div></li>
            <li><span>05</span><div><b>Registration Accept</b><small>ได้รับ Mobility/Registration Context</small></div></li>
            <li><span>06</span><div><b>PDU Session</b><small>สร้างเส้นทางข้อมูลไปยัง Data Network</small></div></li>
          </ol>
        </div>
      </section>

      <section className="mv-section mv-handover" id="handover">
        <div className="mv-section-heading">
          <p className="mv-section-index">04 · Handover Lab</p>
          <h2>รถกำลังวิ่ง<br />ใครตัดสินใจเปลี่ยน Cell?</h2>
          <p>
            ใน Connected Mode เครือข่ายกำหนดสิ่งที่ UE ต้องวัด UE ส่ง Measurement Report
            และเครือข่ายตัดสินใจว่าจะ Handover หรือไม่
          </p>
        </div>

        <div className="mv-drive-lab">
          <div className="mv-drive-scene">
            <div className="mv-drive-tower drive-a"><i /><b>A</b><small>Serving</small></div>
            <div className="mv-drive-tower drive-b"><i /><b>B</b><small>Neighbor</small></div>
            <div className="mv-drive-coverage coverage-a" />
            <div className="mv-drive-coverage coverage-b" />
            <div className="mv-road" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="mv-car" style={{ "--car-position": `${position}%` } as CSSProperties}>
              <span /><b>UE</b>
            </div>
            <div className="mv-event-marker"><span>A3 zone</span></div>
          </div>

          <div className="mv-drive-control">
            <div className="mv-drive-status">
              <span>สถานะปัจจุบัน</span>
              <strong>{mobilityState}</strong>
            </div>
            <label htmlFor="drive-position">
              <span>ตำแหน่งรถ</span>
              <output>{position}%</output>
            </label>
            <input
              id="drive-position"
              type="range"
              min="0"
              max="100"
              value={position}
              onChange={(event) => {
                setDrivePlaying(false);
                setPosition(Number(event.target.value));
              }}
            />
            <div className="mv-drive-buttons">
              <button
                className="mv-primary"
                type="button"
                onClick={() => setDrivePlaying((current) => !current)}
                disabled={animationsStopped || position >= 100}
              >
                {drivePlaying ? "หยุดรถ" : "เล่นการเคลื่อนที่"}
              </button>
              <button type="button" onClick={restartDrive}>เริ่มใหม่</button>
            </div>
          </div>

          <div className="mv-signal-chart" aria-label="ค่าความแรง Serving และ Neighbor ตามตำแหน่งรถ">
            <div>
              <span>Cell A · Serving</span>
              <strong>{servingRsrp} dBm</strong>
              <i><b style={{ width: `${Math.max(0, Math.min(100, (servingRsrp + 130) * 1.55))}%` }} /></i>
            </div>
            <div>
              <span>Cell B · Neighbor</span>
              <strong>{neighborRsrp} dBm</strong>
              <i><b style={{ width: `${Math.max(0, Math.min(100, (neighborRsrp + 130) * 1.55))}%` }} /></i>
            </div>
            <div className={a3Satisfied ? "event-on" : ""}>
              <span>เงื่อนไขสาธิต Event A3</span>
              <strong>{a3Satisfied ? "ผ่าน" : "ยังไม่ผ่าน"}</strong>
              <small>Neighbor &gt; Serving + {a3Offset} dB</small>
            </div>
          </div>
        </div>

        <div className="mv-a3-explain">
          <article><span>01</span><h3>Measurement Configuration</h3><p>เครือข่ายบอก UE วัด Reference Signal ใด ความถี่ใด และรายงานเมื่อใด</p></article>
          <article><span>02</span><h3>Event A3</h3><p>Neighbor ดีกว่า Serving ตาม Offset ที่กำหนด จึงเข้าสู่เงื่อนไขรายงาน</p></article>
          <article><span>03</span><h3>Hysteresis + TTT</h3><p>ต้องดีกว่าอย่างมีระยะและนานพอ เพื่อลดการสลับไปมาจาก Fading ชั่วคราว</p></article>
          <article><span>04</span><h3>Handover Command</h3><p>เครือข่ายเลือก Target และสั่ง UE ย้าย จากนั้น UE เข้าถึง Cell ใหม่และยืนยันผล</p></article>
        </div>

        <div className="mv-tradeoff">
          <div><span>ตั้งไวเกินไป</span><h3>Ping-pong</h3><p>สลับกลับไปมาจากความผันผวนระยะสั้น เพิ่ม Signalling และกระทบบริการ</p></div>
          <div className="balanced"><span>สมดุล</span><h3>Move at the right moment</h3><p>ย้ายก่อน Serving เสื่อมจนรับคำสั่งไม่ได้ แต่ไม่รีบตามทุกยอดสัญญาณ</p></div>
          <div><span>ตั้งช้าเกินไป</span><h3>Late Handover</h3><p>Serving อ่อนจน Radio Link Failure ก่อนย้าย Target สำเร็จ</p></div>
        </div>
      </section>

      <section className="mv-section mv-architecture">
        <div className="mv-section-heading">
          <p className="mv-section-index">05 · NSA / SA Reality</p>
          <h2>คำว่า “5G” บนหน้าจอ<br />ยังไม่เล่าเส้นทางทั้งหมด</h2>
        </div>
        <div className="mv-arch-grid">
          <article>
            <div className="mv-arch-badge">NSA</div>
            <span>EN-DC · Option 3</span>
            <h3>LTE ช่วยตั้งหลัก<br />NR เพิ่มความจุ</h3>
            <div className="mv-arch-path">
              <b>UE</b><i>↔</i><b>LTE eNB<br /><small>Master</small></b><i>+</i><b>NR en-gNB<br /><small>Secondary</small></b><i>↔</i><b>EPC</b>
            </div>
            <p>การเพิ่ม/ลด NR Secondary Node และ LTE Anchor Coverage มีผลต่อประสบการณ์ 5G โดยตรง</p>
          </article>
          <article>
            <div className="mv-arch-badge">SA</div>
            <span>NR + 5G Core</span>
            <h3>NR เชื่อมกับ<br />5GC โดยตรง</h3>
            <div className="mv-arch-path">
              <b>UE</b><i>↔</i><b>NR gNB</b><i>↔</i><b>AMF<br /><small>Control</small></b><i>+</i><b>UPF<br /><small>Data</small></b>
            </div>
            <p>Registration, Mobility และ PDU Session ทำงานกับ 5GC โดยไม่ต้องมี LTE เป็น Anchor</p>
          </article>
        </div>
        <div className="mv-myth">
          <span>จำให้แม่น</span>
          <p>ไอคอน 5G ≠ NR User Data ตลอดเวลา ≠ 5G SA เสมอ ต้องดู RAT, Anchor/Secondary Cell, Core และ Data Bearer ประกอบกัน</p>
        </div>
      </section>

      <section className="mv-section mv-field" id="field">
        <div className="mv-section-heading">
          <p className="mv-section-index">06 · Field Troubleshooting</p>
          <h2>เริ่มจากอาการ<br />แล้วไล่กลับไปหาชั้นที่ผิด</h2>
          <p>อย่าหยุดที่คำว่า “สัญญาณไม่ดี” ให้แยกว่าเกิดก่อนเลือก Cell, ตอนลงทะเบียน, ตอน Random Access หรือระหว่าง Handover</p>
        </div>

        <div className="mv-issue-table">
          <div className="mv-issue-head"><span>อาการ</span><span>ชั้นที่สงสัย</span><span>สิ่งที่ควรตรวจ</span><span>ข้อสังเกต</span></div>
          {issues.map((issue) => (
            <article key={issue.symptom}>
              <h3>{issue.symptom}</h3>
              <b>{issue.layer}</b>
              <p>{issue.check}</p>
              <small>{issue.clue}</small>
            </article>
          ))}
        </div>

        <div className="mv-tool-pair">
          <article>
            <span>PASSIVE VIEW</span>
            <h3>Scanner</h3>
            <p>เห็น Cell, PCI, Beam และ RF จากหลายเครือข่าย ช่วยตอบว่า “ในอากาศมีอะไรและ Coverage ต่อเนื่องหรือไม่”</p>
            <ul><li>Neighbor/PCI/SSB รอบตัว</li><li>Coverage overlap และ gap</li><li>เทียบหลาย Operator โดยไม่ Attach</li></ul>
          </article>
          <div aria-hidden="true">+</div>
          <article>
            <span>ACTIVE VIEW</span>
            <h3>Test Phone</h3>
            <p>เห็นการเลือก Cell, Registration, Measurement Report, Handover และบริการจริงตาม SIM/Modem</p>
            <ul><li>RRC/NAS Signalling</li><li>Serving/Secondary Cell</li><li>Call, Data และ Failure Cause</li></ul>
          </article>
          <div className="mv-tool-result">
            <span>คำตอบที่น่าเชื่อถือ</span>
            <p>ซ้อนเวลาและตำแหน่งของทั้งสองเครื่องมือ เพื่อแยก RF Problem ออกจาก Network, Device, SIM และ Service</p>
          </div>
        </div>
      </section>

      <section className="mv-section mv-glossary">
        <div className="mv-section-heading">
          <p className="mv-section-index">คำศัพท์สำคัญ</p>
          <h2>เปิดทบทวน<br />ก่อนลงพื้นที่</h2>
        </div>
        <div>
          {[
            ["Suitable Cell", "Cell ที่ผ่านเกณฑ์การเลือก เป็น PLMN ที่อนุญาต และไม่ติดข้อจำกัดที่ทำให้เข้าใช้ไม่ได้"],
            ["Camp on a Cell", "สถานะที่ UE เลือก Cell แล้วเฝ้าฟัง System Information/Paging และพร้อมเริ่มเชื่อมต่อ"],
            ["RRC_IDLE", "ไม่มี RRC Connection; Core รู้ตำแหน่งระดับ Registration Area และ UE ทำ Cell Reselection"],
            ["RRC_INACTIVE", "พัก RRC Connection Context ไว้เพื่อกลับมาเชื่อมเร็วขึ้น พร้อม Mobility แบบ Reselection/RNA Update"],
            ["RRC_CONNECTED", "มี RRC Connection; เครือข่ายควบคุม Measurement และ Connected-mode Mobility"],
            ["Event A3", "เหตุการณ์รายงานเมื่อ Neighbor ดีกว่า Serving/SpCell ตาม Offset และเงื่อนไขที่กำหนด"],
            ["Time-to-Trigger", "เวลาที่เงื่อนไข Measurement ต้องคงอยู่ก่อน Trigger Report เพื่อลดผลจากความผันผวนสั้น ๆ"],
            ["Radio Link Failure", "สถานการณ์ที่ลิงก์วิทยุไม่สามารถรักษาการเชื่อมต่อได้และต้องเข้าสู่กระบวนการกู้คืน/เชื่อมใหม่"],
          ].map(([term, meaning]) => (
            <details key={term}>
              <summary>{term}<span aria-hidden="true">+</span></summary>
              <p>{meaning}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mv-section mv-quiz" id="quiz">
        <div className="mv-section-heading">
          <p className="mv-section-index">แบบทดสอบท้ายบท</p>
          <h2>ตามเส้นทาง UE<br />ได้ครบหรือยัง?</h2>
          <p>เลือกคำตอบให้ครบทั้ง 10 ข้อ แล้วตรวจผลพร้อมคำอธิบาย</p>
        </div>

        {submitted && (
          <QuizSummary
            score={score}
            total={quiz.length}
            onRetry={() => {
              setAnswers(Array(quiz.length).fill(null));
              setSubmitted(false);
            }}
            nextHref="/core-security"
            nextLabel="ไปบทที่ 06"
          />
        )}

        <div className="mv-quiz-list">
          {quiz.map((item, questionIndex) => {
            const isCorrect = answers[questionIndex] === item.answer;
            return (
              <fieldset
                className={`mv-question${submitted ? (isCorrect ? " correct" : " incorrect") : ""}`}
                key={item.question}
              >
                <legend><span>{String(questionIndex + 1).padStart(2, "0")}</span>{item.question}</legend>
                <div className="mv-choices">
                  {item.choices.map((choice, choiceIndex) => (
                    <label key={choice}>
                      <input
                        type="radio"
                        name={`mobility-question-${questionIndex}`}
                        checked={answers[questionIndex] === choiceIndex}
                        onChange={() => {
                          const next = [...answers];
                          next[questionIndex] = choiceIndex;
                          setAnswers(next);
                          setSubmitted(false);
                        }}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
                {submitted && (
                  <div className="mv-feedback" role="status">
                    <strong>{isCorrect ? "ถูกต้อง" : "ทบทวนอีกครั้ง"}</strong>
                    <span>{item.explain}</span>
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>
        <div className="mv-quiz-actions">
          <button className="mv-primary" type="button" disabled={!answeredAll} onClick={() => setSubmitted(true)}>
            ตรวจคำตอบ
          </button>
          {!submitted && <p><strong>— / {quiz.length}</strong><span>ตอบให้ครบก่อนตรวจ</span></p>}
        </div>
      </section>

      <section className="mv-sources">
        <div>
          <p className="mv-section-index">แหล่งอ้างอิงหลัก</p>
          <h2>มาตรฐานที่ใช้<br />ตรวจความถูกต้อง</h2>
          <p>หน้าเรียนใช้ภาษาง่าย แต่แยกหลักการมาตรฐานออกจากแบบจำลองเพื่อการสอนอย่างชัดเจน</p>
        </div>
        <ul>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138300_138399/138300/18.05.00_60/ts_138300v180500p.pdf" target="_blank" rel="noreferrer">3GPP TS 38.300 — NR and NG-RAN Overall Description</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138300_138399/138304/18.06.00_60/ts_138304v180600p.pdf" target="_blank" rel="noreferrer">3GPP TS 38.304 — UE Procedures in Idle/Inactive</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138300_138399/138331/18.05.01_60/ts_138331v180501p.pdf" target="_blank" rel="noreferrer">3GPP TS 38.331 — Radio Resource Control</a></li>
          <li><a href="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3145" target="_blank" rel="noreferrer">3GPP TS 23.502 — Procedures for the 5G System</a></li>
          <li><a href="https://www.3gpp.org/technologies/5g-system-overview" target="_blank" rel="noreferrer">3GPP — 5G System Overview, NSA and SA</a></li>
        </ul>
      </section>

      <footer className="mv-footer">
        <div>
          <p>บทที่ 05 · Connection & Mobility</p>
          <h2>อย่าวัดเพียงจุดเดียว<br />เมื่อปัญหาเกิดระหว่างทาง</h2>
        </div>
        <div className="mv-footer-links" style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <Link href="/">กลับหน้ารวมบทเรียน ↗</Link>
          <Link href="/signal-quality">← ทบทวนบทที่ 04</Link>
          <Link href="/core-security">บทต่อไป: 5G Core & Security →</Link>
          <a href="#top">กลับด้านบน ↑</a>
        </div>
      </footer>
    </main>
  );
}
