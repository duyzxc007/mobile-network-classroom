"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

type FunctionKey = "AMF" | "SMF" | "UPF" | "UDM" | "AUSF" | "NSSF";
type SliceKey = "broadband" | "control" | "sensors";
type SecurityLayerKey = "identity" | "authentication" | "confidentiality" | "integrity";

const coreFunctions: Record<
  FunctionKey,
  { full: string; simple: string; technical: string; plane: "CONTROL" | "USER"; analogy: string }
> = {
  AMF: {
    full: "Access and Mobility Management Function",
    simple: "ประตูควบคุมที่รับ Registration, ดูสถานะการเข้าถึง และติดตาม Mobility ของ UE",
    technical:
      "ยุติ NAS Signalling ฝั่ง Core, เชื่อม N1 กับ UE และ N2 กับ NG-RAN, เลือก/ประสาน SMF และส่งต่อข้อมูลที่เกี่ยวกับ Session โดยไม่เป็นทางผ่านของ User Data",
    plane: "CONTROL",
    analogy: "ฝ่ายต้อนรับและทะเบียน",
  },
  SMF: {
    full: "Session Management Function",
    simple: "ผู้จัดการ PDU Session ที่เลือกเส้นทางข้อมูลและกำหนดวิธีดูแลแต่ละ QoS Flow",
    technical:
      "จัดการ Session, จัดสรร/ประสาน IP Address, เลือกและควบคุม UPF ผ่าน N4, สร้าง QoS Rules และส่งข้อมูล Policy/QoS ไปยัง UE, RAN และ UPF",
    plane: "CONTROL",
    analogy: "ผู้ออกแผนการเดินทาง",
  },
  UPF: {
    full: "User Plane Function",
    simple: "ทางผ่านของ Packet จริง ระหว่างสถานีฐานกับอินเทอร์เน็ตหรือ Edge Application",
    technical:
      "ทำ Packet Routing/Forwarding, QoS Enforcement, Traffic Measurement, Anchor และเชื่อม Data Network ผ่าน N6; สามารถวางใกล้ Edge เพื่อ Local Breakout",
    plane: "USER",
    analogy: "ทางด่วนและด่านส่งต่อ",
  },
  UDM: {
    full: "Unified Data Management",
    simple: "แหล่งข้อมูลสมาชิกและสิทธิ์บริการที่เครือข่ายใช้ตัดสินใจ",
    technical:
      "ดูแล Subscription Data และร่วมกับ ARPF/SIDF ในการสร้าง Authentication Data และถอดการปกปิด SUCI กลับเป็น SUPI ภายใน Home Network",
    plane: "CONTROL",
    analogy: "ทะเบียนสมาชิก",
  },
  AUSF: {
    full: "Authentication Server Function",
    simple: "ผู้ประสานการพิสูจน์ตัวตนระหว่าง Serving Network กับ Home Network",
    technical:
      "รองรับ Primary Authentication เช่น 5G-AKA/EAP-AKA′ ตรวจสิทธิ์ Serving Network และสร้างผลลัพธ์ที่นำไปสู่ Security Anchor ใน AMF/SEAF",
    plane: "CONTROL",
    analogy: "เจ้าหน้าที่ตรวจบัตร",
  },
  NSSF: {
    full: "Network Slice Selection Function",
    simple: "ช่วยเลือกชุด Network Slice ที่เหมาะและได้รับอนุญาตสำหรับ UE",
    technical:
      "ใช้ Requested/Allowed NSSAI, Subscription และข้อมูลเครือข่ายช่วยเลือก Network Slice Instance และ AMF Set ที่รองรับ",
    plane: "CONTROL",
    analogy: "ผู้จัดช่องบริการ",
  },
};

const slices: Record<
  SliceKey,
  {
    label: string;
    short: string;
    sst: string;
    use: string;
    priority: string;
    delay: string;
    reliability: string;
    qfi: number;
    path: "central" | "edge";
    note: string;
  }
> = {
  broadband: {
    label: "วิดีโอและอินเทอร์เน็ตทั่วไป",
    short: "eMBB",
    sst: "SST 1",
    use: "เน้น Throughput และประสบการณ์บรอดแบนด์",
    priority: "สมดุล",
    delay: "ปานกลาง",
    reliability: "มาตรฐานบริการข้อมูล",
    qfi: 7,
    path: "central",
    note: "อาจใช้ Non-GBR QoS Flow หลายชุดแยกจาก Signalling และบริการอื่น",
  },
  control: {
    label: "ควบคุมเครื่องจักรใกล้ Edge",
    short: "URLLC",
    sst: "SST 2",
    use: "เน้นความหน่วงต่ำและความน่าเชื่อถือสูง",
    priority: "สูงตาม Policy",
    delay: "ต่ำมากตามการออกแบบ",
    reliability: "สูง",
    qfi: 11,
    path: "edge",
    note: "Slice, QoS และ Edge ต้องออกแบบร่วมกัน จึงจะตอบโจทย์ End-to-End",
  },
  sensors: {
    label: "เซนเซอร์จำนวนมาก",
    short: "MIoT",
    sst: "SST 3",
    use: "เน้นจำนวนอุปกรณ์ พลังงาน และข้อมูลขนาดเล็ก",
    priority: "ตามประเภทข้อมูล",
    delay: "ยอมรับได้กว้างกว่า",
    reliability: "เหมาะกับ Telemetry",
    qfi: 21,
    path: "central",
    note: "ไม่จำเป็นต้องให้ทุก Packet มี Latency ต่ำหรือ Priority สูง",
  },
};

const authSteps = [
  {
    short: "IDENTITY",
    title: "UE ใช้ Temporary ID หรือ SUCI",
    from: "UE / USIM",
    to: "AMF",
    simple: "ถ้ามี 5G-GUTI ที่ยังใช้ได้ UE ใช้ตัวตนชั่วคราว มิฉะนั้นจึงสร้าง SUCI เพื่อปกปิดส่วนสำคัญของ SUPI",
    technical: "SUCI ไม่ได้ซ่อน MCC/MNC และอาจมี Null Scheme ในบางเงื่อนไข จึงไม่ควรเรียกว่า “IMSI ถูกเข้ารหัสเสมอ”",
  },
  {
    short: "DISCOVER",
    title: "Home Network ระบุตัวสมาชิก",
    from: "AMF / AUSF",
    to: "UDM / SIDF",
    simple: "คำขอถูกส่งไปยังเครือข่ายเจ้าของ SIM เพื่อค้นข้อมูลสมาชิกและวิธี Authentication",
    technical: "SIDF ภายใน UDM ใช้ Home Network Private Key ถอด SUCI เป็น SUPI เมื่อใช้ Non-null Protection Scheme",
  },
  {
    short: "CHALLENGE",
    title: "เครือข่ายส่งโจทย์ท้าทาย",
    from: "AUSF / AMF",
    to: "UE",
    simple: "UE ได้ RAND และ AUTN เพื่อพิสูจน์ว่าโจทย์มาจากเครือข่ายที่มีข้อมูลลับสอดคล้องกัน",
    technical: "USIM ตรวจ Authentication Token และ Sequence/Freshness ก่อนคำนวณ Response; Long-term Key ไม่ถูกส่งออกทางอากาศ",
  },
  {
    short: "VERIFY",
    title: "UE ตรวจเครือข่ายและตอบกลับ",
    from: "USIM / UE",
    to: "AUSF",
    simple: "ถ้า AUTN ถูกต้อง UE จึงสร้างคำตอบ เครือข่ายนำไปเปรียบเทียบกับค่าที่คาดไว้",
    technical: "5G-AKA ให้ Mutual Authentication ในระดับระบบ: UE ตรวจ Network ผ่าน AUTN และ Network ตรวจ UE ผ่าน RES*/XRES*",
  },
  {
    short: "ANCHOR",
    title: "สร้างลำดับชั้นกุญแจ",
    from: "AUSF / SEAF",
    to: "AMF",
    simple: "เมื่อพิสูจน์ตัวตนสำเร็จ ระบบสร้างกุญแจแยกตามหน้าที่ ไม่ใช้กุญแจลับใน SIM โดยตรง",
    technical: "Key Hierarchy แยก K_AUSF, K_SEAF, K_AMF และกุญแจ NAS/Access Stratum เพื่อจำกัดผลกระทบข้ามบริบท",
  },
  {
    short: "PROTECT",
    title: "เปิดการป้องกัน Signalling และ Data",
    from: "AMF / gNB",
    to: "UE",
    simple: "NAS และ RRC เปิด Integrity/Encryption ตาม Algorithm และ Policy ที่ตกลงกัน ก่อนใช้งานต่อ",
    technical: "NAS Security อยู่ระหว่าง UE–AMF; AS Security ครอบคลุม RRC และ User Plane ระหว่าง UE–gNB ตามการตั้งค่าและความสามารถ",
  },
];

const securityLayers: Record<
  SecurityLayerKey,
  { question: string; answer: string; protects: string; doesNot: string; example: string }
> = {
  identity: {
    question: "เครือข่ายเห็นชื่อถาวรของสมาชิกหรือไม่?",
    answer: "ใช้ Temporary ID และ SUCI ลดการเปิดเผย SUPI บน Radio Interface",
    protects: "ความเป็นส่วนตัวของ Subscription Identifier",
    doesNot: "ไม่ได้ทำให้ตำแหน่งหรือ Metadata ทุกชนิดหายไป",
    example: "SUPI / IMSI → SUCI หรือ 5G-GUTI",
  },
  authentication: {
    question: "ทั้งสองฝ่ายรู้ได้อย่างไรว่าอีกฝ่ายน่าเชื่อถือ?",
    answer: "Challenge–Response และ Authentication Token ทำให้ UE กับ Network ตรวจสอบกัน",
    protects: "การสวมรอยสมาชิกและเครือข่ายหลังขั้นตอนตรวจสอบ",
    doesNot: "Broadcast ก่อน Authentication ยังต้องถูกวิเคราะห์แยก",
    example: "5G-AKA หรือ EAP-AKA′",
  },
  confidentiality: {
    question: "คนอื่นอ่านเนื้อหาที่ส่งผ่านวิทยุได้หรือไม่?",
    answer: "Ciphering ทำให้ผู้ที่ไม่มีกุญแจอ่านข้อมูลที่ป้องกันไว้ได้ยาก",
    protects: "ความลับของ Signalling และ User Data ตาม Scope",
    doesNot: "Encryption ไม่ได้ยืนยันว่าข้อความไม่ถูกแก้ไข",
    example: "5G NAS/AS Encryption Algorithms",
  },
  integrity: {
    question: "ตรวจได้อย่างไรว่าข้อความถูกแก้ระหว่างทาง?",
    answer: "Integrity Protection ใช้กุญแจตรวจความถูกต้องและแหล่งที่มาของข้อความ",
    protects: "Signalling เป็นหลัก และรองรับ User Plane Integrity ใน 5G",
    doesNot: "ไม่ได้ซ่อนเนื้อหาของข้อความ",
    example: "NAS MAC / RRC Integrity",
  },
};

const fakeSignals = [
  {
    signal: "เครื่องตกจาก 5G/4G ไป 2G โดยไม่สมเหตุผล",
    weight: 3,
    check: "ตรวจ Coverage จริง, การตั้งค่า Allow 2G, Operator Policy และเหตุขัดข้องก่อนสรุป",
  },
  {
    signal: "Cell/TAC/ความถี่เปลี่ยนผิดปกติเป็นกลุ่มในจุดเดิม",
    weight: 2,
    check: "เทียบ Scanner, Neighbor List, Route เดิม และข้อมูลจากหลายเครื่องในเวลาเดียวกัน",
  },
  {
    signal: "เกิด Registration Reject หรือ Service Loss พร้อมกันหลายเครื่อง",
    weight: 2,
    check: "ตรวจ Cause Code, Outage, SIM/Subscription และสถานะเครือข่ายผู้ให้บริการ",
  },
  {
    signal: "โทรศัพท์หรือเครื่องมือแจ้งว่าไม่มี Encryption",
    weight: 3,
    check: "บันทึก RAT, เวลา, ตำแหน่ง และ Security Mode; หลีกเลี่ยงการส่งข้อมูลสำคัญ",
  },
  {
    signal: "พบ Cell ใหม่กำลังแรงมาก แต่ไม่มี Neighbor Relation ที่สมเหตุผล",
    weight: 2,
    check: "ตรวจ PCI/ARFCN/PLMN/TAC, Spectrum, ทิศทาง และประวัติการวัดซ้ำ",
  },
];

const quiz = [
  {
    question: "Network Function ใดเป็นทางผ่านหลักของ User Data?",
    choices: ["UPF", "AMF", "AUSF"],
    answer: 0,
    explain: "UPF อยู่ใน User Plane ทำ Routing/Forwarding และ QoS Enforcement ส่วน AMF/AUSF อยู่ Control Plane",
  },
  {
    question: "SMF มีหน้าที่สำคัญข้อใด?",
    choices: ["จัดการ PDU Session และควบคุม UPF", "สร้างคลื่น RF", "เก็บ Long-term Key ในโทรศัพท์"],
    answer: 0,
    explain: "SMF เลือก/ควบคุม UPF และประสาน Policy กับ QoS ของ PDU Session",
  },
  {
    question: "ข้อใดอธิบาย Network Slice ได้ถูกต้อง?",
    choices: ["เครือข่ายเชิงตรรกะที่ปรับความสามารถตามบริการ", "ช่องความถี่หนึ่งช่องเสมอ", "แอป VPN บนโทรศัพท์"],
    answer: 0,
    explain: "Slice ครอบคลุมความสามารถเครือข่ายเชิงตรรกะและอาจแชร์โครงสร้างพื้นฐานทางกายภาพกับ Slice อื่น",
  },
  {
    question: "QFI และ 5QI ต่างกันอย่างไร?",
    choices: ["QFI ระบุ QoS Flow ใน Session ส่วน 5QI อ้างอิงคุณลักษณะ QoS", "เป็นค่าเดียวกันเสมอ", "QFI คือหมายเลข Cell"],
    answer: 0,
    explain: "QFI เป็นตัวระบุ Flow ที่ไม่ซ้ำใน PDU Session ส่วน 5QI สื่อคุณลักษณะการส่งต่อและการจัดการ QoS",
  },
  {
    question: "Edge Computing ลด Latency ได้อย่างไร?",
    choices: ["วาง Application/UPF ใกล้ UE และทำ Local Breakout", "เพิ่ม PCI", "ปิด Authentication"],
    answer: 0,
    explain: "เส้นทาง User Plane ที่สั้นลงช่วยลดส่วนหนึ่งของ Latency แต่ผล End-to-End ยังขึ้นกับ RAN, Transport, Load และ Application",
  },
  {
    question: "Long-term Key ใน USIM ถูกส่งไปหาเครือข่ายหรือไม่?",
    choices: ["ไม่ส่ง ใช้คำนวณ Challenge–Response ภายใน Secure Element", "ส่งทุกครั้งแบบ Plaintext", "ส่งผ่าน PSS"],
    answer: 0,
    explain: "USIM และ Home Network มีข้อมูลลับที่สอดคล้องกัน แต่กุญแจระยะยาวไม่ถูกส่งผ่านอากาศ",
  },
  {
    question: "เมื่อ SUPI อยู่ในรูป IMSI, SUCI ทำหน้าที่อะไร?",
    choices: ["ปกปิดส่วน Subscription Identifier ก่อนส่งทางวิทยุ", "เพิ่มกำลังส่ง", "เลือก Beam"],
    answer: 0,
    explain: "SUCI เป็น Concealed Identifier ที่ช่วยลดการเปิดเผย SUPI/IMSI โดยตรง มีข้อยกเว้นและรายละเอียดตาม Protection Scheme",
  },
  {
    question: "Encryption กับ Integrity ต่างกันอย่างไร?",
    choices: ["Encryption ซ่อนเนื้อหา ส่วน Integrity ตรวจการแก้ไข/ความถูกต้อง", "เหมือนกันทุกประการ", "Integrity ใช้เพิ่มความเร็ว"],
    answer: 0,
    explain: "ทั้งสองแก้คนละปัญหา ระบบที่ปลอดภัยจึงมักใช้ร่วมกันตาม Scope และ Policy",
  },
  {
    question: "พบ Cell แปลกหนึ่งครั้ง สรุปว่าเป็นสถานีฐานปลอมได้หรือไม่?",
    choices: ["ไม่ได้ ต้องหาหลักฐานหลายมิติและตัดเหตุปกติออก", "ได้ทันที", "ดู RSRP อย่างเดียวพอ"],
    answer: 0,
    explain: "Outage, Optimization, Coverage และอุปกรณ์ผิดปกติก็สร้างอาการคล้ายกัน ต้องเทียบเวลา ตำแหน่ง Signalling และ RF",
  },
  {
    question: "ผู้ใช้ทั่วไปควรทำอย่างไรเมื่อสงสัยสถานีฐานปลอม?",
    choices: ["หยุดส่งข้อมูลสำคัญ ย้ายพื้นที่/เปิดโหมดเครื่องบิน และรายงานผู้ให้บริการ", "พยายามเชื่อมต่อซ้ำเพื่อทดสอบ", "เผยแพร่หมายเลขสมาชิก"],
    answer: 0,
    explain: "เน้นลดความเสี่ยง เก็บข้อมูลที่ไม่ละเอียดอ่อน และประสานผู้ให้บริการหรือหน่วยงานที่เกี่ยวข้อง ไม่ควรตอบโต้เอง",
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

export default function CoreSecurityLessonClient() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionPreference,
    getServerReducedMotionPreference,
  );
  const [motionPaused, setMotionPaused] = useState(false);
  const [activeFunction, setActiveFunction] = useState<FunctionKey>("AMF");
  const [plane, setPlane] = useState<"control" | "user">("control");
  const [slice, setSlice] = useState<SliceKey>("broadband");
  const [edgeEnabled, setEdgeEnabled] = useState(false);
  const [authStep, setAuthStep] = useState(0);
  const [securityLayer, setSecurityLayer] = useState<SecurityLayerKey>("identity");
  const [selectedSignals, setSelectedSignals] = useState<number[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const animationsStopped = motionPaused || prefersReducedMotion;
  const currentFunction = coreFunctions[activeFunction];
  const currentSlice = slices[slice];
  const currentSecurityLayer = securityLayers[securityLayer];
  const effectiveEdge = edgeEnabled || currentSlice.path === "edge";
  const riskScore = useMemo(
    () => selectedSignals.reduce((total, index) => total + fakeSignals[index].weight, 0),
    [selectedSignals],
  );
  const riskLabel =
    selectedSignals.length === 0
      ? "ยังไม่มีข้อมูล"
      : riskScore >= 7 && selectedSignals.length >= 3
        ? "ควรยกระดับการตรวจสอบ"
        : "เป็นเพียงสัญญาณเตือน";
  const answeredAll = answers.every((answer) => answer !== null);
  const score = answers.reduce(
    (total, answer, index) => total + (answer === quiz[index].answer ? 1 : 0),
    0,
  );

  function toggleSignal(index: number) {
    setSelectedSignals((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  }

  return (
    <main className={`cs-page${animationsStopped ? " cs-motion-paused" : ""}`}>
      <header className="cs-header">
        <Link className="cs-brand" href="/">
          <span aria-hidden="true">RF</span>
          <span>
            <strong>Mobile Network Classroom</strong>
            <small>บทที่ 06 · 5G Core, Slicing & Security</small>
          </span>
        </Link>
        <div className="cs-header-actions">
          <nav aria-label="เมนูบทเรียน">
            <a href="#core">5G Core</a>
            <a href="#slicing">Slicing</a>
            <a href="#security">Security</a>
            <a href="#fake-base">สถานีฐานปลอม</a>
            <a href="#quiz">แบบทดสอบ</a>
          </nav>
          <button
            className="cs-motion-toggle"
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

      <section className="cs-hero" id="top">
        <div className="cs-hero-copy">
          <p className="cs-kicker">Core Network, Slicing & Trust</p>
          <h1>ใครคุมเส้นทาง<br />ใครยืนยันตัวตน?</h1>
          <p>
            บทก่อนพา UE ผ่าน Radio Access และ Handover บทนี้จะเดินต่อเข้า 5G Core
            เพื่อแยก Control Plane ออกจาก User Plane เห็นว่า Slice/QoS/Edge ทำงานร่วมกันอย่างไร
            และเข้าใจชั้นความปลอดภัยตั้งแต่ USIM จนถึง Application
          </p>
          <div className="cs-hero-actions">
            <a className="cs-primary" href="#core">เข้าไปใน 5G Core ↓</a>
            <span>ประมาณ 40 นาที · 4 ห้องทดลอง · 10 คำถาม</span>
          </div>
          <dl className="cs-hero-facts">
            <div><dt>6</dt><dd>Core Functions หลัก</dd></div>
            <div><dt>4</dt><dd>ชั้นความปลอดภัย</dd></div>
            <div><dt>2</dt><dd>เส้นทาง Control / User</dd></div>
          </dl>
        </div>

        <div className="cs-hero-visual" aria-label="แผนภาพโทรศัพท์เชื่อมผ่าน 5G Core ไปยัง Edge และ Cloud">
          <div className="cs-hero-phone"><i /><b>UE</b></div>
          <div className="cs-hero-ran"><i /><i /><b>gNB</b></div>
          <div className="cs-hero-core">
            <span>5G CORE</span>
            <b>AMF</b><b>SMF</b><b>UPF</b>
          </div>
          <div className="cs-hero-edge"><b>EDGE</b><small>APP</small></div>
          <div className="cs-hero-cloud"><b>DATA</b><small>NETWORK</small></div>
          <div className="cs-hero-control-path" />
          <div className="cs-hero-user-path" />
          <div className="cs-hero-lock" aria-hidden="true"><i /><span>✓</span></div>
          <p><span>CONTROL</span> ตัดสินใจ · <span>USER</span> ส่ง Packet · <span>SECURITY</span> สร้างความเชื่อถือ</p>
        </div>
      </section>

      <section className="cs-outcomes">
        <div>
          <p className="cs-section-index">เป้าหมายของบท</p>
          <h2>เห็นทั้งเส้นทาง<br />และขอบเขตความเชื่อถือ</h2>
        </div>
        <ol>
          <li><span>01</span><p>แยกบทบาท AMF, SMF และ UPF ได้ชัดเจน</p></li>
          <li><span>02</span><p>อธิบาย Slice, PDU Session, QoS Flow และ Edge ได้</p></li>
          <li><span>03</span><p>ตามลำดับ SIM Authentication และ Key Hierarchy ได้</p></li>
          <li><span>04</span><p>วิเคราะห์สถานีฐานปลอมโดยไม่สรุปจากอาการเดียว</p></li>
        </ol>
      </section>

      <section className="cs-section cs-core" id="core">
        <div className="cs-section-heading">
          <p className="cs-section-index">01 · 5G Core Map</p>
          <h2>Core ไม่ใช่กล่องเดียว<br />แต่เป็นทีมของ Network Functions</h2>
          <p>
            5GC ใช้ Service-Based Architecture แยกหน้าที่ออกเป็นบริการ
            ทำให้ Control Plane ขยายและพัฒนาแยกจาก User Plane ได้
          </p>
        </div>

        <div className="cs-core-lab">
          <div className="cs-function-map" role="group" aria-label="เลือก Network Function">
            <div className="cs-map-ue"><b>UE</b><small>ผู้ใช้</small></div>
            <div className="cs-map-ran"><b>NG-RAN</b><small>gNB</small></div>
            {(Object.keys(coreFunctions) as FunctionKey[]).map((key) => (
              <button
                className={`cs-nf cs-nf-${key.toLowerCase()}${activeFunction === key ? " active" : ""}`}
                type="button"
                key={key}
                onClick={() => setActiveFunction(key)}
                aria-pressed={activeFunction === key}
              >
                <b>{key}</b>
                <small>{coreFunctions[key].plane}</small>
              </button>
            ))}
            <div className="cs-map-dn"><b>DN</b><small>Internet / Edge</small></div>
            <div className="cs-map-lines" aria-hidden="true"><i /><i /><i /><i /></div>
          </div>

          <article className="cs-function-card" aria-live="polite">
            <div className="cs-function-topline">
              <span>{currentFunction.plane} PLANE</span>
              <span>{activeFunction}</span>
            </div>
            <p>{currentFunction.full}</p>
            <h3>{currentFunction.simple}</h3>
            <dl>
              <div><dt>เปรียบเหมือน</dt><dd>{currentFunction.analogy}</dd></div>
              <div><dt>Packet ของผู้ใช้ผ่านหรือไม่?</dt><dd>{currentFunction.plane === "USER" ? "ผ่าน" : "ไม่ผ่าน"}</dd></div>
            </dl>
            <details>
              <summary>สำหรับช่างเทคนิค <b aria-hidden="true">+</b></summary>
              <p>{currentFunction.technical}</p>
            </details>
          </article>
        </div>

        <div className="cs-plane-switch">
          <div>
            <p className="cs-section-index">ลองสลับ Plane</p>
            <h3>ข้อความสั่งการกับ Packet จริง<br />ใช้คนละเส้นทาง</h3>
          </div>
          <div className="cs-plane-buttons" role="group" aria-label="เลือกเส้นทาง">
            <button type="button" className={plane === "control" ? "active" : ""} onClick={() => setPlane("control")}>
              Control Plane
            </button>
            <button type="button" className={plane === "user" ? "active" : ""} onClick={() => setPlane("user")}>
              User Plane
            </button>
          </div>
          <div className={`cs-plane-path ${plane}`}>
            {plane === "control" ? (
              <>
                <div><b>UE</b><small>NAS</small></div><i>→</i>
                <div><b>gNB</b><small>Relay</small></div><i>→</i>
                <div><b>AMF</b><small>Access</small></div><i>↔</i>
                <div><b>SMF</b><small>Session</small></div>
              </>
            ) : (
              <>
                <div><b>APP</b><small>Packet</small></div><i>→</i>
                <div><b>UE</b><small>QFI</small></div><i>→</i>
                <div><b>gNB</b><small>DRB</small></div><i>→</i>
                <div><b>UPF</b><small>Forward</small></div><i>→</i>
                <div><b>DN</b><small>Service</small></div>
              </>
            )}
          </div>
          <p className="cs-plane-note">
            {plane === "control"
              ? "AMF และ SMF ช่วยตัดสินใจและตั้งค่า แต่ไม่แบก Video/Data Packet ของผู้ใช้"
              : "เมื่อ Session พร้อม User Data วิ่งผ่าน RAN และ UPF ไปยัง Data Network โดยมี QFI ช่วยบอกการดูแล QoS"}
          </p>
        </div>
      </section>

      <section className="cs-section cs-slicing" id="slicing">
        <div className="cs-section-heading">
          <p className="cs-section-index">02 · Slice, QoS & Edge Lab</p>
          <h2>ใช้โครงสร้างร่วมกัน<br />แต่ให้บริการต่างกันได้</h2>
          <p>
            Network Slice คือเครือข่ายเชิงตรรกะที่ปรับความสามารถตามบริการ
            ไม่จำเป็นต้องแยกอุปกรณ์ทางกายภาพทุกชิ้น และไม่ใช่เพียงช่องความถี่
          </p>
        </div>

        <div className="cs-slice-lab">
          <div className="cs-slice-tabs" role="tablist" aria-label="เลือกตัวอย่าง Slice">
            {(Object.keys(slices) as SliceKey[]).map((key) => (
              <button
                role="tab"
                type="button"
                key={key}
                aria-selected={slice === key}
                className={slice === key ? "active" : ""}
                onClick={() => setSlice(key)}
              >
                <span>{slices[key].sst}</span>
                <b>{slices[key].short}</b>
                <small>{slices[key].label}</small>
              </button>
            ))}
          </div>

          <div className="cs-slice-stage">
            <article>
              <div className="cs-slice-id"><span>S-NSSAI</span><strong>{currentSlice.sst}</strong><small>SST + optional SD</small></div>
              <p>{currentSlice.label}</p>
              <h3>{currentSlice.use}</h3>
              <dl>
                <div><dt>Priority</dt><dd>{currentSlice.priority}</dd></div>
                <div><dt>Delay</dt><dd>{currentSlice.delay}</dd></div>
                <div><dt>Reliability</dt><dd>{currentSlice.reliability}</dd></div>
              </dl>
              <p>{currentSlice.note}</p>
            </article>

            <div className="cs-slice-pipes" aria-label="ภาพ QoS Flow หลายชุดใน PDU Session">
              <div className="cs-session-label"><b>PDU SESSION</b><span>DNN + S-NSSAI</span></div>
              <div className="cs-qos-flow flow-one"><span>QFI {currentSlice.qfi}</span><i /><b>Application Data</b></div>
              <div className="cs-qos-flow flow-two"><span>QFI {currentSlice.qfi + 1}</span><i /><b>Service Control</b></div>
              <div className="cs-qos-flow flow-three"><span>QFI {currentSlice.qfi + 2}</span><i /><b>Background Data</b></div>
              <p>QFI แยก Flow ภายใน Session · 5QI บอกลักษณะ QoS · RAN Map Flow ไปยัง DRB</p>
            </div>
          </div>
        </div>

        <div className="cs-qos-clarity">
          <article><span>PDU SESSION</span><h3>การเชื่อมต่อไปยัง Data Network</h3><p>หนึ่ง Session มี DNN, S-NSSAI, IP/Session Context และมี QoS Flow ได้หลายชุด</p></article>
          <article><span>QFI</span><h3>หมายเลขของ QoS Flow</h3><p>ไม่ซ้ำภายใน PDU Session และถูกใช้ Mark Packet บน N3/N9 โดยไม่แก้ Header ของ End-to-End Packet</p></article>
          <article><span>5QI</span><h3>ตัวอ้างอิงคุณลักษณะ QoS</h3><p>เชื่อมไปยัง Priority, Packet Delay Budget, Error Rate และการจัดการแบบ GBR/Non-GBR ตาม Policy</p></article>
        </div>

        <div className="cs-edge-lab">
          <div>
            <p className="cs-section-index">Edge Computing</p>
            <h3>ย้าย Application เข้าใกล้<br />เพื่อลดระยะทางของ Packet</h3>
            <p>
              SMF สามารถเลือก UPF ใกล้พื้นที่และสั่ง Steering ไปยัง Local Data Network
              ผ่าน N6 แต่ Latency จริงยังขึ้นกับ RAN, Transport, Load และ Application
            </p>
            <button
              type="button"
              className="cs-edge-toggle"
              onClick={() => setEdgeEnabled((current) => !current)}
              aria-pressed={effectiveEdge}
            >
              <span>{effectiveEdge ? "EDGE PATH" : "CENTRAL PATH"}</span>
              <i><b /></i>
            </button>
            {currentSlice.path === "edge" && !edgeEnabled && <small>ตัวอย่าง URLLC เลือก Edge Path เป็นค่าเริ่มต้น</small>}
          </div>
          <div className={`cs-edge-route ${effectiveEdge ? "edge" : "central"}`}>
            <div><b>UE</b><small>Application</small></div><i>→</i>
            <div><b>gNB</b><small>Radio</small></div><i>→</i>
            <div><b>UPF</b><small>{effectiveEdge ? "Local" : "Central"}</small></div><i>→</i>
            {effectiveEdge ? (
              <div className="target"><b>EDGE APP</b><small>Local DN</small></div>
            ) : (
              <>
                <div><b>Transport</b><small>Backhaul</small></div><i>→</i>
                <div className="target"><b>CLOUD APP</b><small>Central DN</small></div>
              </>
            )}
            <span className="cs-route-pulse" aria-hidden="true" />
          </div>
        </div>

        <div className="cs-slice-myth">
          <span>MYTH CHECK</span>
          <p>
            Slice ≠ ความเร็วสูงเสมอ · Slice ≠ Spectrum แยกเสมอ · Slice ≠ Security Boundary สมบูรณ์โดยอัตโนมัติ
            การรับประกันบริการต้องพิจารณา RAN, Transport, Core, Edge, Orchestration และ Security ร่วมกัน
          </p>
        </div>
      </section>

      <section className="cs-section cs-security" id="security">
        <div className="cs-section-heading">
          <p className="cs-section-index">03 · Identity & 5G Authentication</p>
          <h2>SIM ไม่ส่งกุญแจลับ<br />แต่พิสูจน์ว่ารู้กุญแจเดียวกัน</h2>
          <p>
            USIM และ Home Network เก็บ Subscription Credential ที่สอดคล้องกัน
            แล้วใช้ Challenge–Response เพื่อยืนยันตัวตนและสร้าง Session Keys
          </p>
        </div>

        <div className="cs-identity-strip">
          <article><span>IMSI</span><h3>รูปแบบตัวตนสมาชิกแบบเดิม</h3><p>ใน 5G ถ้า SUPI ใช้ IMSI Format ตัว IMSI คือ Subscription Identifier ภายใน SUPI</p></article>
          <i aria-hidden="true">→</i>
          <article><span>SUPI</span><h3>Subscription Permanent Identifier</h3><p>ตัวตนถาวรที่ Home Network ใช้ระบุ Subscription ไม่ควรส่งเปิดเผยผ่าน NG-RAN</p></article>
          <i aria-hidden="true">→</i>
          <article><span>SUCI</span><h3>Subscription Concealed Identifier</h3><p>ปกปิดส่วน Subscription ของ SUPI ด้วยข้อมูลจาก Home Network ก่อนส่งทางวิทยุ</p></article>
          <i aria-hidden="true">+</i>
          <article><span>5G-GUTI</span><h3>Temporary Identity</h3><p>ใช้ตัวตนชั่วคราวเมื่อ Context ยังใช้ได้ เพื่อลดการเผยตัวตนถาวรซ้ำ</p></article>
        </div>

        <div className="cs-auth-lab">
          <ol className="cs-auth-steps">
            {authSteps.map((step, index) => (
              <li key={step.short}>
                <button
                  type="button"
                  className={authStep === index ? "active" : ""}
                  onClick={() => setAuthStep(index)}
                  aria-current={authStep === index ? "step" : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><small>{step.short}</small><b>{step.title}</b></div>
                  <i aria-hidden="true">→</i>
                </button>
              </li>
            ))}
          </ol>

          <div className="cs-auth-stage" aria-live="polite">
            <div className="cs-auth-actors">
              <div><b>{authSteps[authStep].from}</b><small>FROM</small></div>
              <span><i /><b>{authSteps[authStep].short}</b></span>
              <div><b>{authSteps[authStep].to}</b><small>TO</small></div>
            </div>
            <div className="cs-auth-copy">
              <span>{String(authStep + 1).padStart(2, "0")} / {authSteps.length}</span>
              <h3>{authSteps[authStep].title}</h3>
              <p>{authSteps[authStep].simple}</p>
              <details>
                <summary>สำหรับช่างเทคนิค <b aria-hidden="true">+</b></summary>
                <p>{authSteps[authStep].technical}</p>
              </details>
            </div>
          </div>
        </div>

        <div className="cs-key-rule">
          <div className="cs-usim-card"><span>USIM</span><b>K</b><small>LONG-TERM KEY</small></div>
          <i aria-hidden="true">≠</i>
          <div><h3>กุญแจระยะยาวไม่ออกจาก Secure Element</h3><p>สิ่งที่เดินทางคือ Challenge, Authentication Token และ Response ส่วนกุญแจใช้งานถูก Derive แยกตามบริบท</p></div>
          <div className="cs-key-tree" aria-label="ลำดับชั้นกุญแจแบบย่อ">
            <b>K<sub>SEAF</sub></b><i>→</i><b>K<sub>AMF</sub></b><i>→</i><span>K<sub>NAS</sub></span><span>K<sub>gNB</sub></span>
          </div>
        </div>

        <div className="cs-layer-lab">
          <div className="cs-layer-tabs" role="tablist" aria-label="เลือกชั้นความปลอดภัย">
            {(Object.keys(securityLayers) as SecurityLayerKey[]).map((key) => (
              <button
                type="button"
                role="tab"
                key={key}
                aria-selected={securityLayer === key}
                className={securityLayer === key ? "active" : ""}
                onClick={() => setSecurityLayer(key)}
              >
                {key}
              </button>
            ))}
          </div>
          <article>
            <p>{currentSecurityLayer.question}</p>
            <h3>{currentSecurityLayer.answer}</h3>
            <dl>
              <div><dt>ช่วยป้องกัน</dt><dd>{currentSecurityLayer.protects}</dd></div>
              <div><dt>ไม่ได้หมายความว่า</dt><dd>{currentSecurityLayer.doesNot}</dd></div>
              <div><dt>ตัวอย่าง</dt><dd>{currentSecurityLayer.example}</dd></div>
            </dl>
          </article>
        </div>

        <div className="cs-protection-scope">
          <article><span>NAS SECURITY</span><h3>UE ↔ AMF</h3><p>ปกป้อง Signalling ระดับ Core เช่น Registration และ Session Management</p></article>
          <article><span>AS SECURITY</span><h3>UE ↔ gNB</h3><p>ปกป้อง RRC และ User Plane ตาม Algorithm, Policy และความสามารถที่กำหนด</p></article>
          <article><span>SBA SECURITY</span><h3>NF ↔ NF</h3><p>ใช้ Authentication, Authorization, Confidentiality และ Integrity ระหว่าง Network Functions</p></article>
          <article><span>APP SECURITY</span><h3>App ↔ Service</h3><p>HTTPS/E2E Encryption ยังสำคัญ เพราะการป้องกันเครือข่ายมือถือไม่ได้แทนที่ Application Security</p></article>
        </div>
      </section>

      <section className="cs-section cs-fake-base" id="fake-base">
        <div className="cs-section-heading">
          <p className="cs-section-index">04 · False Base Station Awareness</p>
          <h2>สัญญาณแรงและชื่อเครือข่ายถูก<br />ยังไม่ใช่หลักฐานว่า Cell ปลอดภัย</h2>
          <p>
            UE ต้องอ่าน Broadcast และเริ่ม Initial Access ก่อน Security Context สมบูรณ์
            ระบบใหม่ลดความเสี่ยงด้วย Mutual Authentication และ SUCI แต่ยังต้องรับมือ Downgrade,
            Denial of Service และการชักนำก่อน Authentication
          </p>
        </div>

        <div className="cs-fbs-concept">
          <article>
            <span>LEGITIMATE CELL</span>
            <div className="cs-fbs-tower legit"><i /><b>✓</b></div>
            <h3>ผ่าน Authentication<br />และ Security Mode</h3>
            <p>การมี Key Hierarchy ที่ถูกต้องทำให้ UE ตรวจเครือข่ายและเปิดการป้องกัน Signalling ได้</p>
          </article>
          <div className="cs-fbs-phone"><span /><b>UE</b><i>?</i></div>
          <article>
            <span>SUSPICIOUS CELL</span>
            <div className="cs-fbs-tower suspicious"><i /><b>!</b></div>
            <h3>เลียนแบบ Broadcast<br />แต่ไม่มีหลักฐานความเชื่อถือ</h3>
            <p>อาจพยายามดึง UE, ทำให้บริการหาย หรือบังคับ Downgrade แต่ผลขึ้นกับ RAT, Device และ Network Configuration</p>
          </article>
        </div>

        <div className="cs-evidence-lab">
          <div>
            <p className="cs-section-index">Evidence Builder</p>
            <h3>เลือกอาการที่พบ<br />แล้วดูว่าน้ำหนักพอหรือยัง</h3>
            <p>แบบจำลองนี้ช่วยจัดลำดับการตรวจ ไม่ใช่เครื่องตรวจจับหรือหลักฐานยืนยันสถานีฐานปลอม</p>
            <div className="cs-risk-meter">
              <span>ผลประเมินเบื้องต้น</span>
              <strong>{riskLabel}</strong>
              <i><b style={{ width: `${Math.min(100, riskScore * 10)}%` }} /></i>
              <small>{selectedSignals.length} อาการ · น้ำหนัก {riskScore}/10+</small>
            </div>
          </div>

          <div className="cs-signal-checks">
            {fakeSignals.map((item, index) => (
              <label key={item.signal}>
                <input
                  type="checkbox"
                  checked={selectedSignals.includes(index)}
                  onChange={() => toggleSignal(index)}
                />
                <span><b>{item.signal}</b><small>{item.check}</small></span>
                <i>+{item.weight}</i>
              </label>
            ))}
          </div>
        </div>

        <div className="cs-response-grid">
          <article>
            <span>บุคคลทั่วไป</span>
            <h3>ลดความเสี่ยงก่อน</h3>
            <ol>
              <li>หยุดทำธุรกรรมหรือส่งข้อมูลสำคัญ</li>
              <li>ย้ายออกจากพื้นที่หรือเปิดโหมดเครื่องบิน</li>
              <li>ปิด 2G หากอุปกรณ์และพื้นที่รองรับ</li>
              <li>ใช้แอปที่มี End-to-End Encryption</li>
              <li>บันทึกเวลา/พื้นที่และแจ้งผู้ให้บริการ</li>
            </ol>
          </article>
          <article>
            <span>ช่างเทคนิค</span>
            <h3>พิสูจน์ด้วยหลายแหล่ง</h3>
            <ol>
              <li>ซ้อน Scanner กับ Test Phone ตามเวลา/ตำแหน่ง</li>
              <li>ตรวจ RAT, PLMN, ARFCN, PCI, TAC และ Neighbor</li>
              <li>ดู NAS/RRC Cause และ Security Mode</li>
              <li>เทียบหลาย SIM/Device และ Baseline เส้นทางเดิม</li>
              <li>Escalate ให้ Security/Operator ตรวจ Core Logs</li>
            </ol>
          </article>
          <article className="cs-do-not">
            <span>อย่าทำ</span>
            <h3>อย่าตอบโต้หรือทดลองโจมตี</h3>
            <p>การรบกวนคลื่น ดักข้อมูล หรือพยายามเข้าถึงอุปกรณ์ต้องสงสัยอาจผิดกฎหมายและทำลายหลักฐาน ให้ส่งต่อหน่วยงานที่มีอำนาจและเครื่องมือที่เหมาะสม</p>
          </article>
        </div>

        <div className="cs-fbs-truth">
          <span>ข้อสรุปที่ปลอดภัย</span>
          <p>
            5G เพิ่มการปกปิดตัวตนและ Mutual Authentication แต่คำว่า “5G ป้องกันสถานีฐานปลอมได้ทั้งหมด”
            กว้างเกินจริง ควรระบุว่าแต่ละกลไกลดความเสี่ยงส่วนใด และยังเหลือ Threat ก่อน Authentication,
            Downgrade, Jamming/DoS, Misconfiguration และ Endpoint/App Risk
          </p>
        </div>
      </section>

      <section className="cs-section cs-field">
        <div className="cs-section-heading">
          <p className="cs-section-index">05 · End-to-End Diagnosis</p>
          <h2>อาการเดียวกัน<br />อาจเกิดคนละชั้น</h2>
        </div>
        <div className="cs-diagnosis">
          <article><span>สมัครบริการได้ แต่ไม่มี Data</span><b>SMF / UPF / PDU Session</b><p>ตรวจ Session Establishment, DNN, IP, N4, N3/N6 และ Policy</p></article>
          <article><span>Data ได้ แต่ Application หน่วง</span><b>QoS / Edge / Transport</b><p>แยก Radio Latency, Backhaul, UPF Path, Server Processing และ Congestion</p></article>
          <article><span>Slice ที่ขอไม่ถูกอนุญาต</span><b>NSSF / UDM / Subscription</b><p>ตรวจ Requested/Allowed NSSAI, Subscription, Area และ Slice Availability</p></article>
          <article><span>Authentication ไม่ผ่าน</span><b>USIM / AUSF / UDM</b><p>ตรวจ Sync Failure, MAC Failure, Subscription, Serving Network และ Roaming</p></article>
          <article><span>ลงทะเบียนได้ แต่ Security ผิดปกติ</span><b>NAS / AS Security</b><p>ตรวจ Algorithm Selection, Security Mode, Downgrade Context และ Device Capability</p></article>
          <article><span>สัญญาณแรงแต่ Service หาย</span><b>อย่าหยุดที่ RSRP</b><p>ไล่จาก RAN → Registration → Session → UPF → DN → Application</p></article>
        </div>
      </section>

      <section className="cs-section cs-glossary">
        <div className="cs-section-heading">
          <p className="cs-section-index">คำศัพท์สำคัญ</p>
          <h2>เปิดทบทวน<br />ก่อนอ่าน Trace</h2>
        </div>
        <div>
          {[
            ["PDU Session", "ความสัมพันธ์เชิงตรรกะระหว่าง UE กับ Data Network ซึ่งมี Session Context และ QoS Flow ได้หลายชุด"],
            ["S-NSSAI", "ตัวระบุ Single Network Slice Selection Assistance Information ประกอบด้วย SST และ SD แบบ Optional"],
            ["QoS Flow", "หน่วยย่อยที่สุดของการแยก QoS ภายใน PDU Session โดย Packet ที่ QFI เดียวกันได้รับการจัดการแบบเดียวกัน"],
            ["Local Breakout", "การส่ง User Data ออกจาก Mobile Core ไปยัง Data Network ใกล้พื้นที่ แทนการอ้อมไปศูนย์กลาง"],
            ["SUPI", "Subscription Permanent Identifier ที่ Home Network ใช้ระบุตัวสมาชิกอย่างถาวร"],
            ["SUCI", "Subscription Concealed Identifier ที่ช่วยปกปิดส่วนสำคัญของ SUPI บน Radio Interface"],
            ["5G-AKA", "กระบวนการ Authentication and Key Agreement สำหรับตรวจ UE/Network และสร้าง Key Material"],
            ["Security Context", "ชุดสถานะ กุญแจ Algorithm และตัวนับที่ใช้ป้องกัน NAS หรือ Access Stratum ในช่วงหนึ่ง"],
          ].map(([term, meaning]) => (
            <details key={term}>
              <summary>{term}<span aria-hidden="true">+</span></summary>
              <p>{meaning}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cs-section cs-quiz" id="quiz">
        <div className="cs-section-heading">
          <p className="cs-section-index">แบบทดสอบท้ายบท</p>
          <h2>แยกเส้นทาง<br />และชั้นความปลอดภัยได้หรือยัง?</h2>
          <p>ตอบให้ครบทั้ง 10 ข้อ แล้วตรวจผลพร้อมคำอธิบาย</p>
        </div>
        <div className="cs-quiz-list">
          {quiz.map((item, questionIndex) => {
            const isCorrect = answers[questionIndex] === item.answer;
            return (
              <fieldset
                className={`cs-question${submitted ? (isCorrect ? " correct" : " incorrect") : ""}`}
                key={item.question}
              >
                <legend><span>{String(questionIndex + 1).padStart(2, "0")}</span>{item.question}</legend>
                <div className="cs-choices">
                  {item.choices.map((choice, choiceIndex) => (
                    <label key={choice}>
                      <input
                        type="radio"
                        name={`core-security-question-${questionIndex}`}
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
                  <div className="cs-feedback" role="status">
                    <strong>{isCorrect ? "ถูกต้อง" : "ทบทวนอีกครั้ง"}</strong>
                    <span>{item.explain}</span>
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>
        <div className="cs-quiz-actions">
          <button className="cs-primary" type="button" disabled={!answeredAll} onClick={() => setSubmitted(true)}>
            ตรวจคำตอบ
          </button>
          <p><strong>{submitted ? score : "—"} / {quiz.length}</strong><span>{submitted ? (score >= 8 ? "เข้าใจเส้นทางและ Trust Boundary แล้ว" : "ทบทวนหัวข้อที่ยังสับสนอีกครั้ง") : "ตอบให้ครบก่อนตรวจ"}</span></p>
          <button
            className="cs-text-button"
            type="button"
            onClick={() => {
              setAnswers(Array(quiz.length).fill(null));
              setSubmitted(false);
            }}
          >
            เริ่มใหม่
          </button>
        </div>
      </section>

      <section className="cs-sources">
        <div>
          <p className="cs-section-index">แหล่งอ้างอิงหลัก</p>
          <h2>มาตรฐานที่ใช้<br />ตรวจความถูกต้อง</h2>
          <p>แบบจำลองในหน้าเรียนใช้เพื่ออธิบายแนวคิด ไม่แทน Parameter และ Procedure จริงของเครือข่าย</p>
        </div>
        <ul>
          <li><a href="https://www.etsi.org/deliver/etsi_TS/123500_123599/123501/18.11.00_60/ts_123501v181100p.pdf" target="_blank" rel="noreferrer">3GPP TS 23.501 — System Architecture for the 5G System</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/123500_123599/123502/18.10.00_60/ts_123502v181000p.pdf" target="_blank" rel="noreferrer">3GPP TS 23.502 — Procedures for the 5G System</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/133500_133599/133501/18.08.00_60/ts_133501v180800p.pdf" target="_blank" rel="noreferrer">3GPP TS 33.501 — Security Architecture and Procedures for 5GS</a></li>
          <li><a href="https://www.3gpp.org/technologies/slicing-security" target="_blank" rel="noreferrer">3GPP — Network Slicing Security</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_gs/mec/001_099/002/04.01.01_60/gs_mec002v040101p.pdf" target="_blank" rel="noreferrer">ETSI GS MEC 002 — MEC Use Cases and Requirements</a></li>
          <li><a href="https://www.3gpp.org/news-events/3gpp-news/sec-5g" target="_blank" rel="noreferrer">3GPP — 5G Security Overview</a></li>
        </ul>
      </section>

      <footer className="cs-footer">
        <div>
          <p>บทที่ 06 · 5G Core, Slicing & Security</p>
          <h2>ส่ง Packet ให้ถูกทาง<br />และเชื่อถือให้ถูกชั้น</h2>
        </div>
        <div className="cs-footer-links">
          <Link href="/">กลับหน้ารวมบทเรียน ↗</Link>
          <Link href="/mobility">← ทบทวนบทที่ 05</Link>
          <a href="#top">กลับด้านบน ↑</a>
        </div>
      </footer>
    </main>
  );
}
