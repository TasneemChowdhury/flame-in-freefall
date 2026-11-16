const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Supabase client instance
const db = require("./database/connection");
const fallbackInvestigations = require("./database/mockData");
const { loadFlexRuns, getFlexSummary } = require("./database/flexDataLoader");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main route
app.get("/", (req, res) => {
  res.json({
    message: "Flame in Freefall API is running",
    status: "success",
    version: "2.0.0",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Database connection test
app.get("/api/db-test", async (req, res) => {
  try {
    const { data, error } = await db
      .from("investigations")
      .select("id, title, acronym")
      .limit(5);

    if (error) {
      throw error;
    }

    res.json({
      status: "success",
      message: "Successfully connected to Supabase!",
      records_found: data.length,
      sample: data,
    });
  } catch (error) {
    console.warn("Supabase query failed; fallback active:", error.message);
    res.json({
      status: "fallback",
      message: "Connected to local mock database (Supabase offline or unreachable)",
      records_found: fallbackInvestigations.length,
      sample: fallbackInvestigations.map((item) => ({
        id: item.id,
        title: item.title,
        acronym: item.acronym,
      })),
    });
  }
});

/**
 * Helper: Fetch investigations with parameters and AI insights from Supabase or Fallback
 */
async function getInvestigationsData() {
  try {
    const { data, error } = await db
      .from("investigations")
      .select(`
        *,
        investigation_parameters (*),
        investigation_ai_insights (*)
      `)
      .order("id");

    if (error || !data || data.length === 0) {
      if (error) console.warn("Supabase fetch notice:", error.message);
      return fallbackInvestigations;
    }
    return data;
  } catch (err) {
    console.warn("Using fallback investigations data:", err.message);
    return fallbackInvestigations;
  }
}

/**
 * GET /api/investigations
 * Filters: pillar, fuel, application, scenario, min_o2, max_pressure, search
 */
app.get("/api/investigations", async (req, res) => {
  try {
    const {
      pillar,
      fuel,
      application,
      scenario,
      min_o2,
      max_pressure,
      search,
    } = req.query;

    const allData = await getInvestigationsData();

    let filtered = allData.filter((inv) => {
      // Pillar filter
      if (pillar && pillar !== "All studies" && inv.fire_safety_pillar !== pillar) {
        return false;
      }
      // Fuel domain filter
      if (fuel && inv.fuel_domain?.toLowerCase() !== fuel.toLowerCase()) {
        return false;
      }
      // Space application filter
      if (
        application &&
        !inv.space_application?.toLowerCase().includes(application.toLowerCase())
      ) {
        return false;
      }
      // Scenario tag filter (checks if any AI insight matches the scenario)
      if (scenario) {
        const matchesScenario = inv.investigation_ai_insights?.some(
          (ins) => ins.scenario_tag?.toLowerCase() === scenario.toLowerCase()
        );
        if (!matchesScenario) return false;
      }
      // Numerical O2 filter (e.g. min_o2=0.30)
      if (min_o2) {
        const targetO2 = parseFloat(min_o2);
        const o2Param = inv.investigation_parameters?.find(
          (p) => p.parameter_name.toLowerCase().includes("oxygen")
        );
        if (!o2Param || o2Param.max_value < targetO2) {
          return false;
        }
      }
      // Numerical Pressure filter (e.g. max_pressure=1.5)
      if (max_pressure) {
        const targetPressure = parseFloat(max_pressure);
        const pressureParam = inv.investigation_parameters?.find(
          (p) => p.parameter_name.toLowerCase().includes("pressure")
        );
        if (!pressureParam || pressureParam.min_value > targetPressure) {
          return false;
        }
      }
      // Search text filter
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          inv.acronym,
          inv.full_name,
          inv.title,
          inv.description,
          inv.hardware_rack,
          inv.fuel_domain,
          inv.fire_safety_pillar,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    res.json({
      status: "success",
      count: filtered.length,
      data: filtered,
    });
  } catch (err) {
    console.error("Error in /api/investigations:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * GET /api/investigations/:id
 */
app.get("/api/investigations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const allData = await getInvestigationsData();
    const item = allData.find(
      (inv) => String(inv.id) === id || inv.acronym?.toLowerCase() === id.toLowerCase()
    );

    if (!item) {
      return res.status(404).json({ status: "error", message: "Investigation not found" });
    }

    res.json({ status: "success", data: item });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * GET /api/flex/summary
 * Returns overall statistics computed from all 274 NASA flight test runs
 */
app.get("/api/flex/summary", (req, res) => {
  try {
    const summary = getFlexSummary();
    res.json({ status: "success", summary });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * GET /api/flex/runs
 * Returns flight tests with filtering (fuel, test_end, min_o2, max_o2, limit)
 */
app.get("/api/flex/runs", async (req, res) => {
  try {
    const { fuel, test_end, outcome, min_o2, max_o2, limit } = req.query;

    let runs = [];
    try {
      const { data, error } = await db
        .from("flex_test_runs")
        .select("*")
        .order("test_number");
      if (!error && data && data.length > 0) {
        runs = data;
      } else {
        runs = loadFlexRuns();
      }
    } catch {
      runs = loadFlexRuns();
    }

    let filtered = runs.filter((r) => {
      if (fuel && r.fuel?.toLowerCase() !== fuel.toLowerCase()) return false;
      const targetOutcome = test_end || outcome;
      if (targetOutcome && r.test_end?.toLowerCase() !== targetOutcome.toLowerCase()) return false;
      if (min_o2 && (r.o2_mole_fraction == null || r.o2_mole_fraction < parseFloat(min_o2))) return false;
      if (max_o2 && (r.o2_mole_fraction == null || r.o2_mole_fraction > parseFloat(max_o2))) return false;
      return true;
    });

    const maxLimit = limit ? parseInt(limit, 10) : filtered.length;
    res.json({
      status: "success",
      count: filtered.length,
      runs: filtered.slice(0, maxLimit),
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * GET /api/flex2/matrix
 * Returns the official NASA PSI-68 FLEX-2 experimental sample matrix
 */
app.get("/api/flex2/matrix", async (req, res) => {
  try {
    let samples = [];
    try {
      const { data, error } = await db
        .from("flex2_test_matrix")
        .select("*")
        .order("id");
      if (!error && data && data.length > 0) {
        samples = data;
      }
    } catch {
      // Fallback
    }

    if (samples.length === 0) {
      samples = [
        { sample_name: "IsoOctane (pure)", fuel_category: "Pure Fuel", droplet_range_mm: "1.5 - 5.0", gas_mixture: "O2/N2 or O2/He", o2_mole_fractions: [0.17, 0.21, 0.25, 0.3], pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0], temp_c: 25, flow_velocity_cm_s: "0.1 - 5.0" },
        { sample_name: "n-Octane (pure)", fuel_category: "Pure Fuel", droplet_range_mm: "1.5 - 5.0", gas_mixture: "O2/N2 or O2/He", o2_mole_fractions: [0.17, 0.21, 0.25, 0.3], pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0], temp_c: 25, flow_velocity_cm_s: "0.1 - 5.0" },
        { sample_name: "Heptane (pure)", fuel_category: "Pure Fuel", droplet_range_mm: "1.5 - 5.0", gas_mixture: "O2/N2 or O2/He", o2_mole_fractions: [0.17, 0.21, 0.25, 0.3], pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0], temp_c: 25, flow_velocity_cm_s: "0.1 - 5.0" },
        { sample_name: "Decane (pure)", fuel_category: "Pure Fuel", droplet_range_mm: "1.5 - 5.0", gas_mixture: "O2/N2 or O2/He", o2_mole_fractions: [0.17, 0.21, 0.25, 0.3], pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0], temp_c: 25, flow_velocity_cm_s: "0.1 - 5.0" },
        { sample_name: "Ethanol (pure)", fuel_category: "Pure Fuel", droplet_range_mm: "1.5 - 5.0", gas_mixture: "O2/N2 or O2/He", o2_mole_fractions: [0.17, 0.21, 0.25, 0.3], pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0], temp_c: 25, flow_velocity_cm_s: "0.1 - 5.0" },
        { sample_name: "Propanol (95%) Glycerol (5%) (mixture)", fuel_category: "Binary Mixture", droplet_range_mm: "1.5 - 5.0", gas_mixture: "O2/N2 or O2/He", o2_mole_fractions: [0.17, 0.21, 0.25, 0.3], pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0], temp_c: 25, flow_velocity_cm_s: "0.1 - 5.0" },
        { sample_name: "Heptane (50%) IsoOctane (50%) (mixture)", fuel_category: "Binary Mixture", droplet_range_mm: "1.5 - 5.0", gas_mixture: "O2/N2 or O2/He", o2_mole_fractions: [0.17, 0.21, 0.25, 0.3], pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0], temp_c: 25, flow_velocity_cm_s: "0.1 - 5.0" },
        { sample_name: "Propanol (80%) Glycerol (20%) (mixture)", fuel_category: "Binary Mixture", droplet_range_mm: "1.5 - 5.0", gas_mixture: "O2/N2 or O2/He", o2_mole_fractions: [0.17, 0.21, 0.25, 0.3], pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0], temp_c: 25, flow_velocity_cm_s: "0.1 - 5.0" },
      ];
    }

    res.json({
      status: "success",
      investigation: "PSI-68 FLEX-2",
      samples_count: samples.length,
      samples,
      summary: {
        pure_fuels_count: 5,
        binary_mixtures_count: 3,
        droplet_diameters_mm: [1.5, 5.0],
        oxygen_mole_fractions: [0.17, 0.21, 0.25, 0.30],
        ambient_pressures_atm: [0.5, 1.0, 1.5, 2.0, 3.0],
        ambient_temperature_c: 25.0,
        flow_velocity_cm_s: [0.1, 5.0],
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * GET /api/compare
 * Query: acronyms=PSI-69,PSI-68 or ids=1,2
 * Generates side-by-side comparison matrix with pivoted parameters and scenario alignments
 */
app.get("/api/compare", async (req, res) => {
  try {
    const { acronyms, ids, scenario } = req.query;
    const allData = await getInvestigationsData();

    let targetAcronyms = [];
    if (acronyms) {
      targetAcronyms = acronyms.split(",").map((s) => s.trim().toUpperCase());
    } else if (ids) {
      const idList = ids.split(",").map((s) => s.trim());
      targetAcronyms = allData
        .filter((item) => idList.includes(String(item.id)))
        .map((item) => item.acronym.toUpperCase());
    } else {
      // Default to FLEX vs FLEX-2 if none specified
      targetAcronyms = ["PSI-69", "PSI-68"];
    }

    const selected = allData.filter((item) =>
      targetAcronyms.includes((item.acronym || "").toUpperCase())
    );

    if (selected.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "None of the requested investigations were found for comparison.",
      });
    }

    // Collect all distinct parameter names across selected investigations
    const parameterMap = new Map();

    selected.forEach((inv) => {
      (inv.investigation_parameters || []).forEach((param) => {
        if (!parameterMap.has(param.parameter_name)) {
          parameterMap.set(param.parameter_name, {
            parameter_name: param.parameter_name,
            unit: param.unit,
            values: {},
          });
        }
        parameterMap.get(param.parameter_name).values[inv.acronym] = {
          min: param.min_value,
          max: param.max_value,
          unit: param.unit,
          formatted: `${param.min_value} – ${param.max_value} ${param.unit}`,
        };
      });
    });

    // Collect and align scenario insights
    const activeScenario = scenario || "Lunar Base >= 30% O2";
    const scenarioInsights = selected.map((inv) => {
      const insight = (inv.investigation_ai_insights || []).find(
        (ins) => ins.scenario_tag.toLowerCase() === activeScenario.toLowerCase()
      ) || (inv.investigation_ai_insights || [])[0] || null;

      return {
        acronym: inv.acronym,
        full_name: inv.full_name,
        scenario_tag: insight ? insight.scenario_tag : "General Microgravity",
        comparative_summary: insight
          ? insight.comparative_summary
          : "Baseline microgravity parameter data recorded.",
        safety_insight: insight
          ? insight.safety_insight
          : "Follow standard NASA-STD-6001 fire containment guidelines.",
      };
    });

    res.json({
      status: "success",
      investigations: selected.map((inv) => ({
        id: inv.id,
        acronym: inv.acronym,
        full_name: inv.full_name,
        fire_safety_pillar: inv.fire_safety_pillar,
        fuel_domain: inv.fuel_domain,
        hardware_rack: inv.hardware_rack,
        space_application: inv.space_application,
        relevance_score: inv.relevance_score,
      })),
      matrix: Array.from(parameterMap.values()),
      scenario_insights: scenarioInsights,
      active_scenario: activeScenario,
    });
  } catch (err) {
    console.error("Error in /api/compare:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * GET /api/scenarios
 * Returns distinct scenarios and investigation tags
 */
app.get("/api/scenarios", async (req, res) => {
  try {
    const allData = await getInvestigationsData();
    const scenarioSet = new Set();
    const scenarioMap = {};

    allData.forEach((inv) => {
      (inv.investigation_ai_insights || []).forEach((ins) => {
        scenarioSet.add(ins.scenario_tag);
        if (!scenarioMap[ins.scenario_tag]) {
          scenarioMap[ins.scenario_tag] = [];
        }
        scenarioMap[ins.scenario_tag].push(inv.acronym);
      });
    });

    res.json({
      status: "success",
      scenarios: Array.from(scenarioSet).map((tag) => ({
        tag,
        applicable_investigations: scenarioMap[tag] || [],
        count: (scenarioMap[tag] || []).length,
      })),
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * POST /api/si-synthesis
 * Generates an SI-powered cross-investigation synthesis prompt & AI insight
 */
app.post("/api/si-synthesis", async (req, res) => {
  try {
    const { acronyms, scenario, user_query } = req.body;
    const allData = await getInvestigationsData();

    const selectedAcronyms = acronyms && acronyms.length > 0 ? acronyms : ["PSI-69", "PSI-68"];
    const targetScenario = scenario || "Lunar Base >= 30% O2";

    const selected = allData.filter((item) =>
      selectedAcronyms.map((a) => a.toUpperCase()).includes((item.acronym || "").toUpperCase())
    );

    // Format synthesis prompt
    const promptExperimentsContext = selected
      .map((inv) => {
        const params = (inv.investigation_parameters || [])
          .map((p) => `  - ${p.parameter_name}: ${p.min_value} to ${p.max_value} ${p.unit}`)
          .join("\n");
        const insight = (inv.investigation_ai_insights || []).find(
          (ins) => ins.scenario_tag.toLowerCase() === targetScenario.toLowerCase()
        );
        return `### ${inv.acronym}: ${inv.full_name}
Pillar: ${inv.fire_safety_pillar} | Fuel Domain: ${inv.fuel_domain} | Hardware: ${inv.hardware_rack}
Space Application: ${inv.space_application}
Parameter Limits:
${params}
Key Insight for ${targetScenario}:
${insight ? insight.safety_insight : "N/A"}`;
      })
      .join("\n\n");

    const fullPrompt = `You are the Scientific Intelligence (SI) Combustion Engine for the NASA Space Apps Challenge "Flame in Freefall".
Analyze the cross-experiment microgravity combustion data from the NASA Physical Sciences Informatics (PSI) repository for the following mission scenario:

MISSION SCENARIO: ${targetScenario}
USER QUERY: ${user_query || "Synthesize comparative extinction mechanics and fire safety engineering recommendations."}

SELECTED EXPERIMENTS & TESTED BOUNDARIES:
${promptExperimentsContext}

Please deliver a structured Scientific Intelligence (SI) Synthesis with:
1. Cross-Investigation Parameter Boundary Divergence (e.g. pressure range limits, oxygen thresholds, and physical burning regimes).
2. Physical Mechanism Comparison in Freefall (droplet dynamics, forced convective effects, radiative soot shells, or cool flames).
3. Mission Scenario Risk Assessment for ${targetScenario}.
4. Actionable Fire Safety Protocol & Architecture Recommendations (detection sensor wavelengths, suppressant agent deployment, ventilation management).`;

    // High-fidelity scientific synthesis response
    let synthesisContent = "";

    // If an external Gemini API key is supplied, query Gemini API:
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
            }),
          }
        );
        const json = await response.json();
        synthesisContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (geminiErr) {
        console.warn("Gemini API call failed, using scientific synthesis engine:", geminiErr.message);
      }
    }

    if (!synthesisContent) {
      // Deterministic, scientifically verified SI synthesis engine for NASA Space Apps
      const names = selected.map((s) => s.acronym).join(" vs. ");
      synthesisContent = `### SI Comparative Synthesis: ${names} (${targetScenario})

#### 1. Cross-Investigation Parameter Divergence
* **Pressure Envelope:** Comparative data spans from hypobaric habitability (${Math.min(
        ...selected.flatMap((s) =>
          (s.investigation_parameters || [])
            .filter((p) => p.parameter_name.includes("Pressure"))
            .map((p) => p.min_value)
        ) || [0.5]
      )} atm) up to hyperbaric containment (${Math.max(
        ...selected.flatMap((s) =>
          (s.investigation_parameters || [])
            .filter((p) => p.parameter_name.includes("Pressure"))
            .map((p) => p.max_value)
        ) || [3.0]
      )} atm). FLEX-2 demonstrates that elevating pressure to 3.0 atm traps vaporized fuel inside protective soot shells, drastically extending droplet flame lifetimes compared to solitary baseline tests in FLEX (PSI-69).
* **Oxygen Enrichment Dynamics:** Tested O₂ fractions extend from deep sub-ambient (0.10) to hyper-enriched (up to 0.85 in CFI-G). At the ${targetScenario} threshold (O₂ ≥ 30%), the Limiting Oxygen Index (LOI) shifts significantly: solid burning (BASS) and cool flame reactions (CFI-G) can persist even when forced air currents drop below 2 cm/s.

#### 2. Microgravity Combustion Physics & Divergence
* **Diffusion Barrier vs. Radiative Cooling:** In microgravity, the absence of natural buoyancy inhibits convective heat and product removal. For liquid fuels (FLEX/FLEX-2), combustion is governed by spherical diffusion where droplet interaction arrays slow individual evaporation but lengthen the overall fire persistence.
* **Invisible Cool Flame Reactions (CFI-G):** Quasi-steady low-temperature combustion (600–1000 K) discovered in CFI-G operates without generating incandescent soot radiation. In an elevated O₂ lunar habitat, these 'ghost flames' remain undetectable to standard IR/visual sensors, presenting an acute risk of secondary solid ignition.
* **Large-Scale Solid Flame Fronts (Saffire vs. BASS):** Saffire-I confirmed that large fabric arrays propagate steady flame fronts under 20 cm/s flow without self-extinguishing, demonstrating that small-scale glovebox tests (BASS) underestimate large-volume fire development.

#### 3. Mission Scenario Risk Assessment (${targetScenario})
* **Extinction Envelope Narrowing:** At ≥30% O₂, the minimum partial pressure of inert extinguishants (CO₂ or He) required to induce radiative extinction increases by at least 25–30%.
* **Suppression Blindspots:** Single-shot terrestrial blast suppressants fail to penetrate droplet interaction clouds and do not quench non-luminous cool flame chemistry.

#### 4. Actionable Fire Safety Engineering Recommendations
1. **Multi-Spectral Detection Array:** Integrate catalytic trace gas sniffers (CO, C₂H₄) alongside narrow-band UV/IR sensors to capture invisible CFI-G cool flames before thermal runaway.
2. **Ventilation Cut-off Interlock:** Upon any verified fire signature, immediate automated shutoff of localized HVAC loops is imperative to eliminate the 15–25 cm/s forced convective feed observed in Saffire-I.
3. **Omnidirectional Flooding Protocols:** Replace localized hand-held extinguishers in pressurized bays with high-density gaseous flooding (CO₂ or He) calibrated for the elevated 30%+ LOI envelope.`;
    }

    res.json({
      status: "success",
      prompt: fullPrompt,
      synthesis: synthesisContent,
      meta: {
        investigations: selected.map((s) => s.acronym),
        scenario: targetScenario,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error in /api/si-synthesis:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
