// Renders the synthetic letters in evals/cases.ts to PDFs in public/samples.
// Run with: npm run samples
import { mkdirSync, writeFileSync } from "node:fs";
import { PDFDocument, type PDFFont, rgb, StandardFonts } from "pdf-lib";
import { CASES } from "../evals/cases";

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 64;
const SIZE = 10.5;
const LEADING = 15;

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ")) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

async function render(c: (typeof CASES)[number]) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(c.title);
  pdf.setProducer("Paperwork Decoder sample generator");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([A4.width, A4.height]);
  const grey = rgb(0.4, 0.4, 0.4);

  let y = A4.height - MARGIN;
  const [name, ...rest] = c.letter.letterhead;
  page.drawText(name, { x: MARGIN, y, size: 12, font: bold });
  for (const line of rest) {
    y -= LEADING;
    page.drawText(line, { x: MARGIN, y, size: 9, font: regular, color: grey });
  }
  y -= 10;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4.width - MARGIN, y }, thickness: 0.5, color: grey });

  y -= 30;
  const dateWidth = regular.widthOfTextAtSize(c.letter.date, SIZE);
  page.drawText(c.letter.date, { x: A4.width - MARGIN - dateWidth, y, size: SIZE, font: regular });

  y -= 30;
  for (const line of wrap(c.letter.body, regular, SIZE, A4.width - MARGIN * 2)) {
    page.drawText(line, { x: MARGIN, y, size: SIZE, font: regular });
    y -= LEADING;
  }

  page.drawText("SAMPLE LETTER — ALL NAMES, NUMBERS AND ORGANISATIONS ARE FICTIONAL", {
    x: MARGIN,
    y: 36,
    size: 7,
    font: bold,
    color: rgb(0.7, 0.2, 0.2),
  });
  return pdf.save();
}

async function main() {
  mkdirSync("public/samples", { recursive: true });
  for (const c of CASES) {
    writeFileSync(`public/samples/${c.id}.pdf`, await render(c));
    console.log(`public/samples/${c.id}.pdf`);
  }
}

main();
