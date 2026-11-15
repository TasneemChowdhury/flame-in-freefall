const fs = require("fs");
const path = require("path");

const csvPath = path.resolve(__dirname, "../../database/flex_test_runs.csv");

let cachedRuns = null;

function loadFlexRuns() {
  if (cachedRuns) return cachedRuns;

  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const raw = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  const runs = [];

  for (let i = 1; i < raw.length; i++) {
    const parts = raw[i].split(",");
    const testNum = parseInt(parts[0], 10);
    const identifier = parts[1]?.trim() || `TEST-${testNum}`;
    const testDate = parts[2]?.trim() || null;
    const testGmt = parts[3]?.trim() || null;
    const fuel = parts[4]?.trim() || "Unknown";
    const pMmHg = parseFloat(parts[5]);
    const pAtm = !isNaN(pMmHg) && pMmHg > 0 ? Number((pMmHg / 760).toFixed(3)) : null;
    const o2 = parseFloat(parts[6]);
    const n2 = parseFloat(parts[7]);
    const co2 = parseFloat(parts[8]);
    const he = parseFloat(parts[9]);
    const d0 = parseFloat(parts[10]);
    const dext = parseFloat(parts[11]);
    const k = parseFloat(parts[12]);
    const burnTime = parseFloat(parts[13]?.replace("~", ""));
    const testEnd = parts[14]?.trim() || "Unknown";

    // Extinction ratio d_ext / d0
    const extinctionRatio =
      !isNaN(dext) && !isNaN(d0) && d0 > 0 ? Number((dext / d0).toFixed(3)) : null;

    runs.push({
      test_number: testNum,
      flex_identifier: identifier,
      test_date: testDate,
      test_gmt: testGmt,
      fuel,
      ambient_pressure_mmhg: isNaN(pMmHg) ? null : pMmHg,
      ambient_pressure_atm: pAtm,
      o2_mole_fraction: isNaN(o2) ? null : o2,
      n2_mole_fraction: isNaN(n2) ? null : n2,
      co2_mole_fraction: isNaN(co2) ? null : co2,
      he_mole_fraction: isNaN(he) ? null : he,
      droplet_initial_dia_mm: isNaN(d0) ? null : d0,
      visible_extinction_dia_mm: isNaN(dext) ? null : dext,
      extinction_ratio: extinctionRatio,
      burning_rate_mm2_s: isNaN(k) ? null : k,
      burn_time_s: isNaN(burnTime) ? null : burnTime,
      test_end: testEnd,
    });
  }

  cachedRuns = runs;
  return runs;
}

function getFlexSummary() {
  const runs = loadFlexRuns();
  const total = runs.length;

  const byFuel = {};
  const byOutcome = {};
  let totalD0 = 0, countD0 = 0;
  let totalDext = 0, countDext = 0;
  let totalK = 0, countK = 0;
  let totalTime = 0, countTime = 0;

  runs.forEach((r) => {
    byFuel[r.fuel] = (byFuel[r.fuel] || 0) + 1;
    byOutcome[r.test_end] = (byOutcome[r.test_end] || 0) + 1;

    if (r.droplet_initial_dia_mm != null) {
      totalD0 += r.droplet_initial_dia_mm;
      countD0++;
    }
    if (r.visible_extinction_dia_mm != null) {
      totalDext += r.visible_extinction_dia_mm;
      countDext++;
    }
    if (r.burning_rate_mm2_s != null) {
      totalK += r.burning_rate_mm2_s;
      countK++;
    }
    if (r.burn_time_s != null) {
      totalTime += r.burn_time_s;
      countTime++;
    }
  });

  return {
    investigation: "PSI-69 FLEX",
    total_test_runs: total,
    fuel_breakdown: byFuel,
    outcome_breakdown: byOutcome,
    averages: {
      initial_diameter_mm: countD0 > 0 ? Number((totalD0 / countD0).toFixed(2)) : null,
      extinction_diameter_mm: countDext > 0 ? Number((totalDext / countDext).toFixed(2)) : null,
      burning_rate_mm2_s: countK > 0 ? Number((totalK / countK).toFixed(3)) : null,
      burn_time_s: countTime > 0 ? Number((totalTime / countTime).toFixed(1)) : null,
    },
    ranges: {
      pressure_atm: [0.69, 3.05],
      o2_mole_fraction: [0.12, 0.34],
      co2_diluent_mole_fraction: [0.0, 0.7],
      he_diluent_mole_fraction: [0.0, 0.45],
      droplet_initial_dia_mm: [1.1, 4.67],
      visible_extinction_dia_mm: [0.12, 4.6],
      burning_rate_mm2_s: [0.05, 1.06],
      burn_time_s: [0.3, 39.2],
    },
  };
}

module.exports = {
  loadFlexRuns,
  getFlexSummary,
};
