"use client";

/** 공유용 카드 이미지 (1080×1350, 인스타 세로 비율). 모두 브라우저 캔버스에서 그린다. */

const W = 1080;
const H = 1350;
const C = {
  hanji: "#f1ece1",
  ink: "#1c1a17",
  ink2: "#3d3832",
  soft: "#7a7268",
  seal: "#b3261e",
  sealText: "#fbe9d0",
};
const BRUSH = '"Song Myung", "Nanum Myeongjo", serif';
const SERIF = '"Nanum Myeongjo", serif';
const SITE = "oh-bj.github.io/saju-service";

export interface PillarCardData {
  kind: "pillars";
  title: string;
  subline: string;
  /** 時日月年 순서, 모르면 null */
  columns: { label: string; stem: string | null; branch: string | null; isDay: boolean }[];
  footnote: string;
}

export interface DayCardData {
  kind: "day";
  dateLabel: string;
  iljin: string;
  score: number;
  headline: string;
  footnote: string;
}

export type CardData = PillarCardData | DayCardData;

async function ensureFonts() {
  if (!("fonts" in document)) return;
  await Promise.all([
    document.fonts.load(`150px ${BRUSH}`, "墨緣癸酉"),
    document.fonts.load(`700 52px ${SERIF}`, "가나다"),
    document.fonts.load(`400 34px ${SERIF}`, "가나다"),
  ]).catch(() => undefined);
}

/** 한지 바탕 + 섬유 같은 잔점 + 가는 테두리 */
function paper(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = C.hanji;
  ctx.fillRect(0, 0, W, H);
  let seed = 7;
  const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 18000; i++) {
    ctx.fillStyle = `rgba(110,90,60,${(r() * 0.07).toFixed(3)})`;
    ctx.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 1.2);
  }
  ctx.strokeStyle = "rgba(179,38,30,0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, W - 72, H - 72);
}

/** 낱말 단위 줄바꿈 */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function sealBox(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = C.seal;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "rgba(251,233,208,0.65)";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 8, y + 8, size - 16, size - 16);
}

function header(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = C.ink;
  ctx.font = `64px ${BRUSH}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("墨緣", 96, 150);
  ctx.fillStyle = C.soft;
  ctx.font = `400 26px ${SERIF}`;
  ctx.fillText("묵 연", 236, 146);
}

function footer(ctx: CanvasRenderingContext2D, note: string) {
  ctx.textAlign = "center";
  ctx.fillStyle = C.soft;
  ctx.font = `400 26px ${SERIF}`;
  ctx.fillText(note, W / 2, H - 140);
  ctx.font = `400 24px ${SERIF}`;
  ctx.fillText(SITE, W / 2, H - 96);
}

function drawPillars(ctx: CanvasRenderingContext2D, d: PillarCardData) {
  header(ctx);
  ctx.textAlign = "center";
  ctx.fillStyle = C.ink;
  ctx.font = `700 56px ${SERIF}`;
  wrap(ctx, d.title, W - 220).forEach((l, i) => ctx.fillText(l, W / 2, 290 + i * 72));

  const colW = 200;
  const left = (W - colW * 4) / 2;
  const top = 450;
  d.columns.forEach((c, i) => {
    const cx = left + colW * i + colW / 2;
    if (c.isDay && c.stem) sealBox(ctx, cx - 82, top, 164);
    ctx.font = `150px ${BRUSH}`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = c.isDay ? C.sealText : c.stem ? C.ink : "#b5ab9c";
    ctx.fillText(c.stem ?? "?", cx, top + 86);
    ctx.fillStyle = c.branch ? C.ink : "#b5ab9c";
    ctx.fillText(c.branch ?? "?", cx, top + 260);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 60, top + 360);
    ctx.lineTo(cx + 60, top + 360);
    ctx.stroke();
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = C.soft;
    ctx.font = `400 30px ${SERIF}`;
    ctx.fillText(c.label, cx, top + 405);
  });

  ctx.fillStyle = C.ink2;
  ctx.font = `400 36px ${SERIF}`;
  wrap(ctx, d.subline, W - 240).slice(0, 3).forEach((l, i) => ctx.fillText(l, W / 2, 970 + i * 56));
  footer(ctx, d.footnote);
}

function drawDay(ctx: CanvasRenderingContext2D, d: DayCardData) {
  header(ctx);
  ctx.textAlign = "center";
  ctx.fillStyle = C.soft;
  ctx.font = `400 32px ${SERIF}`;
  ctx.fillText(d.dateLabel, W / 2, 260);

  // 일진 두 글자를 세로로
  ctx.fillStyle = C.ink;
  ctx.font = `230px ${BRUSH}`;
  ctx.textBaseline = "middle";
  ctx.fillText(d.iljin[0] ?? "", W / 2, 440);
  ctx.fillText(d.iljin[1] ?? "", W / 2, 670);

  sealBox(ctx, W / 2 - 70, 820, 140);
  ctx.fillStyle = C.sealText;
  ctx.font = `76px ${BRUSH}`;
  ctx.fillText(String(d.score), W / 2, 892);
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = C.ink;
  ctx.font = `700 40px ${SERIF}`;
  wrap(ctx, d.headline, W - 240).slice(0, 3).forEach((l, i) => ctx.fillText(l, W / 2, 1040 + i * 58));
  footer(ctx, d.footnote);
}

export async function renderCard(data: CardData): Promise<Blob> {
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  paper(ctx);
  if (data.kind === "pillars") drawPillars(ctx, data);
  else drawDay(ctx, data);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했습니다"))), "image/png"));
}

/** 휴대폰은 공유 시트, 아니면 파일 저장 */
export async function shareOrSave(blob: Blob, filename: string, title: string): Promise<"shared" | "saved"> {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "shared";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "saved";
}
