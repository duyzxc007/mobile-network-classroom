import Link from "next/link";
import "./home.css";

const lessons = [
  {
    number: "01",
    href: "/network-evolution",
    eyebrow: "Mobile Network Evolution",
    title: "พื้นฐานเครือข่าย 1G–5G",
    description:
      "ตามวิวัฒนาการจากเสียงแอนะล็อก ผ่าน GSM, CDMA, LTE และ LTE-Advanced จนถึง 5G NR พร้อมเข้าใจบทบาทของ 3GPP และ ITU",
    topics: ["1G–5G", "GSM / CDMA", "LTE-A", "3GPP / ITU"],
    time: "20 นาที",
    level: "เริ่มจากบทนี้",
    visual: "generation",
  },
  {
    number: "02",
    href: "/rf-modulation",
    eyebrow: "RF & Digital Modulation",
    title: "คลื่น การมอดูเลต และการแบ่งทรัพยากร",
    description:
      "เห็นภาพ Time/Frequency Domain, Carrier, PSK, QPSK, QAM และ Constellation ก่อนเชื่อมไปยัง FDD/TDD, OFDM, OFDMA และ SC-FDMA",
    topics: ["Waveform", "QPSK / QAM", "OFDM", "FDD / TDD"],
    time: "30 นาที",
    level: "พื้นฐาน RF",
    visual: "wave",
  },
  {
    number: "03",
    href: "/5g-nr",
    eyebrow: "5G NR Air Interface",
    title: "โครงสร้างและช่องสัญญาณ 5G NR",
    description:
      "ซูมจาก FR1/FR2 และ NSA/SA เข้าไปใน Numerology, Resource Grid, RB/RE, Bandwidth Part และเส้นทางจาก SSB ถึง PDSCH/PUSCH",
    topics: ["FR1 / FR2", "Resource Grid", "SSB", "Channel / Signal"],
    time: "30 นาที",
    level: "โครงสร้าง 5G",
    visual: "grid",
  },
  {
    number: "04",
    href: "/signal-quality",
    eyebrow: "Signal Quality & Field Work",
    title: "คุณภาพสัญญาณ Beamforming และการวัดภาคสนาม",
    description:
      "อ่าน RSRP, RSRQ และ SINR ให้เป็น เข้าใจ SISO, MIMO, Massive MIMO, SSB Index กับ PCI และเลือก Scanner หรือโทรศัพท์ให้ตรงคำถาม",
    topics: ["RSRP / RSRQ", "SINR", "MIMO / Beam", "Scanner / Phone"],
    time: "28 นาที",
    level: "งานวัดภาคสนาม",
    visual: "beam",
  },
  {
    number: "05",
    href: "/mobility",
    eyebrow: "Connection, Registration & Mobility",
    title: "จากเปิดเครื่องจนถึง Handover",
    description:
      "ตามรอยมือถือจาก Cell Search, Selection, PRACH และ Registration ไปจนถึง Measurement Report, Event A3, Cell Reselection และ Handover ขณะเดินทาง",
    topics: ["Cell Search", "PRACH / RRC", "Registration", "Handover / A3"],
    time: "35 นาที",
    level: "การเชื่อมต่อและ Mobility",
    visual: "mobility",
  },
  {
    number: "06",
    href: "/core-security",
    eyebrow: "5G Core, Slicing & Security",
    title: "5G Core, Network Slicing และความปลอดภัย",
    description:
      "แยกบทบาท AMF, SMF และ UPF เข้าใจ PDU Session, QoS Flow, Network Slice และ Edge ก่อนตามลำดับ SIM Authentication, SUCI, Encryption และการรับมือสถานีฐานปลอม",
    topics: ["AMF / SMF / UPF", "Slice / QoS", "Edge", "SIM / SUCI / Security"],
    time: "40 นาที",
    level: "Core Network และ Security",
    visual: "core",
  },
];

function LessonVisual({ type }: { type: string }) {
  if (type === "generation") {
    return (
      <div className="hub-generation-visual" aria-hidden="true">
        {["1G", "2G", "3G", "4G", "5G"].map((item) => <i key={item}><span>{item}</span></i>)}
      </div>
    );
  }

  if (type === "wave") {
    return (
      <div className="hub-wave-visual" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i />
        <span>I</span><span>Q</span>
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div className="hub-grid-visual" aria-hidden="true">
        {Array.from({ length: 48 }, (_, index) => <i key={index} className={index % 13 === 0 || index === 28 ? "active" : ""} />)}
        <span>TIME →</span>
      </div>
    );
  }

  if (type === "mobility") {
    return (
      <div className="hub-mobility-visual" aria-hidden="true">
        <div className="hub-mobility-tower tower-left"><i /><b>A</b></div>
        <div className="hub-mobility-tower tower-right"><i /><b>B</b></div>
        <div className="hub-mobility-beam beam-left" />
        <div className="hub-mobility-beam beam-right" />
        <div className="hub-mobility-road"><i /><i /><i /><i /><i /></div>
        <div className="hub-mobility-phone"><span /><b>UE</b></div>
        <p>SEARCH → CONNECT → MOVE</p>
      </div>
    );
  }

  if (type === "core") {
    return (
      <div className="hub-core-visual" aria-hidden="true">
        <div className="hub-core-phone"><i /><b>UE</b></div>
        <div className="hub-core-ran"><i /><b>RAN</b></div>
        <div className="hub-core-box"><span>5G CORE</span><b>AMF</b><b>SMF</b><b>UPF</b></div>
        <div className="hub-core-edge"><b>EDGE</b></div>
        <div className="hub-core-lock"><i /><b>✓</b></div>
        <div className="hub-core-path" />
        <p>CONTROL · USER · TRUST</p>
      </div>
    );
  }

  return (
    <div className="hub-beam-visual" aria-hidden="true">
      <div>{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
      <span /><span /><span />
      <b>UE</b>
    </div>
  );
}

export default function Home() {
  return (
    <main className="hub-page">
      <header className="hub-header">
        <a className="hub-brand" href="#hub-top" aria-label="กลับสู่ด้านบน">
          <span aria-hidden="true">RF</span>
          <span>
            <strong>Mobile Network Classroom</strong>
            <small>ศูนย์รวมบทเรียนเครือข่ายมือถือ</small>
          </span>
        </a>
        <nav aria-label="เมนูหน้าหลัก">
          <a href="#hub-lessons">บทเรียนทั้งหมด</a>
          <a href="#hub-path">ลำดับการเรียน</a>
          <Link href="/field-guide">คู่มือภาคสนาม</Link>
          <a href="#hub-principles">แนวทางของเรา</a>
        </nav>
        <Link className="hub-header-action" href="/network-evolution">เริ่มบทที่ 01</Link>
      </header>

      <section className="hub-hero" id="hub-top">
        <div className="hub-hero-copy">
          <p className="hub-kicker">เรียนรู้จากภาพใหญ่ ไปจนถึงการวัดจริง</p>
          <h1>เข้าใจเครือข่ายมือถือ<br />อย่างเป็นระบบ</h1>
          <p>
            หลักสูตรภาษาไทยสำหรับบุคคลทั่วไปและช่างเทคนิค
            เชื่อมทุกเรื่องตั้งแต่วิวัฒนาการ 1G–5G, พื้นฐาน RF, โครงสร้าง 5G NR
            การอ่านคุณภาพสัญญาณ เส้นทางเชื่อมต่อ ไปจนถึง 5G Core และ Security
          </p>
          <div className="hub-hero-actions">
            <Link className="hub-primary" href="/network-evolution">
              เริ่มเรียนตามลำดับ <span aria-hidden="true">→</span>
            </Link>
            <a className="hub-secondary" href="#hub-lessons">เลือกบทเรียนเอง ↓</a>
            <Link className="hub-secondary" href="/field-guide">เปิดคู่มือภาคสนาม ↗</Link>
          </div>
          <dl className="hub-course-facts">
            <div><dt>6</dt><dd>บทเรียนครบชุด</dd></div>
            <div><dt>≈ 183</dt><dd>นาทีทั้งหมด</dd></div>
            <div><dt>49</dt><dd>คำถามทบทวน</dd></div>
          </dl>
        </div>

        <div className="hub-hero-map" role="img" aria-label="เส้นทางเรียนจาก 1G ถึงการวัดคุณภาพสัญญาณภาคสนาม">
          <div className="hub-map-axis" aria-hidden="true" />
          <div className="hub-map-step step-one">
            <span>01</span><b>1G–5G</b><small>เห็นภาพใหญ่</small>
          </div>
          <div className="hub-map-step step-two">
            <span>02</span><b>RF</b><small>เข้าใจคลื่น</small>
          </div>
          <div className="hub-map-step step-three">
            <span>03</span><b>5G NR</b><small>อ่านโครงสร้าง</small>
          </div>
          <div className="hub-map-step step-four">
            <span>04</span><b>FIELD</b><small>ลงพื้นที่จริง</small>
          </div>
          <div className="hub-map-step step-five">
            <span>05</span><b>MOVE</b><small>เชื่อมต่อและย้าย Cell</small>
          </div>
          <div className="hub-map-step step-six">
            <span>06</span><b>CORE</b><small>เส้นทางและความปลอดภัย</small>
          </div>
          <div className="hub-map-signal" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
          <p>ทุกบทเชื่อมกัน แต่สามารถเปิดทบทวนเฉพาะเรื่องได้ทันที</p>
        </div>
      </section>

      <section className="hub-intro">
        <p className="hub-section-index">ภาพรวมหลักสูตร</p>
        <div>
          <h2>ศัพท์ยากจะง่ายขึ้น<br />เมื่อวางถูกลำดับ</h2>
          <p>
            เราเริ่มจากคำถามว่าเครือข่ายพัฒนามาอย่างไร จากนั้นลงลึกถึงคลื่นและทรัพยากรวิทยุ
            ก่อนอ่านโครงสร้าง 5G NR ตีความค่าที่วัด ติดตาม UE จนถึง Handover และเดินต่อเข้า Core Network
          </p>
        </div>
      </section>

      <section className="hub-lessons" id="hub-lessons">
        <div className="hub-section-heading">
          <p className="hub-section-index">บทเรียนทั้งหมด</p>
          <h2>เลือกเริ่มจากพื้นฐาน<br />หรือเข้าหัวข้อที่ต้องใช้</h2>
        </div>

        <div className="hub-lesson-grid">
          {lessons.map((lesson) => (
            <article className={`hub-lesson hub-lesson-${lesson.number}`} key={lesson.number}>
              <div className="hub-lesson-topline">
                <span>บทที่ {lesson.number}</span>
                <span>{lesson.time}</span>
              </div>
              <div className="hub-lesson-copy">
                <p>{lesson.eyebrow}</p>
                <h3>{lesson.title}</h3>
                <div className="hub-topic-list">
                  {lesson.topics.map((topic) => <span key={topic}>{topic}</span>)}
                </div>
                <p>{lesson.description}</p>
              </div>
              <LessonVisual type={lesson.visual} />
              <div className="hub-lesson-footer">
                <span>{lesson.level}</span>
                <Link href={lesson.href} aria-label={`เปิดบทเรียน ${lesson.title}`}>
                  เปิดบทเรียน <b aria-hidden="true">↗</b>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hub-path" id="hub-path">
        <div className="hub-path-copy">
          <p className="hub-section-index">ลำดับที่แนะนำ</p>
          <h2>หนึ่งเส้นทาง<br />หกระดับความเข้าใจ</h2>
          <p>เรียนต่อเนื่องสำหรับผู้เริ่มต้น หรือใช้หัวข้อด้านขวาเป็นสารบัญสำหรับทบทวนหน้างาน</p>
        </div>
        <ol className="hub-path-list">
          {lessons.map((lesson, index) => (
            <li key={lesson.number}>
              <span>{lesson.number}</span>
              <div>
                <small>{lesson.eyebrow}</small>
                <h3>{lesson.title}</h3>
                <p>{index === 0 ? "สร้างแผนที่ความคิดของระบบมือถือ" : index === 1 ? "เข้าใจภาษาของคลื่นและสัญลักษณ์" : index === 2 ? "ตามเส้นทางการสื่อสารใน 5G NR" : index === 3 ? "เปลี่ยนตัวเลขวัดให้เป็นการวิเคราะห์" : index === 4 ? "ตาม UE จากเปิดเครื่องไปจนถึงเปลี่ยน Cell" : "เข้าใจ Core, Slice, QoS และขอบเขตความปลอดภัย"}</p>
              </div>
              <Link href={lesson.href}>เรียนบทนี้ <span aria-hidden="true">→</span></Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="hub-principles" id="hub-principles">
        <div className="hub-section-heading">
          <p className="hub-section-index">แนวทางของเรา</p>
          <h2>อ่านง่าย แต่ไม่ลดทอนความถูกต้อง</h2>
        </div>
        <div className="hub-principle-list">
          <article><span>01</span><h3>เริ่มจากภาพใหญ่</h3><p>รู้ก่อนว่าคำศัพท์อยู่ส่วนใดของระบบ แล้วค่อยเปิดรายละเอียดเชิงเทคนิค</p></article>
          <article><span>02</span><h3>เห็นการทำงาน</h3><p>ใช้ภาพเคลื่อนไหวและการทดลองแบบโต้ตอบเพื่ออธิบายสิ่งที่มองไม่เห็นด้วยตา</p></article>
          <article><span>03</span><h3>ตรวจความเข้าใจ</h3><p>ทุกบทมีแบบทดสอบพร้อมเฉลย เพื่อให้รู้ทันทีว่าส่วนใดควรทบทวน</p></article>
          <article><span>04</span><h3>อ้างอิงมาตรฐาน</h3><p>แยกนิยามมาตรฐาน ข้อแนะนำภาคสนาม และคำเรียกทางการตลาดออกจากกัน</p></article>
        </div>
      </section>

      <section className="hub-pocket">
        <div>
          <p className="hub-section-index">สำหรับช่างเทคนิคหน้างาน</p>
          <h2>Pocket Reference<br />เปิดข้อมูลสำคัญในคลิกเดียว</h2>
          <p>
            รวมช่วงค่า RSRP/RSRQ/SINR แบบใช้งานเร็ว สูตร PCI และ S-criteria,
            ค่า 5QI ตัวอย่าง และลำดับตรวจปัญหา Scanner เทียบกับโทรศัพท์
          </p>
        </div>
        <div className="hub-pocket-cards" aria-hidden="true">
          <span><b>RSRP</b><small>−80 / −100 / −110</small></span>
          <span><b>PCI</b><small>0–1007</small></span>
          <span><b>5QI</b><small>QoS Map</small></span>
        </div>
        <Link className="hub-primary" href="/field-guide">เปิดคู่มือภาคสนาม <span aria-hidden="true">→</span></Link>
      </section>

      <section className="hub-cta">
        <div>
          <p className="hub-section-index">พร้อมเริ่มหรือยัง?</p>
          <h2>เริ่มจาก 1G แล้วค่อยเดินไปถึง 5G Core, Slice และ Security</h2>
        </div>
        <Link className="hub-primary hub-primary-light" href="/network-evolution">
          เปิดบทเรียนที่ 01 <span aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className="hub-footer">
        <div>
          <Link className="hub-brand hub-brand-footer" href="/">
            <span aria-hidden="true">RF</span>
            <span><strong>Mobile Network Classroom</strong><small>เรียนรู้เครือข่ายมือถืออย่างเป็นระบบ</small></span>
          </Link>
          <p>สื่อการสอนภาษาไทยสำหรับผู้เริ่มต้นและช่างเทคนิค</p>
        </div>
        <nav aria-label="ลิงก์บทเรียนท้ายหน้า">
          {lessons.map((lesson) => <Link key={lesson.number} href={lesson.href}>{lesson.number} {lesson.title}</Link>)}
        </nav>
        <a href="#hub-top">กลับด้านบน ↑</a>
      </footer>
    </main>
  );
}
