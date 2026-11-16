// Default dataset for fallback / offline development
module.exports = [
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
