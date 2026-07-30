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

test("server-renders the complete Thai lesson", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /lang="th"/i);
  assert.match(html, /พื้นฐานเครือข่าย 1G/);
  assert.match(html, /GSM กับ CDMA/);
  assert.match(html, /3GPP เขียนสเปก/);
  assert.match(html, /แบบทดสอบท้ายบท/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
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
  assert.match(html, /หยุดภาพ/);
  assert.match(html, /แบบทดสอบท้ายบท/);
});

test("removes temporary starter UI and preserves product context", async () => {
  const [page, rfPage, rfCss, layout, product, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rf-modulation/RfLessonClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rf-modulation/rf-modulation.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../PRODUCT.md", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
  assert.match(page, /5G NR/);
  assert.match(page, /แบบทดสอบ/);
  assert.match(rfPage, /SC-FDMA/);
  assert.match(rfPage, /Dynamic Spectrum Sharing/);
  assert.match(rfPage, /prefers-reduced-motion/);
  assert.match(rfCss, /@keyframes rf-carrier-scan/);
  assert.match(rfCss, /rf-motion-paused/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(layout, /lang="th"/);
  assert.match(product, /บุคคลทั่วไปและช่างเทคนิค/);
});
