"use client";

import React, { useState } from "react";

type BandOption = {
  id: "700" | "2600" | "26000";
  title: string;
  badge: string;
  capacity: string;
  capacityWithMimo: string;
  coverage: string;
  penetration: string;
  penetrationLevel: number;
  waveColor: string;
  waveCount: number;
  useCase: string;
};

const BANDS: Record<string, BandOption> = {
  "700": {
    id: "700",
    title: "คลื่นความถี่ต่ำ (700 MHz) · ย่านครอบคลุมหลัก",
    badge: "ครอบคลุมกว้าง · ความยาวคลื่นมากกว่า",
    capacity: "ต่ำถึงปานกลาง",
    capacityWithMimo: "ปานกลาง",
    coverage: "กว้าง",
    penetration: "ดีกว่าย่านความถี่สูงโดยทั่วไป",
    penetrationLevel: 3,
    waveColor: "var(--good)",
    waveCount: 6,
    useCase: "เหมาะกับการวางชั้น Coverage ในพื้นที่กว้างและช่วยการรับสัญญาณภายในอาคาร",
  },
  "2600": {
    id: "2600",
    title: "คลื่นความถี่กลาง (2600 MHz / C-Band) · ย่านสมดุล",
    badge: "สมดุล Coverage และ Capacity",
    capacity: "ปานกลางถึงสูง",
    capacityWithMimo: "สูง",
    coverage: "ปานกลาง",
    penetration: "ปานกลางและขึ้นกับสิ่งกีดขวาง",
    penetrationLevel: 2,
    waveColor: "var(--hub-blue)",
    waveCount: 14,
    useCase: "เหมาะกับเมืองและพื้นที่ใช้งานหนาแน่น ซึ่งต้องรักษาสมดุลระหว่างระยะครอบคลุมกับความจุ",
  },
  "26000": {
    id: "26000",
    title: "คลื่นความถี่สูง (26 GHz mmWave) · ย่านความเร็วสูงสุด",
    badge: "Capacity สูง · ครอบคลุมเฉพาะจุด",
    capacity: "สูงมากเมื่อมี Bandwidth เพียงพอ",
    capacityWithMimo: "สูงมากและเน้นลำคลื่น",
    coverage: "เฉพาะจุด",
    penetration: "ต่ำและไวต่อการบดบัง",
    penetrationLevel: 1,
    waveColor: "var(--accent-strong)",
    waveCount: 28,
    useCase: "เหมาะกับ Hotspot เฉพาะจุดที่มีแนวสายตาหรือการวางเสาแน่น เช่น สนามกีฬาและพื้นที่กิจกรรม",
  },
};

export function SpectrumSandbox() {
  const [selectedBand, setSelectedBand] = useState<"700" | "2600" | "26000">("2600");
  const [mimoActive, setMimoActive] = useState<boolean>(true);

  const band = BANDS[selectedBand];
  const displayCapacity = mimoActive ? band.capacityWithMimo : band.capacity;

  return (
    <div className="spectrum-sandbox-container">
      <div className="spectrum-sandbox-header">
        <div className="spectrum-badge">
          <span className="live-dot" />
          <span>Interactive spectrum comparison</span>
        </div>
        <h2 className="spectrum-title">
          เปรียบเทียบย่านความถี่ 5G แบบเห็นภาพ
        </h2>
        <p className="spectrum-subtitle">
          เลือกย่านความถี่และเปิดมุมมอง MIMO เพื่อดูแนวโน้มด้านความจุ
          ระยะครอบคลุม และความสามารถผ่านสิ่งกีดขวาง ภาพนี้ใช้เปรียบเทียบเชิงแนวคิด
          ไม่ใช่ผลวัดหรือค่ารับประกันจากเครือข่าย
        </p>
      </div>

      <div className="spectrum-controls">
        <div className="band-selector-group" role="group" aria-label="เลือกความถี่คลื่น 5G">
          <button
            type="button"
            className={`band-btn ${selectedBand === "700" ? "active" : ""}`}
            aria-pressed={selectedBand === "700"}
            onClick={() => setSelectedBand("700")}
          >
            <span className="band-freq">700 MHz</span>
            <span className="band-desc">Low-Band · ครอบคลุมไกล</span>
          </button>
          <button
            type="button"
            className={`band-btn ${selectedBand === "2600" ? "active" : ""}`}
            aria-pressed={selectedBand === "2600"}
            onClick={() => setSelectedBand("2600")}
          >
            <span className="band-freq">2600 MHz</span>
            <span className="band-desc">Mid-Band · ความเร็วสมดุล</span>
          </button>
          <button
            type="button"
            className={`band-btn ${selectedBand === "26000" ? "active" : ""}`}
            aria-pressed={selectedBand === "26000"}
            onClick={() => setSelectedBand("26000")}
          >
            <span className="band-freq">26 GHz (mmWave)</span>
            <span className="band-desc">High-Band · เร็วระดับ Gbps</span>
          </button>
        </div>

        <div className="mimo-toggle-wrapper">
          <label className="mimo-toggle-label" htmlFor="mimo-toggle">
            <input
              id="mimo-toggle"
              type="checkbox"
              checked={mimoActive}
              onChange={(e) => setMimoActive(e.target.checked)}
            />
            <span className="mimo-slider" />
            <span className="mimo-text">
              <strong>มุมมอง MIMO & Beamforming</strong>
              <small>{mimoActive ? "แสดงผลของหลายเสาอากาศเชิงแนวคิด" : "ซ่อนผลของหลายเสาอากาศ"}</small>
            </span>
          </label>
        </div>
      </div>

      <div className="spectrum-display-grid">
        <div className="spectrum-visual-card">
          <div className="wave-monitor-header">
            <span className="wave-label">{band.title}</span>
            <span className="wave-tag">{band.badge}</span>
          </div>

          <div className="wave-animation-canvas" aria-hidden="true">
            <div
              className={`wave-lines count-${selectedBand} ${mimoActive ? "mimo-boosted" : ""}`}
              style={{ "--wave-color": band.waveColor } as React.CSSProperties}
            >
              {Array.from({ length: band.waveCount }, (_, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${i * 65}ms` }} />
              ))}
            </div>
            {mimoActive && (
              <div className="mimo-beam-overlay">
                <span className="beam-ray ray-1" />
                <span className="beam-ray ray-2" />
                <span className="beam-ray ray-3" />
              </div>
            )}
          </div>

          <div className="wave-usecase-note">
            <strong>ลักษณะการใช้งาน: </strong>
            <span>{band.useCase}</span>
          </div>
        </div>

        <div className="spectrum-stats-card">
          <div className="stat-box">
            <span className="stat-label">แนวโน้มความจุของระบบ</span>
            <div className="stat-value speed-highlight">
              <span className="stat-number">{displayCapacity}</span>
            </div>
            <span className="stat-helper">
              {mimoActive
                ? "เปิดมุมมองหลายเสาอากาศและการเน้นลำคลื่นแล้ว"
                : "ปิดมุมมองหลายเสาอากาศ"}
            </span>
          </div>

          <div className="stat-box">
            <span className="stat-label">แนวโน้มการครอบคลุม (Coverage)</span>
            <div className="stat-value">
              <span className="stat-number">{band.coverage}</span>
            </div>
            <span className="stat-helper">ระยะจริงขึ้นกับกำลังส่ง ภูมิประเทศ เสาอากาศ และการออกแบบเครือข่าย</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">แนวโน้มการผ่านสิ่งกีดขวาง</span>
            <div className="penetration-meter">
              <span className={`pen-bar ${band.penetrationLevel >= 1 ? "filled" : ""}`} />
              <span className={`pen-bar ${band.penetrationLevel >= 2 ? "filled" : ""}`} />
              <span className={`pen-bar ${band.penetrationLevel >= 3 ? "filled" : ""}`} />
            </div>
            <span className="stat-text-value">{band.penetration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type PocketTopic = "RSRP" | "PCI" | "5QI" | "SINR" | "SCANNER";

export function InteractivePocketReference() {
  const [activeTab, setActiveTab] = useState<PocketTopic>("RSRP");

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex < 0) return;

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;

    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  }

  return (
    <div className="interactive-pocket-container">
      <div
        className="pocket-nav-tabs"
        role="tablist"
        aria-label="หัวข้อคู่มือภาคสนาม"
        onKeyDown={handleTabKeyDown}
      >
        <button
          id="pocket-tab-rsrp"
          type="button"
          role="tab"
          aria-selected={activeTab === "RSRP"}
          aria-controls="pocket-tab-panel"
          tabIndex={activeTab === "RSRP" ? 0 : -1}
          className={`pocket-tab ${activeTab === "RSRP" ? "active" : ""}`}
          onClick={() => setActiveTab("RSRP")}
        >
          <b>RSRP</b>
          <small>−80 / −100 / −110</small>
        </button>
        <button
          id="pocket-tab-pci"
          type="button"
          role="tab"
          aria-selected={activeTab === "PCI"}
          aria-controls="pocket-tab-panel"
          tabIndex={activeTab === "PCI" ? 0 : -1}
          className={`pocket-tab ${activeTab === "PCI" ? "active" : ""}`}
          onClick={() => setActiveTab("PCI")}
        >
          <b>PCI</b>
          <small>0–1007 (3 × SSS + PSS)</small>
        </button>
        <button
          id="pocket-tab-5qi"
          type="button"
          role="tab"
          aria-selected={activeTab === "5QI"}
          aria-controls="pocket-tab-panel"
          tabIndex={activeTab === "5QI" ? 0 : -1}
          className={`pocket-tab ${activeTab === "5QI" ? "active" : ""}`}
          onClick={() => setActiveTab("5QI")}
        >
          <b>5QI</b>
          <small>QoS Map (1, 5, 9, 80)</small>
        </button>
        <button
          id="pocket-tab-sinr"
          type="button"
          role="tab"
          aria-selected={activeTab === "SINR"}
          aria-controls="pocket-tab-panel"
          tabIndex={activeTab === "SINR" ? 0 : -1}
          className={`pocket-tab ${activeTab === "SINR" ? "active" : ""}`}
          onClick={() => setActiveTab("SINR")}
        >
          <b>SINR</b>
          <small>คุณภาพความใสของสัญญาณ</small>
        </button>
        <button
          id="pocket-tab-scanner"
          type="button"
          role="tab"
          aria-selected={activeTab === "SCANNER"}
          aria-controls="pocket-tab-panel"
          tabIndex={activeTab === "SCANNER" ? 0 : -1}
          className={`pocket-tab ${activeTab === "SCANNER" ? "active" : ""}`}
          onClick={() => setActiveTab("SCANNER")}
        >
          <b>SCANNER</b>
          <small>Scanner เทียบโทรศัพท์</small>
        </button>
      </div>

      <div
        id="pocket-tab-panel"
        className="pocket-tab-panel"
        role="tabpanel"
        aria-labelledby={`pocket-tab-${activeTab.toLowerCase()}`}
        tabIndex={0}
      >
        {activeTab === "RSRP" && (
          <div className="pocket-content-card">
            <h3>เกณฑ์ประเมินความแรงสัญญาณ RSRP / SS-RSRP</h3>
            <div className="pocket-grid">
              <div className="pocket-level excellent">
                <strong>≥ −80 dBm</strong>
                <span>ดีเยี่ยม (Excellent)</span>
                <p>สัญญาณอ้างอิงแรง แต่ยังต้องดู SINR และโหลดของ Cell ร่วมด้วย</p>
              </div>
              <div className="pocket-level good">
                <strong>−80 ถึง −100 dBm</strong>
                <span>ใช้งานได้ดี (Good / Normal)</span>
                <p>ระดับปกติสำหรับใช้งานทั่วไป สตรีมมิง และวิดีโอคอล</p>
              </div>
              <div className="pocket-level warning">
                <strong>−100 ถึง −110 dBm</strong>
                <span>เริ่มอ่อน (Fair / Weak)</span>
                <p>อาจเกิดการลดความเร็วหรือความล่าช้าในพื้นที่อับสัญญาณ</p>
              </div>
              <div className="pocket-level critical">
                <strong>&lt; −110 dBm</strong>
                <span>อ่อนมาก / เสี่ยงหลุด (Poor)</span>
                <p>ควรตรวจ SINR, RSRQ, Serving Cell และเงื่อนไข Mobility เพิ่มเติม</p>
              </div>
            </div>
            <p className="pocket-note">
              💡 <em>หมายเหตุ: ใช้เป็นช่วงอ้างอิงเบื้องต้น ไม่ใช่เกณฑ์มาตรฐานตายตัว แต่ละเครือข่ายอาจมีค่า threshold ที่แตกต่างกันเล็กน้อย</em>
            </p>
          </div>
        )}

        {activeTab === "PCI" && (
          <div className="pocket-content-card">
            <h3>สูตรคำนวณรหัสสถานีฐาน (PCI = Physical Cell Identity)</h3>
            <p className="pocket-intro">
              ใน 5G NR มีค่า PCI ทั้งหมด <strong>1,008 รหัส (0 ถึง 1007)</strong> คำนวณจากสองสัญญาณอ้างอิงหลักใน SSB:
            </p>
            <div className="pci-formula-box">
              <code>PCI = (3 × N_ID^(1)) + N_ID^(2)</code>
            </div>
            <ul className="pocket-list">
              <li>
                <strong>N_ID^(1) (SSS):</strong> ค่าตั้งแต่ <code>0 ถึง 335</code> (กลุ่มของ Cell)
              </li>
              <li>
                <strong>N_ID^(2) (PSS):</strong> ค่า <code>0, 1 หรือ 2</code> (หนึ่งในสามรหัสภายในกลุ่ม)
              </li>
              <li>
                <strong>ข้อควรระวังหน้างาน:</strong> หลีกเลี่ยงปัญหา <em>PCI Collision</em> (สถานีติดกันใช้รหัสเดียวกัน) และ <em>PCI Confusion</em> (สถานีเพื่อนบ้านมีรหัสซ้ำกัน)
              </li>
            </ul>
          </div>
        )}

        {activeTab === "5QI" && (
          <div className="pocket-content-card">
            <h3>ตัวอย่างรหัส 5QI (5G QoS Identifier) ที่พบบ่อย</h3>
            <div className="pocket-table-wrapper">
              <table className="pocket-table">
                <thead>
                  <tr>
                    <th>5QI</th>
                    <th>ประเภททรัพยากร</th>
                    <th>ตัวอย่างบริการหลัก</th>
                    <th>Packet Delay Budget</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>1</strong></td>
                    <td>GBR (การันตีบิตเรต)</td>
                    <td>VoNR / โทรศัพท์เสียงผ่าน 5G</td>
                    <td>100 ms</td>
                  </tr>
                  <tr>
                    <td><strong>5</strong></td>
                    <td>Non-GBR</td>
                    <td>IMS Signaling (ควบคุมการโทร)</td>
                    <td>100 ms</td>
                  </tr>
                  <tr>
                    <td><strong>9</strong></td>
                    <td>Non-GBR</td>
                    <td>อินเทอร์เน็ตทั่วไป / ท่องเว็บ / โซเชียล</td>
                    <td>300 ms</td>
                  </tr>
                  <tr>
                    <td><strong>80</strong></td>
                    <td>Non-GBR (Low Latency)</td>
                    <td>AR / VR / Cloud Gaming</td>
                    <td>10 ms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "SINR" && (
          <div className="pocket-content-card">
            <h3>คุณภาพความใสของสัญญาณ SINR (Signal-to-Interference-plus-Noise Ratio)</h3>
            <div className="pocket-grid three-col">
              <div className="pocket-level excellent">
                <strong>≥ +20 dB</strong>
                <span>สัญญาณใสมาก</span>
                <p>สัญญาณที่ต้องการเด่นกว่าสัญญาณรบกวนมาก และเอื้อต่อ Modulation ระดับสูง</p>
              </div>
              <div className="pocket-level good">
                <strong>+10 ถึง +20 dB</strong>
                <span>คุณภาพดี</span>
                <p>ใช้งานอินเทอร์เน็ตความเร็วสูงได้เสถียรมาก</p>
              </div>
              <div className="pocket-level warning">
                <strong>0 ถึง +10 dB</strong>
                <span>ปานกลางถึงเริ่มมีคลื่นรบกวน</span>
                <p>อาจมีสัญญาณจาก Cell เพื่อนบ้านเข้ามารบกวน (Interference)</p>
              </div>
            </div>
            <p className="pocket-note">
              💡 <em>ข้อสังเกตภาคสนาม: สัญญาณอาจแรง (RSRP สูง) แต่ถ้า SINR ต่ำ ความเร็วอินเทอร์เน็ตก็จะช้าเนื่องจากการรบกวนจาก Cell อื่น</em>
            </p>
          </div>
        )}

        {activeTab === "SCANNER" && (
          <div className="pocket-content-card">
            <h3>ลำดับการวิเคราะห์: Network Scanner เทียบกับ Test Phone</h3>
            <div className="scanner-compare-grid">
              <div className="compare-box">
                <h4>📡 Network Scanner (Passive)</h4>
                <ul>
                  <li>กวาดวัดคลื่นและ SSB/PCI ตามย่านและ Bandwidth ที่เครื่องรองรับ โดยไม่ต้องใส่ SIM</li>
                  <li>ใช้ตรวจหา Coverage แท้จริง, จุดบอดสัญญาณ (Dead Zone) และคลื่นรบกวน</li>
                  <li>เห็น Cell ที่ตรวจพบได้โดยไม่ถูกจำกัดด้วยนโยบายเลือก Cell ของ SIM</li>
                </ul>
              </div>
              <div className="compare-box">
                <h4>📱 Test Phone (Active)</h4>
                <ul>
                  <li>เกาะสัญญาณจริงตาม SIM และเงื่อนไขการคัดเลือก Cell ของเครือข่าย</li>
                  <li>วัดความเร็วจริง (Throughput), สถิติ Handover, Event A3 และ Ping</li>
                  <li>สะท้อนประสบการณ์จริงที่ผู้ใช้งานได้รับ (User Experience)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
