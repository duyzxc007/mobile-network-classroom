"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

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

  useEffect(() => {
    document.documentElement.dataset.outdoor = String(enabled);
  }, [enabled]);

  function toggle() {
    const next = !enabled;
    document.documentElement.dataset.outdoor = String(next);
    window.localStorage.setItem("mobile-classroom-outdoor", String(next));
    window.dispatchEvent(new Event("mobile-classroom-outdoor-change"));
  }

  return (
    <button
      className="outdoor-mode-toggle"
      type="button"
      aria-pressed={enabled}
      onClick={toggle}
    >
      <span aria-hidden="true">{enabled ? "☀" : "◐"}</span>
      {enabled ? "กลับโหมดปกติ" : "โหมดกลางแจ้ง"}
    </button>
  );
}
