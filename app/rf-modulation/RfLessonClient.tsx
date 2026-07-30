"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Domain = "time" | "frequency";
type Modulation = "ASK" | "FSK" | "PSK";
type Constellation = "BPSK" | "QPSK" | "16-QAM" | "64-QAM";
type AccessMode = "OFDM" | "OFDMA" | "SC-FDMA";

const modulationNotes: Record<
  Modulation,
  { change: string; simple: string; strength: string; caution: string }
> = {
  ASK: {
    change: "Amplitude",
    simple: "บิต 1 ส่งคลื่นแรงกว่า ส่วนบิต 0 ส่งคลื่นเบาหรือไม่ส่ง",
    strength: "วงจรไม่ซับซ้อน เหมาะกับงานควบคุมและสื่อสารระยะใกล้บางชนิด",
    caution: "ไวต่อ Noise และการเปลี่ยนแปลงกำลังสัญญาณ",
  },
  FSK: {
    change: "Frequency",
    simple: "ใช้ความถี่หนึ่งแทนบิต 0 และอีกความถี่แทนบิต 1",
    strength: "ทนต่อการเปลี่ยนแปลงของ Amplitude ได้ดี",
    caution: "มักใช้ Bandwidth มากขึ้นเมื่อแยกความถี่ให้ชัด",
  },
  PSK: {
    change: "Phase",
    simple: "คงขนาดคลื่นไว้ แต่เปลี่ยนมุมเฟสเพื่อแทนข้อมูล",
    strength: "ใช้กำลังและแถบความถี่ได้มีประสิทธิภาพ",
    caution: "ตัวรับต้องประมาณเฟสให้แม่น",
  },
};

const constellations: Record<
  Constellation,
  { bits: number; points: number; note: string }
> = {
  BPSK: {
    bits: 1,
    points: 2,
    note: "จุดห่างกันมาก อ่านง่ายและทน Noise แต่ส่งข้อมูลต่อ Symbol ได้น้อย",
  },
  QPSK: {
    bits: 2,
    points: 4,
    note: "ใช้ 4 มุมเฟส แต่ละ Symbol แทน 2 บิต เป็นสมดุลที่ใช้แพร่หลาย",
  },
  "16-QAM": {
    bits: 4,
    points: 16,
    note: "ผสมทั้ง Amplitude และ Phase ส่ง 4 บิตต่อ Symbol แต่ต้องการสัญญาณสะอาดขึ้น",
  },
  "64-QAM": {
    bits: 6,
    points: 64,
    note: "ส่ง 6 บิตต่อ Symbol จุดอยู่ชิดกัน จึงต้องการ SNR และความเป็นเชิงเส้นที่สูงกว่า",
  },
};

const quiz = [
  {
    question: "เครื่องมือใดเหมาะกับการดูว่าพลังงานกระจายอยู่ที่ความถี่ใดบ้าง?",
    choices: ["Oscilloscope", "Spectrum Analyzer", "Power Supply"],
    answer: 1,
    explain: "Spectrum Analyzer แสดงระดับสัญญาณเทียบกับความถี่ ส่วน Oscilloscope แสดงแรงดันเทียบกับเวลา",
  },
  {
    question: "QPSK หนึ่ง Symbol แทนข้อมูลได้กี่บิต?",
    choices: ["1 บิต", "2 บิต", "4 บิต"],
    answer: 1,
    explain: "QPSK มี 4 สถานะ และ log₂(4) = 2 จึงแทนข้อมูลได้ 2 บิตต่อ Symbol",
  },
  {
    question: "ข้อใดอธิบาย FDD ได้ถูกต้อง?",
    choices: [
      "Uplink และ Downlink ใช้คนละย่านความถี่",
      "Uplink และ Downlink ใช้ความถี่เดียวกันและผลัดกันตามเวลา",
      "ผู้ใช้ทุกคนใช้รหัสเดียวกัน",
    ],
    answer: 0,
    explain: "FDD แยกคู่ความถี่สำหรับ Uplink และ Downlink จึงรับส่งพร้อมกันได้",
  },
  {
    question: "อะไรทำให้ OFDMA ต่างจาก OFDM ในมุมการใช้งานเครือข่าย?",
    choices: [
      "OFDMA ไม่มี Subcarrier",
      "OFDMA จัดสรรกลุ่ม Subcarrier และช่วงเวลาให้ผู้ใช้หลายราย",
      "OFDM ใช้ได้เฉพาะเสียง",
    ],
    answer: 1,
    explain: "OFDMA นำแนวคิด OFDM มาจัดสรร Resource Element หรือกลุ่ม Subcarrier ให้หลายผู้ใช้ตามเวลา",
  },
  {
    question: "เหตุใด LTE Uplink จึงเลือก SC-FDMA?",
    choices: [
      "เพื่อให้ PAPR ต่ำกว่าและช่วยประหยัดภาคขยายกำลังของมือถือ",
      "เพื่อเพิ่มจำนวนเสาอากาศเท่านั้น",
      "เพราะไม่ต้องใช้ FFT",
    ],
    answer: 0,
    explain: "DFT spreading ช่วยให้สัญญาณมีลักษณะใกล้ Single Carrier และมี PAPR ต่ำกว่า OFDMA",
  },
  {
    question: "DSS ทำหน้าที่ใด?",
    choices: [
      "รวม LTE และ NR ให้ใช้ Carrier เดียวกันโดยจัดทรัพยากรแบบยืดหยุ่น",
      "แปลง TDD เป็น FDD ถาวร",
      "เพิ่มจำนวนจุดใน Constellation",
    ],
    answer: 0,
    explain: "Dynamic Spectrum Sharing ช่วยให้ LTE และ 5G NR ใช้คลื่น Carrier เดียวกันระหว่างการเปลี่ยนผ่านเครือข่าย",
  },
];

function constellationPoints(mode: Constellation) {
  if (mode === "BPSK") return [[25, 50], [75, 50]];
  if (mode === "QPSK") return [[28, 28], [72, 28], [28, 72], [72, 72]];

  const axis = mode === "16-QAM"
    ? [20, 40, 60, 80]
    : [13, 24, 35, 46, 57, 68, 79, 90];

  return axis.flatMap((x) => axis.map((y) => [x, y]));
}

function ResourceGrid({ mode }: { mode: AccessMode }) {
  const cells = Array.from({ length: 48 }, (_, index) => {
    const row = Math.floor(index / 8);
    const column = index % 8;
    let owner = "user-a";

    if (mode === "OFDMA") {
      owner = row < 2 && column < 4
        ? "user-a"
        : row >= 2 && row < 4 && column >= 3
          ? "user-b"
          : row >= 4 && column < 6
            ? "user-c"
            : "idle";
    }

    if (mode === "SC-FDMA") {
      owner = row < 2 ? "user-a" : row < 4 ? "user-b" : "user-c";
    }

    return <i key={index} className={owner} />;
  });

  return (
    <div className={`rf-resource-grid ${mode.toLowerCase()}`} aria-hidden="true">
      {cells}
    </div>
  );
}

export default function RfLessonClient() {
  const [domain, setDomain] = useState<Domain>("time");
  const [modulation, setModulation] = useState<Modulation>("PSK");
  const [constellation, setConstellation] = useState<Constellation>("QPSK");
  const [accessMode, setAccessMode] = useState<AccessMode>("OFDMA");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () => quiz.reduce(
      (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
      0,
    ),
    [answers],
  );

  const selectedModulation = modulationNotes[modulation];
  const selectedConstellation = constellations[constellation];
  const points = constellationPoints(constellation);

  return (
    <main className="rf-page">
      <header className="rf-header">
        <Link className="rf-brand" href="/">
          <span aria-hidden="true">RF</span>
          <span>
            <strong>Mobile Network Classroom</strong>
            <small>บทเรียนที่ 02</small>
          </span>
        </Link>
        <nav aria-label="หัวข้อในบทเรียน RF">
          <a href="#domain">มองสัญญาณ</a>
          <a href="#modulation">Modulation</a>
          <a href="#resources">แบ่งคลื่น</a>
          <a href="#rf-quiz">แบบทดสอบ</a>
        </nav>
      </header>

      <section className="rf-hero" id="rf-top">
        <div className="rf-hero-copy">
          <p className="rf-kicker">พื้นฐาน RF และ Digital Modulation</p>
          <h1>อ่านคลื่นให้เป็น<br />ก่อนเข้าใจเครือข่าย</h1>
          <p>
            เริ่มจากสัญญาณในมุมเวลาและความถี่ แล้วดูว่าข้อมูลดิจิทัล
            ถูกวางลงบนคลื่นพาห์อย่างไร ก่อนเชื่อมไปถึงวิธีแบ่งทรัพยากรของ LTE และ 5G
          </p>
          <div className="rf-hero-actions">
            <a className="rf-primary" href="#domain">เริ่มจากรูปคลื่น ↓</a>
            <span>ใช้เวลาประมาณ 25 นาที</span>
          </div>
        </div>

        <div className="rf-hero-lab" aria-label="ภาพสรุปจากสัญญาณสู่ Constellation">
          <div className="rf-scope">
            <span className="rf-scope-label">TIME</span>
            <div className="rf-wave" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
            </div>
          </div>
          <span className="rf-process-arrow" aria-hidden="true">→</span>
          <div className="rf-mini-constellation" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <p><b>Signal</b><span>→ Carrier → Symbol → Resource</span></p>
        </div>
      </section>

      <section className="rf-outcomes" aria-labelledby="rf-outcome-title">
        <p className="rf-section-index">แผนที่การเรียนรู้</p>
        <div>
          <h2 id="rf-outcome-title">จบบทนี้ คุณจะเชื่อมโยงได้ 5 ชั้น</h2>
          <ol>
            <li><b>01</b><span>Time และ Frequency Domain</span></li>
            <li><b>02</b><span>Carrier กับ ASK / FSK / PSK</span></li>
            <li><b>03</b><span>QPSK, QAM และ Constellation</span></li>
            <li><b>04</b><span>FDD / TDD และ TDM / FDM</span></li>
            <li><b>05</b><span>OFDM, OFDMA, SC-FDMA และ DSS</span></li>
          </ol>
        </div>
      </section>

      <section className="rf-section" id="domain">
        <div className="rf-heading">
          <p className="rf-section-index">01 / มองสัญญาณสองมุม</p>
          <h2>สัญญาณเดียวกัน แต่อ่านคนละแกน</h2>
          <p>
            Time Domain เหมาะกับการดูรูปคลื่นและจังหวะ ส่วน Frequency Domain
            ช่วยบอกว่าสัญญาณประกอบด้วยความถี่ใดและกิน Bandwidth เท่าไร
          </p>
        </div>

        <div className="rf-domain-lab">
          <div className="rf-toggle" role="tablist" aria-label="เลือกมุมมองสัญญาณ">
            <button type="button" role="tab" aria-selected={domain === "time"} onClick={() => setDomain("time")}>
              Time Domain
            </button>
            <button type="button" role="tab" aria-selected={domain === "frequency"} onClick={() => setDomain("frequency")}>
              Frequency Domain
            </button>
          </div>

          <div className="rf-domain-panel" role="tabpanel">
            <div className={`rf-domain-chart ${domain}`}>
              <span className="rf-y-label">{domain === "time" ? "Amplitude" : "Power"}</span>
              <div className="rf-chart-content" aria-hidden="true">
                {domain === "time"
                  ? Array.from({ length: 26 }, (_, index) => <i key={index} />)
                  : [22, 42, 92, 50, 30, 68, 26].map((height, index) => (
                    <i key={index} style={{ height: `${height}%` }} />
                  ))}
              </div>
              <span className="rf-x-label">{domain === "time" ? "เวลา →" : "ความถี่ →"}</span>
            </div>
            <div className="rf-domain-copy">
              <p className="rf-tech-label">{domain === "time" ? "OSCILLOSCOPE VIEW" : "SPECTRUM VIEW"}</p>
              <h3>{domain === "time" ? "เกิดอะไรขึ้น เมื่อเวลาเดินไป" : "พลังงานอยู่ตรงความถี่ใดบ้าง"}</h3>
              <p>
                {domain === "time"
                  ? "อ่านคาบ ความถี่จากระยะห่างของรอบ รูปร่าง Pulse และเหตุการณ์ชั่วขณะได้ชัด"
                  : "อ่าน Carrier, Harmonic, Interference และ Occupied Bandwidth ได้โดยไม่ต้องไล่ดูรูปคลื่นทีละรอบ"}
              </p>
              <div className="rf-formula">
                <code>s(t) = A cos(2πf<sub>c</sub>t + φ)</code>
                <span>A = ขนาด, f<sub>c</sub> = ความถี่พาห์, φ = เฟส</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="rf-callout">
          <strong>FFT คือสะพาน</strong>
          <p>
            Fast Fourier Transform แปลงชุดตัวอย่างตามเวลาให้เป็นองค์ประกอบตามความถี่
            ไม่ได้สร้างสัญญาณใหม่ แต่เปลี่ยนวิธีมองข้อมูลชุดเดิม
          </p>
        </aside>
      </section>

      <section className="rf-section rf-modulation-section" id="modulation">
        <div className="rf-heading">
          <p className="rf-section-index">02 / วางข้อมูลบนคลื่นพาห์</p>
          <h2>Carrier คือรถ ข้อมูลคือสิ่งที่บรรทุก</h2>
          <p>
            ข้อมูล Baseband ที่เปลี่ยนช้าไม่เหมาะกับการแผ่ผ่านเสาอากาศโดยตรง
            การ Modulate จึงเปลี่ยนคุณสมบัติบางอย่างของคลื่นความถี่สูงตามข้อมูล
          </p>
        </div>

        <div className="rf-modulation-lab">
          <div className="rf-bits" aria-label="ตัวอย่างลำดับบิต">
            <span>1</span><span>0</span><span>1</span><span>1</span><span>0</span><span>1</span>
          </div>
          <div className={`rf-modulated-wave ${modulation.toLowerCase()}`} aria-hidden="true">
            {Array.from({ length: 36 }, (_, index) => <i key={index} />)}
          </div>
          <div className="rf-mode-selector" role="tablist" aria-label="เลือก Digital Modulation">
            {(["ASK", "FSK", "PSK"] as Modulation[]).map((mode) => (
              <button
                type="button"
                role="tab"
                aria-selected={modulation === mode}
                key={mode}
                onClick={() => setModulation(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          <article className="rf-mode-note">
            <div>
              <p className="rf-tech-label">เปลี่ยน {selectedModulation.change}</p>
              <h3>{modulation}</h3>
            </div>
            <p>{selectedModulation.simple}</p>
            <dl>
              <div><dt>จุดเด่น</dt><dd>{selectedModulation.strength}</dd></div>
              <div><dt>ข้อควรระวัง</dt><dd>{selectedModulation.caution}</dd></div>
            </dl>
          </article>
        </div>
      </section>

      <section className="rf-section rf-constellation-section">
        <div className="rf-heading">
          <p className="rf-section-index">03 / Symbol และ Constellation</p>
          <h2>หนึ่งจุด แทนข้อมูลได้หลายบิต</h2>
          <p>
            แกนนอน I และแกนตั้ง Q เป็นองค์ประกอบคลื่นที่ต่างเฟสกัน 90 องศา
            ตำแหน่งจุดแต่ละจุดจึงบอกทั้ง Amplitude และ Phase ของ Symbol
          </p>
        </div>

        <div className="rf-constellation-lab">
          <div className="rf-constellation-stage">
            <span className="rf-axis-y">Q</span>
            <span className="rf-axis-x">I</span>
            {points.map(([x, y], index) => (
              <i
                key={`${constellation}-${index}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ))}
          </div>
          <div className="rf-constellation-copy">
            <div className="rf-mode-selector" role="tablist" aria-label="เลือก Constellation">
              {(Object.keys(constellations) as Constellation[]).map((mode) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={constellation === mode}
                  key={mode}
                  onClick={() => setConstellation(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="rf-tech-label">MODULATION ORDER</p>
            <div className="rf-big-metric">
              <strong>{selectedConstellation.points}</strong>
              <span>จุด<br />{selectedConstellation.bits} บิตต่อ Symbol</span>
            </div>
            <p>{selectedConstellation.note}</p>
            <p className="rf-equation">
              จำนวนบิตต่อ Symbol = log<sub>2</sub>(จำนวนจุด)
            </p>
          </div>
        </div>

        <div className="rf-noise-story">
          <div>
            <span className="rf-clean-point" aria-hidden="true" />
            <b>สัญญาณสะอาด</b>
            <p>จุดที่วัดได้เกาะใกล้ตำแหน่งอ้างอิง</p>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span className="rf-noisy-point" aria-hidden="true" />
            <b>มี Noise หรือ Distortion</b>
            <p>จุดกระจายกว้างขึ้น EVM สูง และตัดสิน Symbol ผิดง่าย</p>
          </div>
        </div>
      </section>

      <section className="rf-section" id="resources">
        <div className="rf-heading">
          <p className="rf-section-index">04 / แบ่งทิศทางและแบ่งผู้ใช้</p>
          <h2>Duplexing กับ Multiplexing ไม่ใช่เรื่องเดียวกัน</h2>
          <p>
            Duplexing แยกทาง Uplink และ Downlink ส่วน Multiplexing
            จัดให้หลายสัญญาณหรือหลายผู้ใช้แบ่งทรัพยากรร่วมกัน
          </p>
        </div>

        <div className="rf-duplex-compare">
          <article>
            <p className="rf-tech-label">FREQUENCY DIVISION DUPLEX</p>
            <h3>FDD แยกด้วยความถี่</h3>
            <div className="rf-duplex-diagram fdd" aria-hidden="true">
              <span>DL</span><span>ช่องว่าง</span><span>UL</span>
            </div>
            <p>
              Uplink และ Downlink อยู่คนละย่านความถี่ จึงรับส่งได้พร้อมกัน
              แต่ต้องมีคลื่นแบบจับคู่และมี Duplexer แยกทางในอุปกรณ์
            </p>
          </article>
          <article>
            <p className="rf-tech-label">TIME DIVISION DUPLEX</p>
            <h3>TDD แยกด้วยเวลา</h3>
            <div className="rf-duplex-diagram tdd" aria-hidden="true">
              <span>DL</span><span>DL</span><span>GP</span><span>UL</span><span>UL</span>
            </div>
            <p>
              ใช้ Carrier เดียวแล้วสลับทิศตามช่วงเวลา ปรับสัดส่วน DL/UL ได้
              แต่เครือข่ายข้างเคียงต้อง Synchronize เพื่อลดการรบกวน
            </p>
          </article>
        </div>

        <div className="rf-multiplex-row">
          <article>
            <span>TDM</span>
            <div className="rf-tdm-strip" aria-hidden="true"><i>A</i><i>B</i><i>C</i><i>A</i><i>B</i></div>
            <p>หลายสัญญาณผลัดกันใช้ช่องเดียวตามช่วงเวลา</p>
          </article>
          <article>
            <span>FDM</span>
            <div className="rf-fdm-strip" aria-hidden="true"><i>A</i><i>B</i><i>C</i></div>
            <p>หลายสัญญาณอยู่พร้อมกัน แต่แยกกันคนละช่วงความถี่</p>
          </article>
        </div>
      </section>

      <section className="rf-section rf-ofdm-section">
        <div className="rf-heading">
          <p className="rf-section-index">05 / จาก OFDM สู่การเข้าถึงหลายผู้ใช้</p>
          <h2>Subcarrier ซ้อนกันได้ เพราะตั้งฉากกัน</h2>
          <p>
            OFDM แบ่งช่องกว้างเป็น Subcarrier แคบจำนวนมากที่ Orthogonal กัน
            จุดศูนย์ของสัญญาณหนึ่งตรงกับยอดของอีกสัญญาณ จึงใช้สเปกตรัมได้แน่น
          </p>
        </div>

        <div className="rf-orthogonal-demo" aria-label="ภาพแนวคิด Subcarrier แบบ Orthogonal">
          {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
          <span>ความถี่ →</span>
        </div>

        <div className="rf-access-lab">
          <div>
            <div className="rf-mode-selector" role="tablist" aria-label="เลือกวิธีใช้ทรัพยากร">
              {(["OFDM", "OFDMA", "SC-FDMA"] as AccessMode[]).map((mode) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={accessMode === mode}
                  key={mode}
                  onClick={() => setAccessMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
            <ResourceGrid mode={accessMode} />
            <div className="rf-grid-legend">
              <span><i className="user-a" /> ผู้ใช้ A</span>
              <span><i className="user-b" /> ผู้ใช้ B</span>
              <span><i className="user-c" /> ผู้ใช้ C</span>
            </div>
          </div>
          <article>
            <p className="rf-tech-label">TIME × FREQUENCY RESOURCE GRID</p>
            <h3>
              {accessMode === "OFDM" && "OFDM สร้างสัญญาณจากหลาย Subcarrier"}
              {accessMode === "OFDMA" && "OFDMA ให้ Scheduler แบ่งช่องแก่หลายผู้ใช้"}
              {accessMode === "SC-FDMA" && "SC-FDMA กระจาย Symbol ก่อนเข้า OFDM"}
            </h3>
            <p>
              {accessMode === "OFDM" && "หนึ่งการส่งใช้ Subcarrier จำนวนมากพร้อมกัน แต่คำว่า OFDM อย่างเดียวไม่ได้บอกวิธีแบ่งให้ผู้ใช้หลายราย"}
              {accessMode === "OFDMA" && "สถานีฐานจัดกลุ่ม Subcarrier และช่วงเวลาให้ผู้ใช้ตามคุณภาพช่องสัญญาณและปริมาณข้อมูล ใช้ใน LTE Downlink"}
              {accessMode === "SC-FDMA" && "เพิ่ม DFT spreading ทำให้รูปคลื่นใกล้ Single Carrier และลด PAPR จึงเหมาะกับ LTE Uplink ที่พลังงานแบตเตอรี่มีจำกัด"}
            </p>
          </article>
        </div>

        <div className="rf-cp-note">
          <b>Cyclic Prefix</b>
          <p>
            สำเนาส่วนท้ายของ Symbol ที่เติมไว้ด้านหน้า ช่วยให้ระบบทน Multipath
            และลด Inter-Symbol Interference แต่กินเวลาและพลังงานเป็น Overhead
          </p>
        </div>
      </section>

      <section className="rf-section rf-dss-section">
        <div className="rf-heading">
          <p className="rf-section-index">06 / ใช้คลื่นเดิมระหว่างเปลี่ยนผ่าน</p>
          <h2>Dynamic Spectrum Sharing ให้ LTE และ NR อยู่บน Carrier เดียวกัน</h2>
          <p>
            DSS จัด Resource ระหว่าง 4G และ 5G ตามความต้องการที่เปลี่ยนไป
            ผู้ให้บริการจึงเริ่ม 5G บนย่านเดิมได้โดยไม่ต้องย้ายคลื่นทั้งหมดในวันเดียว
          </p>
        </div>

        <div className="rf-dss-board">
          <div className="rf-dss-labels"><span>เวลา →</span><span>ความถี่ ↑</span></div>
          <div className="rf-dss-grid" aria-hidden="true">
            {Array.from({ length: 35 }, (_, index) => (
              <i
                key={index}
                className={(index % 7 === 2 || index % 11 === 0) ? "nr" : "lte"}
              />
            ))}
          </div>
          <div className="rf-dss-legend">
            <span><i className="lte" /> LTE</span>
            <span><i className="nr" /> 5G NR</span>
          </div>
        </div>

        <div className="rf-dss-facts">
          <p><b>ข้อดี</b><span>เปลี่ยนผ่านสู่ 5G ได้เร็ว ใช้ Spectrum เดิมได้ต่อเนื่อง</span></p>
          <p><b>ข้อจำกัด</b><span>ต้องหลบ Reference Signal และช่องควบคุมของ LTE จึงมี Overhead และข้อจำกัดในการจัดตาราง</span></p>
          <p><b>อย่าสับสน</b><span>DSS แบ่งคลื่นระหว่างเทคโนโลยี ไม่ใช่ TDD และไม่ใช่ Carrier Aggregation</span></p>
        </div>
      </section>

      <section className="rf-section rf-map-section">
        <div className="rf-heading">
          <p className="rf-section-index">07 / สรุปภาพใหญ่</p>
          <h2>วางศัพท์ทุกคำให้ถูกชั้น</h2>
        </div>
        <div className="rf-concept-map">
          <div><span>มองสัญญาณ</span><b>Time / Frequency Domain</b><p>อธิบายสัญญาณด้วยคนละแกน</p></div>
          <div><span>บรรทุกข้อมูล</span><b>ASK / FSK / PSK / QAM</b><p>เปลี่ยนคุณสมบัติของ Carrier</p></div>
          <div><span>แยกทิศทาง</span><b>FDD / TDD</b><p>แยก Uplink และ Downlink</p></div>
          <div><span>รวมหลายสัญญาณ</span><b>TDM / FDM / OFDM</b><p>แบ่งแกนเวลาและความถี่</p></div>
          <div><span>แบ่งให้หลายผู้ใช้</span><b>OFDMA / SC-FDMA</b><p>นำทรัพยากรไปจัดสรรใช้งาน</p></div>
          <div><span>แบ่งระหว่างระบบ</span><b>DSS</b><p>ให้ LTE และ NR ใช้ Carrier ร่วมกัน</p></div>
        </div>
      </section>

      <section className="rf-section rf-quiz-section" id="rf-quiz">
        <div className="rf-heading">
          <p className="rf-section-index">08 / ตรวจความเข้าใจ</p>
          <h2>แบบทดสอบท้ายบท</h2>
          <p>เลือกให้ครบทั้ง 6 ข้อ แล้วตรวจคำตอบพร้อมคำอธิบายได้ทันที</p>
        </div>

        <div className="rf-quiz-list">
          {quiz.map((item, index) => {
            const isCorrect = answers[index] === item.answer;
            return (
              <fieldset
                key={item.question}
                className={submitted ? (isCorrect ? "correct" : "incorrect") : ""}
              >
                <legend><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</legend>
                <div>
                  {item.choices.map((choice, choiceIndex) => (
                    <label key={choice}>
                      <input
                        type="radio"
                        name={`rf-question-${index}`}
                        checked={answers[index] === choiceIndex}
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
                  <p className="rf-feedback" role="status">
                    <b>{isCorrect ? "ถูกต้อง" : "ทบทวนอีกนิด"}</b>{item.explain}
                  </p>
                )}
              </fieldset>
            );
          })}
        </div>

        <div className="rf-quiz-actions">
          <button
            className="rf-primary"
            type="button"
            disabled={Object.keys(answers).length !== quiz.length}
            onClick={() => setSubmitted(true)}
          >
            ตรวจคำตอบ
          </button>
          {submitted && (
            <>
              <p aria-live="polite">ได้ <b>{score}/{quiz.length}</b> คะแนน</p>
              <button
                className="rf-reset"
                type="button"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                ทำแบบทดสอบใหม่
              </button>
            </>
          )}
        </div>
      </section>

      <section className="rf-sources">
        <div>
          <p className="rf-section-index">แหล่งอ้างอิงหลัก</p>
          <h2>อ่านต่อจากเอกสารมาตรฐานและผู้ผลิตเครื่องมือวัด</h2>
        </div>
        <ul>
          <li><a href="https://helpfiles.keysight.com/csg/89600B/Webhelp/Subsystems/concepts/content/concepts_time_and_freq_domain.htm" target="_blank" rel="noreferrer">Keysight: Time and Frequency Domain</a></li>
          <li><a href="https://www.keysight.com/us/en/assets/7018-06742/application-notes/5954-9130.pdf" target="_blank" rel="noreferrer">Keysight: Digital Modulation Basics</a></li>
          <li><a href="https://helpfiles.keysight.com/csg/89600B/Webhelp/Subsystems/wlan-ofdm/content/ofdm_basicprinciplesoverview.htm" target="_blank" rel="noreferrer">Keysight: OFDM Basic Principles</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_tr/102900_102999/102962/01.01.01_60/tr_102962v010101p.pdf" target="_blank" rel="noreferrer">ETSI: LTE Overview</a></li>
          <li><a href="https://www.3gpp.org/technologies/nr-dynamic-spectrum-sharing-in-rel-17" target="_blank" rel="noreferrer">3GPP: NR Dynamic Spectrum Sharing</a></li>
        </ul>
      </section>

      <footer className="rf-footer">
        <div>
          <p>จบบทเรียนที่ 02</p>
          <h2>ตอนนี้คุณอ่านคลื่น และเห็นวิธีแบ่งทรัพยากรแล้ว</h2>
        </div>
        <div>
          <Link href="/">← กลับบทเรียน 1G ถึง 5G</Link>
          <a href="#rf-top">ทบทวนด้านบน ↑</a>
        </div>
      </footer>
    </main>
  );
}
