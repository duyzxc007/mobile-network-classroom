import type { Metadata } from "next";
import Link from "next/link";
import { TechTerm } from "../components/LearningSupport";
import "./field-guide.css";

export const metadata: Metadata = {
  title: "คู่มือภาคสนามเครือข่ายมือถือ | Mobile Network Classroom",
  description:
    "Pocket Reference ภาษาไทยสำหรับช่างเทคนิค: RSRP, RSRQ, SINR, PCI, S-criteria, 5QI และลำดับตรวจปัญหา Scanner เทียบโทรศัพท์",
  alternates: { canonical: "/field-guide" },
};

const signalBands = [
  {
    metric: "RSRP / SS-RSRP",
    purpose: "ความแรง Reference Signal",
    bands: [
      ["แรงมาก", "≥ −80 dBm", "excellent"],
      ["ดี", "−80 ถึง −90 dBm", "good"],
      ["พอใช้", "−90 ถึง −100 dBm", "fair"],
      ["อ่อน", "−100 ถึง −110 dBm", "weak"],
      ["อ่อนมาก", "< −110 dBm", "poor"],
    ],
  },
  {
    metric: "RSRQ / SS-RSRQ",
    purpose: "คุณภาพเมื่อเทียบกับพลังงานรวมในช่อง",
    bands: [
      ["ดี", "≥ −10 dB", "excellent"],
      ["พอใช้", "−10 ถึง −15 dB", "good"],
      ["ควรตรวจเพิ่ม", "−15 ถึง −20 dB", "weak"],
      ["แย่", "< −20 dB", "poor"],
    ],
  },
  {
    metric: "SINR / SS-SINR",
    purpose: "สัญญาณที่ต้องการเทียบ Interference + Noise",
    bands: [
      ["ดีมาก", "≥ 20 dB", "excellent"],
      ["ดี", "13 ถึง 20 dB", "good"],
      ["ใช้งานได้ตามเงื่อนไข", "0 ถึง 13 dB", "fair"],
      ["แย่", "< 0 dB", "poor"],
    ],
  },
];

const qciRows = [
  ["1", "GBR", "20", "100 ms", "10⁻²", "เสียงสนทนา"],
  ["3", "GBR", "30", "50 ms", "10⁻³", "Real-time gaming / V2X บางกรณี"],
  ["5", "Non-GBR", "10", "100 ms", "10⁻⁶", "IMS Signalling"],
  ["9", "Non-GBR", "90", "300 ms", "10⁻⁶", "ข้อมูลทั่วไป / Buffered TCP"],
];

export default function FieldGuidePage() {
  return (
    <main className="fg-page">
      <header className="fg-header">
        <Link className="fg-brand" href="/">
          <span aria-hidden="true">RF</span>
          <span><strong>Mobile Network Classroom</strong><small>Field Pocket Reference</small></span>
        </Link>
        <nav aria-label="สารบัญคู่มือภาคสนาม">
          <a href="#signal">ค่าสัญญาณ</a>
          <a href="#formulas">สูตรสำคัญ</a>
          <a href="#qos">5QI</a>
          <a href="#workflow">ลำดับตรวจ</a>
        </nav>
        <Link className="fg-back" href="/">กลับหน้าหลัก</Link>
      </header>

      <section className="fg-hero" id="top">
        <div>
          <p className="fg-kicker">คู่มือด่วนสำหรับหน้างาน</p>
          <h1>ดูค่าให้ไว<br />แต่สรุปให้ครบ</h1>
          <p>
            ตารางและสูตรที่เปิดใช้บ่อยระหว่าง Drive Test หรือ Troubleshooting
            พร้อมคำเตือนว่าแต่ละค่าตอบคำถามใด และยังขาดหลักฐานอะไรบ้าง
          </p>
          <div className="fg-hero-actions">
            <a href="#signal">เปิดตารางค่าสัญญาณ ↓</a>
            <span>ออกแบบให้อ่านชัดบนมือถือและกลางแจ้ง</span>
          </div>
        </div>
        <div className="fg-console" aria-label="ภาพสรุปค่าสัญญาณสำหรับภาคสนาม">
          <span><small>RSRP</small><b>−86</b><i>dBm</i></span>
          <span><small>SINR</small><b>18</b><i>dB</i></span>
          <span><small>PCI</small><b>142</b><i>NR</i></span>
          <p>MEASURE → CORRELATE → VERIFY</p>
        </div>
      </section>

      <aside className="fg-warning">
        <strong>ใช้เป็นช่วงอ้างอิงเบื้องต้น ไม่ใช่เกณฑ์มาตรฐานตายตัว</strong>
        <p>
          3GPP นิยามวิธีวัด แต่ไม่ได้กำหนดตารางสี Pass/Fail ชุดเดียวสำหรับทุกเครือข่าย
          ก่อนสรุปต้องดู RAT, Band, Bandwidth, Measurement Type, Vendor, Load,
          Device Capability และ KPI/SLA ของโครงการ
        </p>
      </aside>

      <section className="fg-section" id="signal">
        <div className="fg-heading">
          <p>01 · Signal Reference</p>
          <h2>สามค่าหลัก<br />ตอบคนละคำถาม</h2>
          <span>ค่าที่ดีหนึ่งตัวไม่สามารถยืนยันประสบการณ์ใช้งานทั้งหมด</span>
        </div>

        <div className="fg-signal-grid">
          {signalBands.map((item) => (
            <article key={item.metric}>
              <div>
                <h3>{item.metric}</h3>
                <p>{item.purpose}</p>
              </div>
              <ul>
                {item.bands.map(([label, range, tone]) => (
                  <li className={tone} key={`${item.metric}-${label}`}>
                    <span>{label}</span><b>{range}</b>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="fg-scenarios">
          <article>
            <span>RSRP ดี · SINR ต่ำ</span>
            <h3>สงสัย Interference หรือ Load</h3>
            <p>ตรวจ Serving/Neighbor, PCI, Band, SSB Beam, RSRQ, Scheduler และเวลาที่วัด อย่าสรุปจาก Coverage อย่างเดียว</p>
          </article>
          <article>
            <span>RSRP ต่ำ · SINR ดี</span>
            <h3>ช่องสะอาดแต่กำลังอ่อน</h3>
            <p>อาจยังใช้งานได้ด้วย Modulation ที่ทนกว่า แต่ควรตรวจ Uplink, Indoor Loss และ Cell Edge Trend</p>
          </article>
          <article>
            <span>RF ดี · Service ช้า</span>
            <h3>ไล่ต่อหลัง Radio</h3>
            <p>ตรวจ Registration, PDU Session, DNS, UPF/Transport, Server, QoS, APN/DNN และ Application Timing</p>
          </article>
        </div>
      </section>

      <section className="fg-section fg-formulas" id="formulas">
        <div className="fg-heading">
          <p>02 · Formula Card</p>
          <h2>สูตรที่ใช้<br />อ่าน Log ให้ถูก</h2>
        </div>
        <div className="fg-formula-grid">
          <article>
            <span>NR Physical Cell ID</span>
            <code>N<sub>ID</sub><sup>cell</sup> = 3 × N<sub>ID</sub><sup>(1)</sup> + N<sub>ID</sub><sup>(2)</sup></code>
            <p>N<sub>ID</sub><sup>(1)</sup> = 0–335 และ N<sub>ID</sub><sup>(2)</sup> = 0–2 จึงได้ PCI 0–1007 รวม 1008 ค่า</p>
            <b>PCI ซ้ำได้ในเครือข่าย จึงไม่ใช่ Global Cell ID</b>
          </article>
          <article>
            <span>NR Cell Selection</span>
            <code>S<sub>rxlev</sub> = Q<sub>rxlevmeas</sub> − (Q<sub>rxlevmin</sub> + Q<sub>offset</sub>) − P<sub>compensation</sub> − Q<sub>offsettemp</sub></code>
            <code>S<sub>qual</sub> = Q<sub>qualmeas</sub> − (Q<sub>qualmin</sub> + Q<sub>offset</sub>) − Q<sub>offsettemp</sub></code>
            <p>Suitable Cell ต้องผ่าน S<sub>rxlev</sub> &gt; 0 และ S<sub>qual</sub> &gt; 0 ตาม Parameter ที่เกี่ยวข้อง</p>
          </article>
          <article>
            <span>Beam กับ Cell</span>
            <div className="fg-switch-map">
              <p><b>Beam switch</b><small>SSB Index เปลี่ยน · PCI อาจเดิม</small></p>
              <i>≠</i>
              <p><b>Cell switch</b><small>Serving Cell เปลี่ยน · PCI/Cell ID มักเปลี่ยน</small></p>
            </div>
            <p>อ่าน Beam Measurement, Serving Cell และ RRC Procedure แยกกันก่อนระบุว่าเกิด Handover</p>
          </article>
        </div>
      </section>

      <section className="fg-section fg-qos" id="qos">
        <div className="fg-heading">
          <p>03 · QoS Quick Map</p>
          <h2>5QI ตัวอย่าง<br />ไม่ใช่คะแนนความเร็ว</h2>
          <span>5QI อ้างอิงคุณลักษณะ QoS; QFI ระบุ QoS Flow ภายใน PDU Session</span>
        </div>
        <div className="fg-table-wrap">
          <table>
            <thead>
              <tr>
                <th>5QI</th><th>Resource</th><th>Priority</th><th>Packet Delay Budget</th><th>Packet Error Rate</th><th>ตัวอย่างบริการ</th>
              </tr>
            </thead>
            <tbody>
              {qciRows.map((row) => (
                <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fg-table-note">
          Priority Level ตัวเลขต่ำกว่าหมายถึงลำดับความสำคัญสูงกว่าในตารางมาตรฐาน
          และ Packet Delay Budget เป็นคุณลักษณะของ QoS ไม่ใช่การรับประกัน End-to-End Latency ของแอป
        </p>
      </section>

      <section className="fg-section fg-workflow" id="workflow">
        <div className="fg-heading">
          <p>04 · Field Workflow</p>
          <h2>ตรวจจากอากาศ<br />ไปถึงบริการ</h2>
        </div>
        <ol className="fg-steps">
          <li><span>01</span><div><b>ระบุคำถาม</b><p>Coverage, Interference, Access, Mobility, Throughput หรือ Application?</p></div></li>
          <li><span>02</span><div><b>ยืนยันบริบท</b><p>เวลา ตำแหน่ง Operator, RAT, Band, ARFCN, Bandwidth, Device และ SIM ต้องตรงกัน</p></div></li>
          <li><span>03</span><div><b>อ่าน RF</b><p>RSRP + RSRQ + SINR + Serving/Neighbor + PCI/SSB Index เป็นชุด</p></div></li>
          <li><span>04</span><div><b>อ่าน Signalling</b><p>Cell Selection, RACH, RRC, Registration, Session, Measurement และ Handover Cause</p></div></li>
          <li><span>05</span><div><b>ยืนยัน Service</b><p>Latency, Loss, DNS, Throughput, Server, Route และ Application Timing</p></div></li>
          <li><span>06</span><div><b>เทียบซ้ำอย่างควบคุม</b><p>เปลี่ยนครั้งละหนึ่งตัวแปร แล้วเก็บ Log ที่มีเวลาและตำแหน่งสัมพันธ์กัน</p></div></li>
        </ol>

        <div className="fg-tool-compare">
          <article>
            <span>SCANNER · PASSIVE</span>
            <h3>ตอบว่า “ในอากาศมีอะไร?”</h3>
            <p>เห็นหลายเครือข่ายและหลาย Cell โดยไม่ผูกกับ SIM เหมาะกับ Coverage, Neighbor และ RF Benchmark</p>
          </article>
          <article>
            <span>TEST PHONE · ACTIVE</span>
            <h3>ตอบว่า “ผู้ใช้รายนี้เจออะไร?”</h3>
            <p>เห็น <TechTerm meaning="ขั้นตอนส่งข้อความควบคุมระหว่าง UE, RAN และ Core">Signalling</TechTerm>, Policy, SIM และบริการจริง เหมาะกับ Access, Mobility และ User Experience</p>
          </article>
        </div>
      </section>

      <section className="fg-sources">
        <div>
          <p>แหล่งอ้างอิงหลัก</p>
          <h2>นิยามจากมาตรฐาน<br />ช่วงสีระบุเป็นแนวทางภาคสนาม</h2>
        </div>
        <ul>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138200_138299/138215/18.05.00_60/ts_138215v180500p.pdf" target="_blank" rel="noreferrer">3GPP TS 38.215 — NR Physical Layer Measurements</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138300_138399/138304/18.06.00_60/ts_138304v180600p.pdf" target="_blank" rel="noreferrer">3GPP TS 38.304 — Cell Selection and Reselection</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_ts/138200_138299/138211/18.07.00_60/ts_138211v180700p.pdf" target="_blank" rel="noreferrer">3GPP TS 38.211 — PCI, Physical Channels and Modulation</a></li>
          <li><a href="https://www.etsi.org/deliver/etsi_TS/123500_123599/123501/18.11.00_60/ts_123501v181100p.pdf" target="_blank" rel="noreferrer">3GPP TS 23.501 — 5QI and QoS Characteristics</a></li>
        </ul>
      </section>

      <footer className="fg-footer">
        <div><b>FIELD POCKET REFERENCE</b><span>Measure · Correlate · Verify</span></div>
        <Link href="/">กลับหน้าหลัก</Link>
        <a href="#top">กลับด้านบน ↑</a>
      </footer>
    </main>
  );
}
