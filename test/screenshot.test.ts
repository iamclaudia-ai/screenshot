import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { browserInstallCommand, generateScreenshot } from "../src/index.js";

const FIXTURE = join(import.meta.dir, "fixtures", "page.html");
const CLI = join(import.meta.dir, "..", "src", "cli.ts");
// Launching a browser takes a second or two, more on a cold CI runner.
const TIMEOUT = 30_000;

let outdir: string;

beforeAll(() => {
  outdir = mkdtempSync(join(tmpdir(), "screenshot-test-"));
});

afterAll(() => {
  rmSync(outdir, { recursive: true, force: true });
});

/** Width and height from a PNG's IHDR chunk. */
function pngSize(file: string) {
  const buf = readFileSync(file);
  expect(buf.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Width and height from a JPEG's start-of-frame segment. */
function jpegSize(file: string) {
  const buf = readFileSync(file);
  expect(buf.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
  let offset = 2;
  while (offset < buf.length) {
    const marker = buf.readUInt16BE(offset);
    const length = buf.readUInt16BE(offset + 2);
    // SOF0 (baseline) through SOF2 (progressive)
    if (marker >= 0xffc0 && marker <= 0xffc2) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error(`No start-of-frame segment in ${file}`);
}

describe("generateScreenshot", () => {
  test(
    "renders a PNG at the default size, doubled for retina",
    async () => {
      const out = await generateScreenshot(FIXTURE, undefined, { outdir });
      expect(out).toBe(join(outdir, "page.png"));
      expect(pngSize(out)).toEqual({ width: 2560, height: 1440 });
    },
    TIMEOUT,
  );

  test(
    "renders a JPEG at a size preset",
    async () => {
      const out = await generateScreenshot(FIXTURE, "og.jpg", {
        outdir,
        size: "og",
        format: "jpg",
      });
      expect(jpegSize(out)).toEqual({ width: 2400, height: 1260 });
    },
    TIMEOUT,
  );

  test(
    "lets width and height override the preset",
    async () => {
      const out = await generateScreenshot(FIXTURE, "wide.png", {
        outdir,
        size: "twitter",
        width: 1600,
      });
      expect(pngSize(out)).toEqual({ width: 3200, height: 1350 });
    },
    TIMEOUT,
  );

  test("rejects a missing HTML file", async () => {
    await expect(generateScreenshot(join(outdir, "nope.html"))).rejects.toThrow(
      "HTML file not found",
    );
  });
});

describe("browserInstallCommand", () => {
  test("pins the bundled Playwright version", () => {
    const { version } = require("playwright/package.json");
    expect(browserInstallCommand()).toBe(`npx playwright@${version} install --only-shell chromium`);
  });
});

describe("cli", () => {
  test(
    "writes the file named on the command line",
    async () => {
      const proc = Bun.spawn(
        ["bun", CLI, FIXTURE, "cli.jpg", "--outdir", outdir, "--size", "github", "--format", "jpg"],
        { stdout: "pipe", stderr: "pipe" },
      );
      expect(await proc.exited).toBe(0);
      expect(jpegSize(join(outdir, "cli.jpg"))).toEqual({ width: 2560, height: 1280 });
    },
    TIMEOUT,
  );

  test(
    "falls back to the installed Google Chrome when Playwright's browser is missing",
    async () => {
      // An empty browsers directory hides Playwright's headless shell.
      const proc = Bun.spawn(["bun", CLI, FIXTURE, "chrome.png", "--outdir", outdir], {
        env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: join(outdir, "no-browsers") },
        stdout: "pipe",
        stderr: "pipe",
      });
      expect(await proc.exited).toBe(0);
      expect(pngSize(join(outdir, "chrome.png"))).toEqual({ width: 2560, height: 1440 });
    },
    TIMEOUT,
  );

  test("fails on an unknown size preset", async () => {
    const proc = Bun.spawn(["bun", CLI, FIXTURE, "--size", "huge"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await proc.exited).toBe(1);
    expect(await new Response(proc.stderr).text()).toContain("Invalid size preset: huge");
  });
});
