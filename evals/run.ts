// Runs every synthetic letter through the real decode pipeline and scores the
// extraction. Costs a few cents per run.
//
//   npm run eval            score all cases, write evals/results.md
//   npm run eval -- --cache also save results as instant demo samples
import { readFileSync, writeFileSync } from "node:fs";
import { decodeLetter } from "../lib/decode";
import { SAMPLES } from "../lib/samples";
import { CASES } from "./cases";
import { extractionAccuracy, type Score, scoreCase } from "./score";

const tick = (ok: boolean) => (ok ? "✅" : "❌");

async function main() {
  const cache = process.argv.includes("--cache");
  const sampleIds = new Set(SAMPLES.map((s) => s.id));
  const rows: string[] = [];
  const scores: Score[] = [];
  let totalCost = 0;

  for (const c of CASES) {
    const pdf = readFileSync(`public/samples/${c.id}.pdf`).toString("base64");
    const result = await decodeLetter(pdf, "application/pdf");
    if (!result.ok) {
      console.log(`${c.id}: FAILED (${result.reason})`);
      rows.push(`| ${c.title} | failed: ${result.reason} | | | | |`);
      scores.push({
        language: false,
        urgency: false,
        deadlinesFound: 0,
        deadlinesExpected: c.expected.deadlines.length,
        amountsFound: 0,
        amountsExpected: c.expected.amounts.length,
      });
      continue;
    }

    const s = scoreCase(c.expected, result.analysis);
    scores.push(s);
    totalCost += result.usage.costUsd ?? 0;
    console.log(`${c.id}: deadlines ${s.deadlinesFound}/${s.deadlinesExpected}, amounts ${s.amountsFound}/${s.amountsExpected}`);
    rows.push(
      `| ${c.title} | ${tick(s.language)} | ${s.deadlinesFound}/${s.deadlinesExpected} | ${s.amountsFound}/${s.amountsExpected} | ${tick(
        s.urgency,
      )} ${result.analysis.urgency} | ${(result.usage.ms / 1000).toFixed(1)}s |`,
    );

    if (cache && sampleIds.has(c.id)) {
      writeFileSync(`public/samples/${c.id}.json`, JSON.stringify({ analysis: result.analysis, usage: null }, null, 2));
    }
  }

  const accuracy = extractionAccuracy(scores);
  const urgencyHits = scores.filter((s) => s.urgency).length;
  const report = `# Eval results

Run on ${new Date().toISOString().slice(0, 10)} against ${CASES.length} synthetic letters (see \`evals/cases.ts\`).

**Extraction accuracy (deadlines + amounts): ${(accuracy * 100).toFixed(0)}%** · Urgency agreement: ${urgencyHits}/${
    scores.length
  } · Total cost: $${totalCost.toFixed(3)}

| Letter | Language | Deadlines | Amounts | Urgency | Time |
|---|---|---|---|---|---|
${rows.join("\n")}
`;
  writeFileSync("evals/results.md", report);
  console.log(`\nExtraction accuracy: ${(accuracy * 100).toFixed(0)}%. Report written to evals/results.md`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
