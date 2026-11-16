/**
 * Supabase Client & Query Service for NASA Space Apps "Flame in Freefall"
 * Handles fetching, filtering, and cross-experiment comparison logic.
 */

// Default mock investigations fallback data for instant preview or offline mode
export const FALLBACK_INVESTIGATIONS = [
  {
    id: 1,
    nasa_id: "PSI-69",
    acronym: "PSI-69",
    full_name: "Flame Extinguishment Experiment (FLEX)",
    title: "PSI-69 FLEX",
    fire_safety_pillar: "Suppression",
    fuel_domain: "Liquid",
    hardware_rack: "CIR / MDCA",
    space_application: "Lunar Base",
    relevance_score: 94,
    description:
      "Studies spherical droplet combustion, limiting oxygen index (LOI), and extinction limits of isolated liquid fuel droplets using inert gaseous suppressants (CO2, He, SF6) in microgravity.",
    research_question:
      "What are the spherical droplet extinction limits and effective suppressant concentrations in freefall without natural buoyant convection?",
    investigation_parameters: [
      { parameter_name: "Pressure (atm)", min_value: 0.69, max_value: 3.05, unit: "atm" },
      { parameter_name: "Oxygen Mole Fraction", min_value: 0.12, max_value: 0.34, unit: "fraction" },
      { parameter_name: "Initial Droplet Size (mm)", min_value: 1.1, max_value: 4.67, unit: "mm" },
      { parameter_name: "CO2 Diluent Mole Fraction", min_value: 0.0, max_value: 0.7, unit: "fraction" },
      { parameter_name: "He Diluent Mole Fraction", min_value: 0.0, max_value: 0.45, unit: "fraction" },
      { parameter_name: "Visible Extinction Diameter (mm)", min_value: 0.12, max_value: 4.6, unit: "mm" },
      { parameter_name: "Burning Rate Constant K (mm/s)", min_value: 0.05, max_value: 1.06, unit: "mm/s" },
      { parameter_name: "Burn Duration (s)", min_value: 0.3, max_value: 39.2, unit: "s" },
    ],
    investigation_ai_insights: [
      {
        scenario_tag: "Lunar Base >= 30% O2",
        comparative_summary:
          "At elevated oxygen mole fractions (>=0.30) anticipated for Lunar exploration habitats (8.2 psia normoxic), single liquid droplets exhibit 40% higher burning rates and substantially reduced extinction diameters.",
        safety_insight:
          "Terrestrial fire suppressant concentrations will underperform in high-O2 lunar habitats. CO2 and Helium inerting systems require at least 25% higher partial pressure to trigger radiative extinction before liquid droplets initiate secondary combustible spread.",
      },
      {
        scenario_tag: "Mars Transit Microgravity",
        comparative_summary:
          "In stagnant microgravity without forced air currents, lingering vapor clouds surround burning droplets, favoring diffusive and radiative extinction at larger droplet cutoffs than under 1g.",
        safety_insight:
          "Liquid fuel leaks in deep-space transit vehicles develop spherical diffusion flames that resist directional blast extinguishers; closing cabin ventilation and flooding with gaseous suppressants (CO2/He) is the most effective containment.",
      },
    ],
  },
  {
    id: 2,
    nasa_id: "PSI-68",
    acronym: "PSI-68",
    full_name: "Flame Extinguishment Experiment-2 (FLEX-2)",
    title: "PSI-68 FLEX-2",
    fire_safety_pillar: "Suppression",
    fuel_domain: "Liquid",
    hardware_rack: "CIR / MDCA",
    space_application: "Mars Transit",
    relevance_score: 96,
    description:
      "Expands droplet combustion to multi-droplet interactive arrays, bi-component fuels, soot-shell formation, and elevated pressures up to 3.0 atm.",
    research_question:
      "How do interactive droplet arrays, soot shells, and fuel volatility differentials affect burning rate and extinction under elevated pressures?",
    investigation_parameters: [
      { parameter_name: "Pressure (atm)", min_value: 0.5, max_value: 3.0, unit: "atm" },
      { parameter_name: "Oxygen Mole Fraction", min_value: 0.17, max_value: 0.3, unit: "fraction" },
      { parameter_name: "Initial Droplet Size (mm)", min_value: 1.5, max_value: 5.0, unit: "mm" },
      { parameter_name: "Chamber Flow Velocity (cm/s)", min_value: 0.1, max_value: 5.0, unit: "cm/s" },
      { parameter_name: "Droplet Spacing Ratio (d/d0)", min_value: 1.5, max_value: 5.0, unit: "ratio" },
      { parameter_name: "Soot Volume Fraction (ppm)", min_value: 0.0001, max_value: 0.008, unit: "ppm" },
      { parameter_name: "Burning Rate Constant K (mm2/s)", min_value: 0.35, max_value: 1.15, unit: "mm^2/s" },
    ],
    investigation_ai_insights: [
      {
        scenario_tag: "Lunar Base >= 30% O2",
        comparative_summary:
          "FLEX-2 proved that bi-component fuels and interactive droplet arrays exhibit delayed extinction up to 3.0 atm and >=30% O2 because insulating soot shells trap fuel vapor and retard radiative cooling.",
        safety_insight:
          "Pressurized lunar compartments with high oxygen concentrations cannot rely on single-droplet extinction models. Fuel mist or hydraulic leaks create droplet arrays where soot shells protect flames; sustained suppressant blankets are required.",
      },
      {
        scenario_tag: "Mars Transit Microgravity",
        comparative_summary:
          "Multi-droplet arrays burn with merged spherical flame envelopes in microgravity, reducing single-droplet burning rates but extending total combustion duration by up to 2.5x compared to solitary droplets.",
        safety_insight:
          "Suppression protocols for transit propellant bays must account for prolonged persistence of multi-droplet clusters and secondary autoignition when soot shells break down.",
      },
    ],
  },
  {
    id: 3,
    nasa_id: "BASS-II",
    acronym: "BASS",
    full_name: "Burning and Suppression of Solids (BASS / BASS-II)",
    title: "BASS Burning and Suppression of Solids",
    fire_safety_pillar: "Prevention",
    fuel_domain: "Solid",
    hardware_rack: "MSG",
    space_application: "Lunar Base",
    relevance_score: 98,
    description:
      "Evaluates solid material flammability, limiting oxygen index, and flame extinction through air cessation or quenchant deployment inside the Microgravity Science Glovebox.",
    research_question:
      "What are the critical airflow and oxygen boundaries that allow solid materials to self-extinguish or sustain combustion in low gravity?",
    investigation_parameters: [
      { parameter_name: "Pressure (atm)", min_value: 0.8, max_value: 1.02, unit: "atm" },
      { parameter_name: "Oxygen Mole Fraction", min_value: 0.16, max_value: 0.3, unit: "fraction" },
      { parameter_name: "Airflow Velocity (cm/s)", min_value: 0.5, max_value: 5.5, unit: "cm/s" },
      { parameter_name: "Fuel Sample Thickness (mm)", min_value: 0.1, max_value: 2.5, unit: "mm" },
      { parameter_name: "Flame Spread Rate (cm/s)", min_value: 0.05, max_value: 1.2, unit: "cm/s" },
      { parameter_name: "Limiting Oxygen Index (LOI)", min_value: 0.13, max_value: 0.19, unit: "fraction" },
    ],
    investigation_ai_insights: [
      {
        scenario_tag: "Lunar Base >= 30% O2",
        comparative_summary:
          "In elevated oxygen environments (>=30% O2), solid materials such as PMMA and Nomex ignite with significantly lower ignition energies and sustain steady flame spread against gentle flows (1–3 cm/s) with near-zero char barrier.",
        safety_insight:
          "NASA-STD-6001 Test 1 terrestrial upward flammability screening is non-conservative for exploration atmospheres. Materials rated self-extinguishing at 21% O2 terrestrial undergo steady burning in microgravity at 30% O2; habitat material catalogs must be requalified using microgravity LOI data.",
      },
      {
        scenario_tag: "Spacesuit",
        comparative_summary:
          "Under pure oxygen or high-O2 spacesuit pre-breathe conditions, solid fuel combustion is dominated by radiative feedback; even minuscule convective drafts cause runaway flame propagation.",
        safety_insight:
          "Spacesuit architectures require minimization of exposed polymers and immediate depressurization/nitrogen flush interlocks upon any thermal or trace gas trigger.",
      },
    ],
  },
  {
    id: 4,
    nasa_id: "SAFFIRE-I",
    acronym: "Saffire-I",
    full_name: "Spacecraft Fire Safety Demonstration - I (Saffire-I)",
    title: "SAFFIRE-I",
    fire_safety_pillar: "Prevention",
    fuel_domain: "Solid",
    hardware_rack: "Cygnus Flow Duct",
    space_application: "Mars Transit",
    relevance_score: 95,
    description:
      "First realistic large-scale solid fabric combustion test (1.0 m x 0.4 m SIBAL cloth) conducted inside an uncrewed Cygnus resupply spacecraft post-ISS departure.",
    research_question:
      "Do large-scale solid flames reach steady-state propagation or self-extinguish in a spacecraft cabin flow duct?",
    investigation_parameters: [
      { parameter_name: "Pressure (atm)", min_value: 0.7, max_value: 1.0, unit: "atm" },
      { parameter_name: "Oxygen Mole Fraction", min_value: 0.2, max_value: 0.24, unit: "fraction" },
      { parameter_name: "Airflow Velocity (cm/s)", min_value: 15.0, max_value: 25.0, unit: "cm/s" },
      { parameter_name: "Sample Dimensions - Length (m)", min_value: 0.4, max_value: 1.0, unit: "m" },
      { parameter_name: "Flame Spread Rate (cm/s)", min_value: 0.15, max_value: 0.85, unit: "cm/s" },
      { parameter_name: "Peak Flame Temperature (C)", min_value: 650.0, max_value: 1050.0, unit: "C" },
    ],
    investigation_ai_insights: [
      {
        scenario_tag: "Mars Transit Microgravity",
        comparative_summary:
          "Saffire-I proved that large-scale solid fabrics (1.0 m x 0.4 m SIBAL cloth) develop steady, sustained flame fronts in microgravity with forced ventilation (20 cm/s), overturning assumptions that large fires self-extinguish.",
        safety_insight:
          "Spacecraft HVAC ducting acts as a combustion superhighway in microgravity. Automated fire interlocks must instantly cut cabin ventilation fans upon alarm to eliminate convective oxygen delivery to the flame front.",
      },
      {
        scenario_tag: "Lunar Base >= 30% O2",
        comparative_summary:
          "Scaling Saffire-I data to 30%+ oxygen environments indicates a threefold increase in heat release rate and toxic gas generation (CO, HCN) along cabin airflow paths.",
        safety_insight:
          "Zonal atmospheric isolation barriers and automated smoke dampers are essential for lunar modules to prevent rapid life-support contamination from solid surface fires.",
      },
    ],
  },
  {
    id: 5,
    nasa_id: "ACME-CFI-G",
    acronym: "CFI-G",
    full_name: "Cool Flames Investigation with Gases (ACME CFI-G)",
    title: "CFI-G Cool Flames Investigation with Gases",
    fire_safety_pillar: "Prevention",
    fuel_domain: "Gaseous",
    hardware_rack: "CIR",
    space_application: "Lunar Base",
    relevance_score: 89,
    description:
      "Explores low-temperature (600–1000 K) gaseous cool flames and autoignition limits across wide oxygen concentrations (up to 85% O2) in the Combustion Integrated Rack.",
    research_question:
      "Can quasi-steady cool flames persist in microgravity, and what are their flammability and quenching boundaries at high oxygen fractions?",
    investigation_parameters: [
      { parameter_name: "Pressure (atm)", min_value: 0.5, max_value: 2.0, unit: "atm" },
      { parameter_name: "Oxygen Mole Fraction", min_value: 0.15, max_value: 0.85, unit: "fraction" },
      { parameter_name: "Burner Diameter (mm)", min_value: 6.0, max_value: 12.0, unit: "mm" },
      { parameter_name: "Flame Temperature (K)", min_value: 600.0, max_value: 1200.0, unit: "K" },
      { parameter_name: "Quenching Limit O2 Fraction", min_value: 0.14, max_value: 0.25, unit: "fraction" },
      { parameter_name: "Radiant Output (W)", min_value: 0.05, max_value: 2.5, unit: "W" },
    ],
    investigation_ai_insights: [
      {
        scenario_tag: "Lunar Base >= 30% O2",
        comparative_summary:
          "CFI-G revealed that in high-oxygen environments (30% to 85% O2), gaseous cool flames persist quasi-steadily at low temperatures (600–1000 K) with near-zero visible radiation.",
        safety_insight:
          "Ghost flames are an invisible hazard in oxygen-enriched Lunar habitats: standard thermal and visual optical fire detectors fail to register cool flames, yet they can ignite secondary combustible solids or gas leaks. Multispectral UV/IR and catalytic gas sensors are essential.",
      },
      {
        scenario_tag: "Mars Transit Microgravity",
        comparative_summary:
          "Absence of buoyant convection in microgravity enables low-temperature chemical reaction zones to stabilize indefinitely without blowing off.",
        safety_insight:
          "Post-fire suppression inspection must verify cool flame extinction using chemical sampling before crew re-enters or restores cabin ventilation.",
      },
    ],
  },
];

/**
 * Filter investigations in-memory based on mission scenario and parameter ranges
 */
export function filterInvestigations(items, { pillar, fuel, scenario, minO2, maxPressure, search } = {}) {
  return items.filter((inv) => {
    // Pillar
    if (pillar && pillar !== "All studies" && inv.fire_safety_pillar !== pillar) {
      return false;
    }
    // Fuel domain
    if (fuel && fuel !== "All fuels" && inv.fuel_domain?.toLowerCase() !== fuel.toLowerCase()) {
      return false;
    }
    // Mission scenario tag
    if (scenario && scenario !== "All scenarios") {
      const matchesScenario = inv.investigation_ai_insights?.some(
        (ins) => ins.scenario_tag?.toLowerCase() === scenario.toLowerCase()
      );
      if (!matchesScenario) return false;
    }
    // Numerical O2 filter (e.g. minO2=0.30 for Lunar Base >=30% O2)
    if (minO2) {
      const o2Param = inv.investigation_parameters?.find((p) =>
        p.parameter_name.toLowerCase().includes("oxygen")
      );
      if (!o2Param || o2Param.max_value < minO2) {
        return false;
      }
    }
    // Numerical Pressure filter (e.g. maxPressure=1.5)
    if (maxPressure) {
      const pParam = inv.investigation_parameters?.find((p) =>
        p.parameter_name.toLowerCase().includes("pressure")
      );
      if (!pParam || pParam.min_value > maxPressure) {
        return false;
      }
    }
    // Search query
    if (search) {
      const q = search.trim().toLowerCase();
      const searchable = [
        inv.acronym,
        inv.full_name,
        inv.title,
        inv.description,
        inv.hardware_rack,
        inv.fuel_domain,
        inv.fire_safety_pillar,
        inv.space_application,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Fetch all investigations from API (proxied to backend or Supabase) with offline fallback
 */
export async function fetchInvestigations(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.pillar && filters.pillar !== "All studies") params.append("pillar", filters.pillar);
    if (filters.fuel) params.append("fuel", filters.fuel);
    if (filters.scenario) params.append("scenario", filters.scenario);
    if (filters.minO2) params.append("min_o2", filters.minO2);
    if (filters.search) params.append("search", filters.search);

    const res = await fetch(`/api/investigations?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("API fetch unavailable; using client fallback data:", err.message);
  }

  return filterInvestigations(FALLBACK_INVESTIGATIONS, filters);
}

/**
 * Build cross-experiment comparison matrix from selected items
 */
export function buildComparisonMatrix(selectedInvestigations, activeScenario = "Lunar Base >= 30% O2") {
  if (!selectedInvestigations || selectedInvestigations.length === 0) {
    return { matrix: [], scenarioInsights: [] };
  }

  const parameterMap = new Map();

  selectedInvestigations.forEach((inv) => {
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

  const scenarioInsights = selectedInvestigations.map((inv) => {
    const matched =
      (inv.investigation_ai_insights || []).find(
        (ins) => ins.scenario_tag.toLowerCase() === activeScenario.toLowerCase()
      ) || (inv.investigation_ai_insights || [])[0];

    return {
      acronym: inv.acronym,
      full_name: inv.full_name,
      scenario_tag: matched?.scenario_tag || activeScenario,
      comparative_summary:
        matched?.comparative_summary || "Baseline microgravity parameter data recorded.",
      safety_insight:
        matched?.safety_insight || "Follow standard NASA-STD-6001 fire containment guidelines.",
    };
  });

  return {
    matrix: Array.from(parameterMap.values()),
    scenarioInsights,
  };
}

/**
 * Generate standard SI synthesis prompt for the selected experiments
 */
export function generateSISynthesisPrompt({ selectedExperiments, scenario, userQuery }) {
  const targetScenario = scenario || "Lunar Base >= 30% O2";
  const names = selectedExperiments.map((e) => e.acronym).join(" vs. ");

  const context = selectedExperiments
    .map((inv) => {
      const params = (inv.investigation_parameters || [])
        .map((p) => `    * ${p.parameter_name}: ${p.min_value} to ${p.max_value} ${p.unit}`)
        .join("\n");
      const insight = (inv.investigation_ai_insights || []).find(
        (ins) => ins.scenario_tag.toLowerCase() === targetScenario.toLowerCase()
      );
      return `### [${inv.acronym}] ${inv.full_name}
  * Pillar: ${inv.fire_safety_pillar} | Fuel Domain: ${inv.fuel_domain} | Hardware: ${inv.hardware_rack}
  * Space Application: ${inv.space_application}
  * Measured Physical Parameters:
${params}
  * Scenario Insight (${targetScenario}):
    "${insight ? insight.safety_insight : "Standard microgravity baseline."}"`;
    })
    .join("\n\n");

  return `You are the Scientific Intelligence (SI) Combustion Engine for the NASA Space Apps Challenge: "Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data".

Synthesize cross-experiment combustion physics and safety thresholds for the following exploration mission scenario:

MISSION SCENARIO: ${targetScenario}
RESEARCH OBJECTIVE: ${userQuery || "Compare extinction mechanisms, flammability boundaries, and mitigation protocols across the selected investigations."}

COMPARISON TARGETS (${names}):
${context}

REQUIRED SCIENTIFIC INTELLIGENCE OUTPUT:
1. Cross-Investigation Parameter Boundary Divergence:
   - Contrast pressure ranges, oxygen mole fractions, and physical burning scales.
2. Freefall Physical Mechanics & Extinction Phenomena:
   - Compare spherical droplet diffusion, soot-shell radiation trapping, cool flame reactions, or solid flame propagation under low convective flow.
3. Mission Scenario Risk Assessment for ${targetScenario}:
   - Detail why terrestrial safety standards (e.g. NASA-STD-6001 Test 1) are inadequate under these specific oxygen and gravity boundaries.
4. Actionable Habitat Fire Safety Recommendations:
   - Detection wavelengths (multispectral UV/IR vs trace catalytic sniffers), ventilation isolation interlocks, and gaseous suppressant concentrations (CO2/He/SF6).`;
}

/**
 * Send SI synthesis request to API with fallback synthesis engine
 */
export async function requestSISynthesis({ acronyms, scenario, userQuery, selectedExperiments }) {
  let fallbackReason;
  try {
    const res = await fetch("/api/si-synthesis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acronyms,
        scenario,
        user_query: userQuery,
      }),
    });
    const data = await res.json();
    if (res.ok && data.synthesis) {
      return data;
    }
    fallbackReason = res.ok
      ? "The SI backend response did not include a synthesis."
      : `The SI backend returned HTTP ${res.status}.`;
  } catch (err) {
    console.warn("SI API request failed; generating a client-side prototype response:", err);
    fallbackReason = "The SI backend is unavailable. Check that the server is running.";
  }

  // Client-side prototype response for use when the SI backend is unavailable.
  const prompt = generateSISynthesisPrompt({
    selectedExperiments,
    scenario,
    userQuery,
  });

  const targets = acronyms.join(" vs. ");
  const synthesis = `### SI Comparative Synthesis: ${targets} (${scenario})

#### 1. Cross-Investigation Parameter Boundary Divergence
* **Pressure & Droplet Envelope:** FLEX (PSI-69) and FLEX-2 (PSI-68) provide direct microgravity droplet extinction mapping from 0.50 up to 3.00 atm. At elevated pressure, soot shell formation insulates burning droplets, delaying radiative extinction compared to solitary sub-atmospheric droplets.
* **Oxygen Enrichment Dynamics:** Tested O₂ fractions extend up to 0.85 in CFI-G cool flames and 0.40 in FLEX-2. In the ${scenario} regime (≥30% O₂), the Limiting Oxygen Index (LOI) shifts downward: both solid fabrics (BASS / Saffire) and gaseous cool flames maintain self-sustaining combustion at lower threshold energies.

#### 2. Microgravity Physical Mechanisms in Freefall
* **Absence of Buoyant Convection:** Lacking upward plume dissipation, hot combustion products linger spherically around the fuel source. For liquid droplets, this creates an insulating vapor shield; for solid fuels (Saffire-I), forced airflow (15–25 cm/s) becomes the sole convective driver feeding the flame front.
* **Invisible Cool Flame Reactions (CFI-G):** CFI-G proved that low-temperature quasi-steady reactions (600–1000 K) stabilize indefinitely without incandescent soot emission, evading conventional optical flame detectors.

#### 3. Mission Scenario Risk Assessment (${scenario})
* **Extinction Envelope Narrowing:** At ≥30% O₂, inert gas suppressants (CO₂ or He) require at least 25% higher partial pressure to achieve diffusive extinction.
* **Terrestrial Standard Gap:** NASA-STD-6001 terrestrial tests fail to anticipate slow-flow sustained burning of fabrics and droplet cloud soot-trapping in microgravity.

#### 4. Actionable Fire Safety Architecture Recommendations
1. **Multispectral Detection:** Deploy combined optical (UV/IR) and catalytic gas sensors to catch non-luminous cool flames.
2. **Ventilation Interlocks:** Implement rapid automated HVAC duct cut-offs upon first alarm to deprive large-scale solid flame fronts of forced airflow.
3. **Calibrated Suppressant Discharge:** Size total-flooding CO₂ or He suppression systems for the elevated 30%+ oxygen partial pressure envelope.`;

  return {
    status: "fallback",
    prompt,
    synthesis,
    meta: {
      investigations: acronyms,
      scenario,
      timestamp: new Date().toISOString(),
      provider: "client-fallback",
      warning: fallbackReason,
    },
  };
}
