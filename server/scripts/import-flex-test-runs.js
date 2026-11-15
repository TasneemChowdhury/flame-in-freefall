const path = require("node:path");
const fs = require("node:fs");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const db = require("../database/connection");

const csvPath = path.resolve(
  __dirname,
  "..",
  "..",
  "database",
  "flex_test_runs.csv"
);

async function main() {
  console.log("Loading FLEX test runs from CSV...");
  const content = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  const headers = content[0].split(",");

  // 1. Get PSI-69 investigation ID
  const { data: investigation, error: invError } = await db
    .from("investigations")
    .select("id")
    .eq("acronym", "PSI-69")
    .limit(1)
    .maybeSingle();

  if (invError) {
    throw invError;
  }

  const investigationId = investigation ? investigation.id : null;
  console.log(`Using investigation_id: ${investigationId} for PSI-69 FLEX`);

  const rows = [];
  for (let i = 1; i < content.length; i++) {
    const parts = content[i].split(",");
    const testNum = parseInt(parts[0], 10);
    const identifier = parts[1].trim();
    const dateStr = parts[2].trim() || null;
    const timeStr = parts[3]?.trim() || null;
    const fuel = parts[4].trim();
    const pMmHg = parseFloat(parts[5]);
    const pAtm = !isNaN(pMmHg) && pMmHg > 0 ? Number((pMmHg / 760).toFixed(4)) : null;
    const o2 = parseFloat(parts[6]);
    const n2 = parseFloat(parts[7]);
    const co2 = parseFloat(parts[8]);
    const he = parseFloat(parts[9]);
    const d0 = parseFloat(parts[10]);
    const dext = parseFloat(parts[11]);
    const k = parseFloat(parts[12]);
    const burnTime = parseFloat(parts[13]?.replace("~", ""));
    const testEnd = parts[14]?.trim() || "Unknown";

    rows.push({
      investigation_id: investigationId,
      test_number: testNum,
      flex_identifier: identifier,
      test_date: dateStr,
      test_gmt: timeStr,
      fuel: fuel,
      ambient_pressure_mmhg: isNaN(pMmHg) ? null : pMmHg,
      ambient_pressure_atm: pAtm,
      o2_mole_fraction: isNaN(o2) ? null : o2,
      n2_mole_fraction: isNaN(n2) ? null : n2,
      co2_mole_fraction: isNaN(co2) ? null : co2,
      he_mole_fraction: isNaN(he) ? null : he,
      droplet_initial_dia_mm: isNaN(d0) ? null : d0,
      visible_extinction_dia_mm: isNaN(dext) ? null : dext,
      burning_rate_mm2_s: isNaN(k) ? null : k,
      burn_time_s: isNaN(burnTime) ? null : burnTime,
      test_end: testEnd,
    });
  }

  console.log(`Parsed ${rows.length} test runs. Upserting into Supabase flex_test_runs table in batches...`);

  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { data, error } = await db
      .from("flex_test_runs")
      .upsert(batch, { onConflict: "test_number" })
      .select("id");

    if (error) {
      throw error;
    }
    inserted += data ? data.length : batch.length;
  }

  console.log(`Successfully imported/upserted ${inserted} FLEX test runs into Supabase!`);
}

main().catch((err) => {
  console.error("FLEX test import failed:", err);
  process.exitCode = 1;
});
