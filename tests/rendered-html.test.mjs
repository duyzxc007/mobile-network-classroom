import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete Thai course hub", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /lang="th"/i);
  assert.match(html, /ศูนย์รวมบทเรียนเครือข่ายมือถือ/);
  assert.match(html, /เข้าใจเครือข่ายมือถือ/);
  assert.match(html, /hub-lesson-01/);
  assert.match(html, /hub-lesson-02/);
  assert.match(html, /hub-lesson-03/);
  assert.match(html, /hub-lesson-04/);
  assert.match(html, /hub-lesson-05/);
  assert.match(html, /hub-lesson-06/);
  assert.match(html, /พื้นฐานเครือข่าย 1G/);
  assert.match(html, /คลื่น การมอดูเลต และการแบ่งทรัพยากร/);
  assert.match(html, /โครงสร้างและช่องสัญญาณ 5G NR/);
  assert.match(html, /คุณภาพสัญญาณ Beamforming และการวัดภาคสนาม/);
  assert.match(html, /จากเปิดเครื่องจนถึง Handover/);
  assert.match(html, /5G Core, Network Slicing และความปลอดภัย/);
  assert.match(html, /href="\/network-evolution"/);
  assert.match(html, /href="\/rf-modulation"/);
  assert.match(html, /href="\/5g-nr"/);
  assert.match(html, /href="\/signal-quality"/);
  assert.match(html, /href="\/mobility"/);
  assert.match(html, /href="\/core-security"/);
  assert.match(html, /href="\/field-guide"/);
  assert.match(html, /คู่มือภาคสนาม/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("server-renders the preserved network evolution lesson", async () => {
  const response = await render("/network-evolution");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /พื้นฐานเครือข่ายมือถือ 1G ถึง 5G/);
  assert.match(html, /GSM กับ CDMA/);
  assert.match(html, /3GPP เขียนสเปก/);
  assert.match(html, /หนึ่งทรัพยากร แบ่งผู้ใช้ได้หลายวิธี/);
  assert.match(html, /แบบทดสอบท้ายบท/);
  assert.match(html, /กลับหน้ารวมบทเรียน/);
});

test("server-renders the separate RF and modulation lesson", async () => {
  const response = await render("/rf-modulation");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /พื้นฐาน RF และ Digital Modulation/);
  assert.match(html, /Constellation/);
  assert.match(html, /Dynamic Spectrum Sharing/);
  assert.match(html, /OFDM, OFDMA, SC-FDMA/);
  assert.match(html, /บิตถูก Map ไปยังจุดใน Constellation/);
  assert.match(html, /หยุดภาพ/);
  assert.match(html, /แบบทดสอบท้ายบท/);
});

test("server-renders the separate 5G NR structure lesson", async () => {
  const response = await render("/5g-nr");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /โครงสร้างและช่องสัญญาณ 5G NR/);
  assert.match(html, /FR2-2/);
  assert.match(html, /NSA ใช้ 4G ช่วยตั้งหลัก/);
  assert.match(html, /Resource Element/);
  assert.match(html, /Bandwidth Part/);
  assert.match(html, /PSS \+ SSS \+ PBCH/);
  assert.match(html, /PDCCH → PDSCH/);
  assert.match(html, /Scheduler วางข้อมูลบนเวลา × ความถี่/);
  assert.match(html, /หยุดภาพ/);
  assert.match(html, /แบบทดสอบท้ายบท/);
});

test("server-renders the separate signal quality and field measurement lesson", async () => {
  const response = await render("/signal-quality");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /สัญญาณแรง/);
  assert.match(html, /RSRP \/ SS-RSRP/);
  assert.match(html, /RSRQ/);
  assert.match(html, /SINR/);
  assert.match(html, /Massive MIMO/);
  assert.match(html, /SSB Index/);
  assert.match(html, /PCI = 0 ถึง 1007/);
  assert.match(html, /Network Scanner/);
  assert.match(html, /Test Phone/);
  assert.match(html, /สัญญาณแรงคงเดิม แต่ SINR ลดได้/);
  assert.match(html, /หยุดภาพ/);
  assert.match(html, /แบบทดสอบท้ายบท/);
});

test("server-renders the connection and mobility lesson", async () => {
  const response = await render("/mobility");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /จากเปิดเครื่อง/);
  assert.match(html, /PSS และ SSS/);
  assert.match(html, /Cell Selection \/ Reselection Lab/);
  assert.match(html, /PRACH Preamble/);
  assert.match(html, /Timing Advance/);
  assert.match(html, /Event A3/);
  assert.match(html, /RRC_IDLE \/ RRC_INACTIVE/);
  assert.match(html, /NSA \/ SA Reality/);
  assert.match(html, /Scanner/);
  assert.match(html, /Test Phone/);
  assert.match(html, /วัดก่อน รายงานก่อน แล้วจึง Handover/);
  assert.match(html, /หยุดภาพ/);
  assert.match(html, /แบบทดสอบท้ายบท/);
});

test("server-renders the 5G core, slicing, and security lesson", async () => {
  const response = await render("/core-security");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /5G Core Map/);
  assert.match(html, /Access and Mobility Management Function/);
  assert.match(html, /SMF/);
  assert.match(html, /UPF/);
  assert.match(html, /PDU SESSION/);
  assert.match(html, /QoS Flow/);
  assert.match(html, /Edge Computing/);
  assert.match(html, /Network Slice/);
  assert.match(html, /5G Authentication/);
  assert.match(html, /SUPI/);
  assert.match(html, /SUCI/);
  assert.match(html, /False Base Station Awareness/);
  assert.match(html, /Control ตัดสินใจ ส่วน User Plane ขน Packet/);
  assert.match(html, /หยุดภาพ/);
  assert.match(html, /แบบทดสอบท้ายบท/);
});

test("server-renders the field pocket reference", async () => {
  const response = await render("/field-guide");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Field Pocket Reference/);
  assert.match(html, /สามค่าหลัก/);
  assert.match(html, /RSRP \/ SS-RSRP/);
  assert.match(html, /S.*rxlev/);
  assert.match(html, /5QI ตัวอย่าง/);
  assert.match(html, /SCANNER · PASSIVE/);
  assert.match(html, /ใช้เป็นช่วงอ้างอิงเบื้องต้น ไม่ใช่เกณฑ์มาตรฐานตายตัว/);
});

test("removes temporary starter UI and preserves product context", async () => {
  const [page, homeCss, evolutionPage, rfPage, rfCss, nrPage, nrCss, sqPage, sqCss, mvPage, mvCss, csPage, csCss, supportPage, fieldPage, fieldCss, layout, product, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/home.css", import.meta.url), "utf8"),
    readFile(new URL("../app/network-evolution/NetworkEvolutionClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rf-modulation/RfLessonClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rf-modulation/rf-modulation.css", import.meta.url), "utf8"),
    readFile(new URL("../app/5g-nr/NrLessonClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/5g-nr/5g-nr.css", import.meta.url), "utf8"),
    readFile(new URL("../app/signal-quality/SignalQualityClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/signal-quality/signal-quality.css", import.meta.url), "utf8"),
    readFile(new URL("../app/mobility/MobilityLessonClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mobility/mobility.css", import.meta.url), "utf8"),
    readFile(new URL("../app/core-security/CoreSecurityLessonClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/core-security/core-security.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/LearningSupport.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/field-guide/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/field-guide/field-guide.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../PRODUCT.md", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
  assert.match(page, /network-evolution/);
  assert.match(page, /rf-modulation/);
  assert.match(page, /signal-quality/);
  assert.match(page, /mobility/);
  assert.match(page, /core-security/);
  assert.match(page, /field-guide/);
  assert.match(page, /บทเรียนทั้งหมด/);
  assert.match(homeCss, /\.hub-header\s*\{[\s\S]*position:\s*sticky/);
  assert.match(homeCss, /prefers-reduced-motion/);
  assert.match(evolutionPage, /GSM กับ CDMA/);
  assert.match(evolutionPage, /แบบทดสอบท้ายบท/);
  assert.match(rfPage, /SC-FDMA/);
  assert.match(rfPage, /Dynamic Spectrum Sharing/);
  assert.match(rfPage, /prefers-reduced-motion/);
  assert.match(rfPage, /function SignalCanvas/);
  assert.match(rfPage, /phaseShift = bit \? 0 : Math\.PI/);
  assert.match(rfCss, /@keyframes rf-full-sweep/);
  assert.match(rfCss, /rf-motion-paused/);
  assert.match(rfCss, /\.rf-header\s*\{[\s\S]*position:\s*sticky/);
  assert.doesNotMatch(rfCss, /\.rf-page\s*\{[\s\S]{0,500}overflow-x:\s*hidden/);
  assert.match(nrPage, /FR2-2/);
  assert.match(nrPage, /12 Subcarriers ต่อเนื่องในแกนความถี่/);
  assert.match(nrPage, /PDCCH/);
  assert.match(nrPage, /PRACH/);
  assert.match(nrPage, /prefers-reduced-motion/);
  assert.match(nrCss, /nr-motion-paused/);
  assert.match(nrCss, /\.nr-header\s*\{[\s\S]*position:\s*sticky/);
  assert.match(sqPage, /SSB Index/);
  assert.match(sqPage, /Scanner และโทรศัพท์/);
  assert.match(sqPage, /prefers-reduced-motion/);
  assert.match(sqCss, /sq-motion-paused/);
  assert.match(sqCss, /\.sq-header\s*\{[\s\S]*position:\s*sticky/);
  assert.match(mvPage, /Cell Selection \/ Reselection Lab/);
  assert.match(mvPage, /PRACH Preamble/);
  assert.match(mvPage, /Event A3/);
  assert.match(mvPage, /prefers-reduced-motion/);
  assert.match(mvCss, /mv-motion-paused/);
  assert.match(mvCss, /\.mv-header\s*\{[\s\S]*position:\s*sticky/);
  assert.match(csPage, /Access and Mobility Management Function/);
  assert.match(csPage, /Network Slice/);
  assert.match(csPage, /False Base Station Awareness/);
  assert.match(csPage, /prefers-reduced-motion/);
  assert.match(csCss, /cs-motion-paused/);
  assert.match(csCss, /\.cs-header\s*\{[\s\S]*position:\s*sticky/);
  assert.match(supportPage, /สรุปใน 3 บรรทัด/);
  assert.match(supportPage, /ANIMATED CONCEPT/);
  assert.match(supportPage, /motion-qpsk-model/);
  assert.match(supportPage, /Mapping Convention/);
  assert.match(supportPage, /quiz-summary-box/);
  assert.match(supportPage, /mobile-classroom-outdoor/);
  assert.match(fieldPage, /S.*rxlev/);
  assert.match(fieldPage, /Packet Delay Budget/);
  assert.match(fieldCss, /\.fg-header\s*\{[\s\S]*position:\s*sticky/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /concept-motion-paused/);
  assert.match(css, /left:\s*calc\(100% - 18px\)/);
  assert.match(layout, /lang="th"/);
  assert.match(product, /บุคคลทั่วไปและช่างเทคนิค/);
});
