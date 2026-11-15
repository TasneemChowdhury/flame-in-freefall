# Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data

A web-based, Scientific Intelligence (SI) powered dashboard for exploring and comparing NASA Physical Sciences Informatics (PSI) microgravity combustion research for the **2026 NASA Space Apps Challenge**.

---

## Technology Stack

* **Database:** Supabase (PostgreSQL with Row Level Security)
* **Backend:** Node.js, Express.js (`@supabase/supabase-js`, REST comparison & SI synthesis endpoints)
* **Frontend:** React 19, Vite, Vanilla CSS design system
* **AI / SI Layer:** Gemini API / SI Combustion Physics Engine

---

## Database Architecture

The database utilizes a normalized relational schema to store and compare diverse microgravity investigations without hardcoding experiment-specific columns:

1. **`investigations` (Master table):**
   * `id`, `acronym` (`'PSI-69'`, `'PSI-68'`, `'BASS'`, `'Saffire-I'`, `'CFI-G'`)
   * `full_name`, `fire_safety_pillar` (`'Prevention'`, `'Detection'`, `'Suppression'`)
   * `fuel_domain` (`'Solid'`, `'Liquid'`, `'Gaseous'`), `hardware_rack` (`'CIR'`, `'MSG'`, `'CIR / MDCA'`, `'Cygnus Flow Duct'`)
   * `space_application` (`'Lunar Base'`, `'Mars Transit'`, `'Spacesuit'`)
   * `research_question`, `relevance_score`, `description`

2. **`investigation_parameters` (Flexible numerical ranges for side-by-side comparison):**
   * `id`, `investigation_id` (FK), `parameter_name` (e.g. `'Pressure (atm)'`, `'Oxygen Mole Fraction'`, `'Initial Droplet Size (mm)'`)
   * `min_value`, `max_value`, `unit`

3. **`investigation_ai_insights` (AI summaries & scenario rankings):**
   * `id`, `investigation_id` (FK), `scenario_tag` (e.g. `'Lunar Base >= 30% O2'`, `'Mars Transit Microgravity'`, `'Spacesuit'`)
   * `comparative_summary`, `safety_insight`

4. **`experiments` & `sensor_readings`:**
   * High-resolution sensor time-series for detailed test runs (e.g., SAFFIRE-I Sample 1).

---

## Supabase Database Setup

1. Open your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run these files in order:
   * [`database/schema.sql`](file:///c:/Users/saral/OneDrive/Documents/Hackathons/flame-in-freefall/database/schema.sql): Creates the master tables, indexes, triggers, and public SELECT policies.
   * [`database/seed.sql`](file:///c:/Users/saral/OneDrive/Documents/Hackathons/flame-in-freefall/database/seed.sql): Populates the 5 core NASA investigations (**PSI-69 FLEX**, **PSI-68 FLEX-2**, **BASS**, **Saffire-I**, and **CFI-G**), their empirical parameters, and mission scenario AI insights.
   * [`database/flex_test_runs.sql`](file:///c:/Users/saral/OneDrive/Documents/Hackathons/flame-in-freefall/database/flex_test_runs.sql): Creates and populates the 274 authentic NASA PSI-69 FLEX flight test runs (fuels, pressures, $O_2$, $CO_2$ & $He$ suppressants, droplet diameters, and extinction limits).
   * *(Optional)* [`database/saffire_sample1_metadata.sql`](file:///c:/Users/saral/OneDrive/Documents/Hackathons/flame-in-freefall/database/saffire_sample1_metadata.sql) & [`database/saffire_sensor_readings.sql`](file:///c:/Users/saral/OneDrive/Documents/Hackathons/flame-in-freefall/database/saffire_sensor_readings.sql) if you wish to query sample-level sensor telemetry.

3. Copy `.env.example` to `server/.env` and verify your credentials:
   ```env
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY
   GEMINI_API_KEY=YOUR_OPTIONAL_GEMINI_API_KEY
   ```

---

## Backend Setup & API Endpoints

In a terminal:

```bash
cd server
npm install
npm run db:import-flex      # (Optional) Imports all 274 FLEX test runs via HTTPS API
npm run db:import-sensors   # (Optional) Imports Saffire-I sensor readings
npm run dev
```

The server starts at `http://localhost:5001`. Key API endpoints:

* `GET /api/db-test`: Verifies connection to Supabase (or reports fallback mode).
* `GET /api/investigations`: Lists investigations with query filters (`?pillar=Suppression`, `?fuel=Liquid`, `?scenario=Lunar Base >= 30% O2`, `?min_o2=0.30`).
* `GET /api/compare?acronyms=PSI-69,PSI-68`: Pivots and normalizes numerical parameters and AI insights into a side-by-side comparison matrix.
* `GET /api/scenarios`: Returns available exploration mission scenario tags.
* `POST /api/si-synthesis`: Generates an AI / Scientific Intelligence comparative synthesis report using Gemini or the deterministic combustion synthesis engine.

---

## Frontend Setup

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` to interact with:
* **Research Library:** Filter and search investigations by fire safety pillar, fuel domain, or hardware rack.
* **Cross-Experiment Comparison Matrix:** Select any combination of studies (e.g. *FLEX vs. FLEX-2*, or *Liquid vs. Solid vs. Gas*), choose an exploration mission scenario (e.g. *Lunar Base ≥30% O₂*), and compare pressure limits, droplet sizes, LOI, and extinction regimes side-by-side with visual range bars.
* **SI Synthesis Engine:** Inspect the generated scientific intelligence prompt, run synthesis queries, and receive actionable habitat fire safety engineering recommendations.

---

## Team

* Tasneem Sultana Chowdhury
* Sara Loudagh

Developed as part of the **NASA Space Apps Challenge 2026**.
