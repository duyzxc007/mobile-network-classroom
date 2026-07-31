"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type PlainTerm = {
  term: string;
  engineering: string;
  plain: string;
};

type TeachingCard = {
  title: string;
  body: string;
};

type TechnicalNote = {
  title: string;
  body: string;
};

export function TechTerm({
  children,
  meaning,
}: {
  children: React.ReactNode;
  meaning: string;
}) {
  return (
    <span className="tech-term" tabIndex={0}>
      <span className="tech-term-label">{children}</span>
      <span className="tech-term-popup" role="tooltip">{meaning}</span>
    </span>
  );
}

const motionLessons: Record<string, { title: string; caption: string; label: string }> = {
  evolution: {
    title: "หนึ่งทรัพยากร แบ่งผู้ใช้ได้หลายวิธี",
    caption: "แบบจำลองนี้เน้นแกนที่แยกผู้ใช้: FDMA แยกความถี่, TDMA แยกเวลา ส่วน CDMA ซ้อนสัญญาณบนเวลา/ความถี่ร่วมกันแล้วใช้การ Correlate Code ที่ตัวรับ ภาพแยกเป็นสามชั้นเพื่อให้อ่านง่ายและไม่แทนกำลังสัญญาณจริง",
    label: "ภาพเคลื่อนไหวเปรียบเทียบ FDMA TDMA และ CDMA",
  },
  rf: {
    title: "บิตถูก Map ไปยังจุดใน Constellation",
    caption: "QPSK หนึ่ง Symbol แทน 2 บิต จุดทั้งสี่อยู่ห่างจากศูนย์กลางเท่ากันและต่างกันที่ Phase ภาพใช้ Gray Mapping ตัวอย่างหนึ่ง โดยป้ายบิตอาจต่างกันได้ตาม Mapping Convention",
    label: "ภาพเคลื่อนไหวการ Map บิตสองบิตไปยังจุด QPSK",
  },
  nr: {
    title: "Scheduler วางข้อมูลบนเวลา × ความถี่",
    caption: "เส้นกวาดเคลื่อนตามเวลา ส่วนแกนตั้งคือ Subcarrier บล็อกสีเป็นภาพรวมเชิงแนวคิดของ Signal/Channel คนละช่วงที่ถูกจัดสรร ไม่ได้หมายความว่า Downlink และ Uplink ใช้ RE เดียวกันหรือเกิดพร้อมกัน รูปจริงขึ้นกับ Duplex/TDD Pattern, Numerology และ Scheduling",
    label: "ภาพเคลื่อนไหว Resource Grid ของ 5G NR",
  },
  signal: {
    title: "สัญญาณแรงคงเดิม แต่ SINR ลดได้",
    caption: "เมื่อกำลัง Interference เพิ่ม ขณะที่ Desired Signal ใกล้เดิม สัดส่วน SINR จะลดลง การเคลื่อนไหวนี้แสดงความสัมพันธ์เชิงแนวคิด ไม่ใช่รูปคลื่นหรือค่าที่วัดจากเครื่องมือจริง",
    label: "ภาพเคลื่อนไหว Desired Signal และ Interference ที่มีผลต่อ SINR",
  },
  mobility: {
    title: "วัดก่อน รายงานก่อน แล้วจึง Handover",
    caption: "นี่คือตัวอย่างหนึ่งเมื่อเครือข่ายตั้ง Event A3: เงื่อนไขต้องเป็นจริงต่อเนื่องครบ Time-to-Trigger ก่อน UE ส่ง Measurement Report จากนั้นเครือข่ายจึงพิจารณา Handover การใช้งานจริงอาจใช้ Event หรือ Procedure อื่นได้",
    label: "ภาพเคลื่อนไหวโทรศัพท์เดินทางจาก Cell A ไป Cell B และเกิด Handover",
  },
  core: {
    title: "Control ตัดสินใจ ส่วน User Plane ขน Packet",
    caption: "เส้นบนแสดง Signalling ผ่าน AMF/SMF เพื่อจัด Session; เส้นล่างแสดง User Data ผ่าน RAN → UPF → Edge/DN โดย AMF และ SMF ไม่ได้เป็นทางผ่านของ Payload",
    label: "ภาพเคลื่อนไหวแยก Control Plane และ User Plane ใน 5G Core",
  },
};

function MotionScene({ lesson }: { lesson: string }) {
  if (lesson === "evolution") {
    return (
      <div className="motion-access-model" aria-hidden="true">
        <div className="motion-access-axis"><span>FREQUENCY ↑</span><span>TIME →</span></div>
        <div className="motion-access-row motion-fdma">
          <b>FDMA</b>
          <div><i className="user-a" /><i className="user-b" /><i className="user-c" /></div>
          <small>คนละย่านความถี่ · ใช้พร้อมกัน</small>
        </div>
        <div className="motion-access-row motion-tdma">
          <b>TDMA</b>
          <div><i className="user-a" /><i className="user-b" /><i className="user-c" /></div>
          <small>ย่านเดียวกัน · ผลัดกันตามเวลา</small>
        </div>
        <div className="motion-access-row motion-cdma">
          <b>CDMA</b>
          <div><i className="user-a">A</i><i className="user-b">B</i><i className="user-c">C</i></div>
          <small>ซ้อนบนเวลา/ความถี่ร่วมกัน · ตัวรับแยกด้วย Code</small>
        </div>
      </div>
    );
  }

  if (lesson === "rf") {
    return (
      <div className="motion-qpsk-model" aria-hidden="true">
        <div className="motion-bit-stream"><span>00</span><span>01</span><span>11</span><span>10</span></div>
        <i className="motion-map-arrow">→</i>
        <div className="motion-constellation">
          <span className="axis-i">I</span><span className="axis-q">Q</span>
          <i className="point-00"><b>00</b></i>
          <i className="point-01"><b>01</b></i>
          <i className="point-11"><b>11</b></i>
          <i className="point-10"><b>10</b></i>
          <em />
        </div>
        <div className="motion-symbol-readout"><small>SYMBOL</small><b>2 bits</b><span>Phase changes</span></div>
      </div>
    );
  }

  if (lesson === "nr") {
    return (
      <div className="motion-grid-model" aria-hidden="true">
        <div className="motion-grid-axis"><span>FREQUENCY / SUBCARRIER ↑</span><span>TIME / SYMBOL →</span></div>
        <div className="motion-resource-grid">
          {Array.from({ length: 60 }, (_, index) => <i key={index} />)}
          <span className="motion-grid-block block-ssb">SSB</span>
          <span className="motion-grid-block block-control">PDCCH</span>
          <span className="motion-grid-block block-data">PDSCH</span>
          <span className="motion-grid-block block-uplink">PUSCH</span>
          <b className="motion-grid-playhead" />
        </div>
        <div className="motion-grid-legend"><span>DL</span><span>CONTROL</span><span>UL</span></div>
      </div>
    );
  }

  if (lesson === "signal") {
    return (
      <div className="motion-sinr-model" aria-hidden="true">
        <div className="motion-signal-source"><i /><b>DESIRED</b><small>กำลังใกล้คงเดิม</small></div>
        <div className="motion-signal-air">
          <i className="desired-wave" />
          <i className="interference-wave wave-one" />
          <i className="interference-wave wave-two" />
          <span>+</span>
        </div>
        <div className="motion-signal-meter">
          <small>SINR</small><b>↓</b><i><span /></i><p>Interference ↑</p>
        </div>
      </div>
    );
  }

  if (lesson === "mobility") {
    return (
      <div className="motion-handover-model" aria-hidden="true">
        <div className="motion-cell cell-a"><i /><b>CELL A</b><small>Serving</small></div>
        <div className="motion-cell cell-b"><i /><b>CELL B</b><small>Neighbor → Target</small></div>
        <div className="motion-ho-beams"><i /><i /></div>
        <div className="motion-ho-phone"><span /><b>UE</b></div>
        <div className="motion-ho-road"><i /><i /><i /><i /><i /><i /></div>
        <div className="motion-ho-events"><span>MEASURE</span><span>A3 + TTT</span><span>REPORT</span><span>HO</span></div>
      </div>
    );
  }

  return (
    <div className="motion-core-model" aria-hidden="true">
      <div className="motion-core-nodes">
        <span className="node-ue"><b>UE</b></span>
        <span className="node-ran"><b>RAN</b></span>
        <span className="node-amf"><b>AMF</b><small>Access</small></span>
        <span className="node-smf"><b>SMF</b><small>Session</small></span>
        <span className="node-upf"><b>UPF</b><small>Forward</small></span>
        <span className="node-edge"><b>EDGE / DN</b></span>
      </div>
      <div className="motion-core-path control-path"><span>CONTROL PLANE</span><i /><i /><i /></div>
      <div className="motion-core-path user-path"><span>USER PLANE</span><i /><i /><i /></div>
      <div className="motion-core-note"><b>AMF / SMF</b><span>ตัดสินใจ</span><i>≠</i><b>UPF</b><span>ขน Payload</span></div>
    </div>
  );
}

function ConceptMotion({ lesson }: { lesson: string }) {
  const [paused, setPaused] = useState(false);
  const copy = motionLessons[lesson] ?? motionLessons.core;

  return (
    <section className={`concept-motion concept-motion-${lesson}${paused ? " concept-motion-paused" : ""}`}>
      <div className="concept-motion-header">
        <div><span>ANIMATED CONCEPT</span><h3>{copy.title}</h3></div>
        <button type="button" aria-pressed={paused} onClick={() => setPaused((current) => !current)}>
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>{paused ? "เล่นภาพ" : "หยุดภาพ"}
        </button>
      </div>
      <div className="concept-motion-stage" role="img" aria-label={copy.label}>
        <MotionScene lesson={lesson} />
      </div>
      <p className="concept-motion-caption"><b>อ่านภาพอย่างไร</b><span>{copy.caption}</span></p>
    </section>
  );
}

export function BeginnerBridge({
  lesson,
  tldr,
  analogy,
  scenario,
  terms,
  technicalNotes = [],
}: {
  lesson: string;
  tldr: string[];
  analogy: TeachingCard;
  scenario: TeachingCard;
  terms: PlainTerm[];
  technicalNotes?: TechnicalNote[];
}) {
  return (
    <section className="beginner-bridge" aria-labelledby={`plain-${lesson}`}>
      <div className="beginner-bridge-heading">
        <p>เริ่มจากภาษาบ้าน ๆ</p>
        <h2 id={`plain-${lesson}`}>เข้าใจภาพนี้ก่อน แล้วค่อยลงศัพท์เทคนิค</h2>
      </div>

      <div className="plain-tldr">
        <span>TL;DR · สรุปใน 3 บรรทัด</span>
        <ol>
          {tldr.map((line, index) => (
            <li key={line}><b>{String(index + 1).padStart(2, "0")}</b><p>{line}</p></li>
          ))}
        </ol>
      </div>

      <ConceptMotion lesson={lesson} />

      <div className="plain-story-grid">
        <article className="plain-analogy">
          <span>เปรียบเทียบให้เห็นภาพ</span>
          <h3>{analogy.title}</h3>
          <p>{analogy.body}</p>
        </article>
        <article className="plain-scenario">
          <span>ทำไมเรื่องนี้สำคัญ?</span>
          <h3>{scenario.title}</h3>
          <p>{scenario.body}</p>
        </article>
      </div>

      {technicalNotes.length > 0 && (
        <div className="plain-technical-notes">
          <p>มุมช่างเทคนิค · จุดที่มักสับสน</p>
          <div>
            {technicalNotes.map((note) => (
              <article key={note.title}>
                <h3>{note.title}</h3>
                <p>{note.body}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="plain-terms">
        <div>
          <p>แปลศัพท์ก่อนเรียน</p>
          <span>ชี้เมาส์ แตะ หรือกด Tab ที่คำศัพท์เพื่อดูคำอธิบายสั้น</span>
        </div>
        <div className="plain-table-wrap">
          <table>
            <thead>
              <tr>
                <th>ศัพท์เทคนิค</th>
                <th>ความหมายทางวิศวกรรม</th>
                <th>ภาษาบ้าน ๆ</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((item) => (
                <tr key={item.term}>
                  <th scope="row">
                    <TechTerm meaning={item.plain}>{item.term}</TechTerm>
                  </th>
                  <td>{item.engineering}</td>
                  <td>{item.plain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function QuizSummary({
  score,
  total,
  onRetry,
  nextHref,
  nextLabel,
}: {
  score: number;
  total: number;
  onRetry: () => void;
  nextHref: string;
  nextLabel: string;
}) {
  const percent = Math.round((score / total) * 100);
  const passed = percent >= 70;

  return (
    <aside className={`quiz-summary-box ${passed ? "passed" : "review"}`} aria-live="polite">
      <div>
        <span>ผลการทบทวน</span>
        <strong>{score} / {total}</strong>
        <b>{percent}%</b>
      </div>
      <div>
        <h3>{passed ? "ผ่านเป้าหมาย 70% แล้ว" : "ทบทวนจุดที่พลาดอีกครั้ง"}</h3>
        <p>
          {passed
            ? "อ่านเฉลยของข้อที่ผิด แล้วไปบทถัดไปได้เลย"
            : "ข้อที่ตอบผิดถูกเน้นสีไว้ด้านล่าง อ่านเหตุผลแล้วลองทำใหม่ได้ทันที"}
        </p>
        <div>
          <button type="button" onClick={onRetry}>ลองทำใหม่</button>
          <Link href={nextHref}>{nextLabel} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </aside>
  );
}

export function ReadingProgress() {
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      indicatorRef.current?.style.setProperty("--reading-progress", String(progress));
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <span ref={indicatorRef} />
    </div>
  );
}

export function OutdoorModeToggle() {
  const enabled = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("mobile-classroom-outdoor-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("mobile-classroom-outdoor-change", onChange);
      };
    },
    () => window.localStorage.getItem("mobile-classroom-outdoor") === "true",
    () => false,
  );

  const largeText = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("mobile-classroom-reading-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("mobile-classroom-reading-change", onChange);
      };
    },
    () => window.localStorage.getItem("mobile-classroom-reading") === "large",
    () => false,
  );

  useEffect(() => {
    document.documentElement.dataset.outdoor = String(enabled);
    document.documentElement.dataset.reading = largeText ? "large" : "comfortable";
  }, [enabled, largeText]);

  function toggle() {
    const next = !enabled;
    document.documentElement.dataset.outdoor = String(next);
    window.localStorage.setItem("mobile-classroom-outdoor", String(next));
    window.dispatchEvent(new Event("mobile-classroom-outdoor-change"));
  }

  function toggleReadingSize() {
    const next = largeText ? "comfortable" : "large";
    document.documentElement.dataset.reading = next;
    window.localStorage.setItem("mobile-classroom-reading", next);
    window.dispatchEvent(new Event("mobile-classroom-reading-change"));
  }

  return (
    <div className="display-tools" role="group" aria-label="เครื่องมือช่วยอ่าน">
      <button
        className="reading-size-toggle"
        type="button"
        aria-pressed={largeText}
        aria-label={largeText ? "กลับไปใช้ขนาดตัวอักษรปกติ" : "เพิ่มขนาดตัวอักษร"}
        title={largeText ? "ขนาดตัวอักษรปกติ" : "ตัวอักษรใหญ่"}
        onClick={toggleReadingSize}
      >
        <span className="display-tools-icon" aria-hidden="true">A</span>
        <span className="display-tools-label">{largeText ? "ขนาดปกติ" : "ตัวอักษรใหญ่"}</span>
      </button>
      <button
        className="outdoor-mode-toggle"
        type="button"
        aria-pressed={enabled}
        aria-label={enabled ? "กลับไปใช้โหมดการแสดงผลปกติ" : "เปิดโหมดกลางแจ้ง"}
        title={enabled ? "กลับโหมดปกติ" : "โหมดกลางแจ้ง"}
        onClick={toggle}
      >
        <span className="display-tools-icon" aria-hidden="true">{enabled ? "☀" : "◐"}</span>
        <span className="display-tools-label">{enabled ? "กลับโหมดปกติ" : "โหมดกลางแจ้ง"}</span>
      </button>
    </div>
  );
}
