import React, { useState, useEffect, useMemo } from 'react'
import './FlexRunsViewer.css'

const FLEX2_SAMPLES = [
  {
    sample: 'IsoOctane (pure)',
    category: 'Pure Fuel',
    d0: '1.5 – 5.0 mm',
    gas: 'O₂/N₂ or O₂/He',
    o2: '0.17, 0.21, 0.25, 0.30',
    pressures: '0.5, 1.0, 1.5, 2.0, 3.0 atm',
    temp: '25°C',
    velocity: '0.1 – 5.0 cm/s',
    purpose: 'Baseline high-octane single-component alkane droplet extinction.',
  },
  {
    sample: 'n-Octane (pure)',
    category: 'Pure Fuel',
    d0: '1.5 – 5.0 mm',
    gas: 'O₂/N₂ or O₂/He',
    o2: '0.17, 0.21, 0.25, 0.30',
    pressures: '0.5, 1.0, 1.5, 2.0, 3.0 atm',
    temp: '25°C',
    velocity: '0.1 – 5.0 cm/s',
    purpose: 'Straight-chain alkane comparing isomeric effects against IsoOctane.',
  },
  {
    sample: 'Heptane (pure)',
    category: 'Pure Fuel',
    d0: '1.5 – 5.0 mm',
    gas: 'O₂/N₂ or O₂/He',
    o2: '0.17, 0.21, 0.25, 0.30',
    pressures: '0.5, 1.0, 1.5, 2.0, 3.0 atm',
    temp: '25°C',
    velocity: '0.1 – 5.0 cm/s',
    purpose: 'Direct bridge reference connecting FLEX-1 Heptane tests to FLEX-2 elevated pressures.',
  },
  {
    sample: 'Decane (pure)',
    category: 'Pure Fuel',
    d0: '1.5 – 5.0 mm',
    gas: 'O₂/N₂ or O₂/He',
    o2: '0.17, 0.21, 0.25, 0.30',
    pressures: '0.5, 1.0, 1.5, 2.0, 3.0 atm',
    temp: '25°C',
    velocity: '0.1 – 5.0 cm/s',
    purpose: 'Heavy hydrocarbon investigating intense soot-shell radiative cooling in microgravity.',
  },
  {
    sample: 'Ethanol (pure)',
    category: 'Pure Fuel',
    d0: '1.5 – 5.0 mm',
    gas: 'O₂/N₂ or O₂/He',
    o2: '0.17, 0.21, 0.25, 0.30',
    pressures: '0.5, 1.0, 1.5, 2.0, 3.0 atm',
    temp: '25°C',
    velocity: '0.1 – 5.0 cm/s',
    purpose: 'Oxygenated alcohol with zero visible soot, isolating gas-phase chemical extinction.',
  },
  {
    sample: 'Propanol (95%) Glycerol (5%) (mixture)',
    category: 'Binary Mixture',
    d0: '1.5 – 5.0 mm',
    gas: 'O₂/N₂ or O₂/He',
    o2: '0.17, 0.21, 0.25, 0.30',
    pressures: '0.5, 1.0, 1.5, 2.0, 3.0 atm',
    temp: '25°C',
    velocity: '0.1 – 5.0 cm/s',
    purpose: 'Volatility differential testing: high-volatility alcohol skin over low-volatility core.',
  },
  {
    sample: 'Heptane (50%) IsoOctane (50%) (mixture)',
    category: 'Binary Mixture',
    d0: '1.5 – 5.0 mm',
    gas: 'O₂/N₂ or O₂/He',
    o2: '0.17, 0.21, 0.25, 0.30',
    pressures: '0.5, 1.0, 1.5, 2.0, 3.0 atm',
    temp: '25°C',
    velocity: '0.1 – 5.0 cm/s',
    purpose: 'Primary Reference Fuel (PRF-50) simulating real multi-component aviation/spacecraft fuels.',
  },
  {
    sample: 'Propanol (80%) Glycerol (20%) (mixture)',
    category: 'Binary Mixture',
    d0: '1.5 – 5.0 mm',
    gas: 'O₂/N₂ or O₂/He',
    o2: '0.17, 0.21, 0.25, 0.30',
    pressures: '0.5, 1.0, 1.5, 2.0, 3.0 atm',
    temp: '25°C',
    velocity: '0.1 – 5.0 cm/s',
    purpose: 'High-viscosity differential testing internal micro-explosions and puffing extinction.',
  },
]

export default function FlexRunsViewer() {
  const [activeStudy, setActiveStudy] = useState('FLEX') // 'FLEX', 'FLEX2', 'EVOLUTION'
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [fuelFilter, setFuelFilter] = useState('All')
  const [outcomeFilter, setOutcomeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [diluentFilter, setDiluentFilter] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 15

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/flex/runs')
        if (res.ok) {
          const json = await res.json()
          if (json.runs && json.runs.length > 0) {
            setRuns(json.runs)
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn('API fetch failed, loading fallback runs:', err)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Filtering for FLEX-1
  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      if (fuelFilter !== 'All' && r.fuel !== fuelFilter) return false
      if (outcomeFilter !== 'All' && r.test_end !== outcomeFilter) return false
      if (diluentFilter === 'CO2' && (!r.co2_mole_fraction || r.co2_mole_fraction <= 0)) return false
      if (diluentFilter === 'He' && (!r.he_mole_fraction || r.he_mole_fraction <= 0)) return false
      if (
        diluentFilter === 'Baseline' &&
        ((r.co2_mole_fraction && r.co2_mole_fraction > 0) ||
          (r.he_mole_fraction && r.he_mole_fraction > 0))
      )
        return false

      if (search) {
        const q = search.trim().toLowerCase()
        const text = [r.flex_identifier, r.fuel, r.test_end, String(r.test_number)]
          .join(' ')
          .toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [runs, fuelFilter, outcomeFilter, diluentFilter, search])

  // Summary statistics for FLEX-1
  const stats = useMemo(() => {
    const total = filteredRuns.length
    const extinctions = filteredRuns.filter((r) => r.test_end === 'Extinction').length
    const disruptions = filteredRuns.filter((r) => r.test_end === 'Disruption').length
    const completions = filteredRuns.filter((r) => r.test_end === 'Completion').length

    let sumD0 = 0, countD0 = 0
    let sumDext = 0, countDext = 0
    let sumK = 0, countK = 0

    filteredRuns.forEach((r) => {
      if (r.droplet_initial_dia_mm != null) {
        sumD0 += r.droplet_initial_dia_mm
        countD0++
      }
      if (r.visible_extinction_dia_mm != null) {
        sumDext += r.visible_extinction_dia_mm
        countDext++
      }
      if (r.burning_rate_mm2_s != null) {
        sumK += r.burning_rate_mm2_s
        countK++
      }
    })

    return {
      total,
      extinctionPct: total > 0 ? Math.round((extinctions / total) * 100) : 0,
      disruptionPct: total > 0 ? Math.round((disruptions / total) * 100) : 0,
      completionPct: total > 0 ? Math.round((completions / total) * 100) : 0,
      avgD0: countD0 > 0 ? (sumD0 / countD0).toFixed(2) : '—',
      avgDext: countDext > 0 ? (sumDext / countDext).toFixed(2) : '—',
      avgK: countK > 0 ? (sumK / countK).toFixed(3) : '—',
    }
  }, [filteredRuns])

  // Pagination for FLEX-1
  const totalPages = Math.ceil(filteredRuns.length / pageSize) || 1
  const paginatedRuns = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRuns.slice(start, start + pageSize)
  }, [filteredRuns, page])

  return (
    <section className="flex-runs-container" id="flex-runs">
      {/* Top Header & Study Mode Selector */}
      <div className="flex-runs-head">
        <div className="runs-head-top">
          <div>
            <div className="runs-eyebrow">
              <span className="eyebrow-line" /> EMPIRICAL NASA PSI RESEARCH REPOSITORY
            </div>
            <h2 className="runs-title">
              {activeStudy === 'FLEX' && 'PSI-69 FLEX: 274 Droplet Flight Runs'}
              {activeStudy === 'FLEX2' && 'PSI-68 FLEX-2: Multi-Component Experimental Matrix'}
              {activeStudy === 'EVOLUTION' && 'FLEX vs. FLEX-2: Cross-Investigation Flight Evolution'}
            </h2>
            <p className="runs-subtitle">
              {activeStudy === 'FLEX' &&
                '274 authentic microgravity droplet combustion runs in the Combustion Integrated Rack (CIR), testing Methanol and Heptane under CO₂ and He inerting.'}
              {activeStudy === 'FLEX2' &&
                'PSI-68 expanded microgravity droplet research to pure alkanes, bi-component fuel mixtures, elevated pressures up to 3.0 atm, and forced chamber flows.'}
              {activeStudy === 'EVOLUTION' &&
                'Direct parameter-by-parameter evolution from single-fuel isolated droplet extinction (FLEX) to multi-droplet arrays, soot-shell trapping, and bi-component fuels (FLEX-2).'}
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div className="study-tabs">
            <button
              type="button"
              className={`study-tab-btn ${activeStudy === 'FLEX' ? 'active' : ''}`}
              onClick={() => setActiveStudy('FLEX')}
            >
              FLEX-1 (274 Tests)
            </button>
            <button
              type="button"
              className={`study-tab-btn ${activeStudy === 'FLEX2' ? 'active' : ''}`}
              onClick={() => setActiveStudy('FLEX2')}
            >
              FLEX-2 (Test Matrix)
            </button>
            <button
              type="button"
              className={`study-tab-btn ${activeStudy === 'EVOLUTION' ? 'active' : ''}`}
              onClick={() => setActiveStudy('EVOLUTION')}
            >
              FLEX vs. FLEX-2 Contrast
            </button>
          </div>
        </div>

        {/* KPI stats for FLEX-1 */}
        {activeStudy === 'FLEX' && (
          <div className="flex-kpi-grid">
            <div className="flex-kpi-card">
              <span className="kpi-label">FILTERED TESTS</span>
              <strong className="kpi-val">
                {stats.total} <small>/ 274</small>
              </strong>
            </div>
            <div className="flex-kpi-card highlight">
              <span className="kpi-label">EXTINCTION RATE</span>
              <strong className="kpi-val">{stats.extinctionPct}%</strong>
            </div>
            <div className="flex-kpi-card">
              <span className="kpi-label">MEAN D₀</span>
              <strong className="kpi-val">
                {stats.avgD0} <small>mm</small>
              </strong>
            </div>
            <div className="flex-kpi-card">
              <span className="kpi-label">MEAN D_EXT</span>
              <strong className="kpi-val">
                {stats.avgDext} <small>mm</small>
              </strong>
            </div>
            <div className="flex-kpi-card">
              <span className="kpi-label">MEAN BURNING RATE (K)</span>
              <strong className="kpi-val">
                {stats.avgK} <small>mm/s</small>
              </strong>
            </div>
          </div>
        )}

        {/* KPI stats for FLEX-2 */}
        {activeStudy === 'FLEX2' && (
          <div className="flex-kpi-grid">
            <div className="flex-kpi-card">
              <span className="kpi-label">TESTED SAMPLES</span>
              <strong className="kpi-val">8 Fuels</strong>
            </div>
            <div className="flex-kpi-card highlight">
              <span className="kpi-label">MAX PRESSURE</span>
              <strong className="kpi-val">3.0 atm</strong>
            </div>
            <div className="flex-kpi-card">
              <span className="kpi-label">O₂ MOLE FRACTIONS</span>
              <strong className="kpi-val">17% – 30%</strong>
            </div>
            <div className="flex-kpi-card">
              <span className="kpi-label">DROPLET SIZE (D₀)</span>
              <strong className="kpi-val">1.5 – 5.0 mm</strong>
            </div>
            <div className="flex-kpi-card">
              <span className="kpi-label">CHAMBER FLOW VELOCITY</span>
              <strong className="kpi-val">0.1 – 5.0 cm/s</strong>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: FLEX-1 (274 Tests Table) */}
      {activeStudy === 'FLEX' && (
        <>
          <div className="runs-filter-bar">
            <div className="runs-search">
              <input
                type="search"
                placeholder="Search identifier (e.g. 20CAL08, C08M101)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            <div className="filter-chip-group">
              <span className="chip-group-label">FUEL:</span>
              {['All', 'Methanol', 'Heptane'].map((f) => (
                <button
                  type="button"
                  key={f}
                  className={`filter-chip ${fuelFilter === f ? 'active' : ''}`}
                  onClick={() => {
                    setFuelFilter(f)
                    setPage(1)
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="filter-chip-group">
              <span className="chip-group-label">OUTCOME:</span>
              {['All', 'Extinction', 'Disruption', 'Completion'].map((o) => (
                <button
                  type="button"
                  key={o}
                  className={`filter-chip ${outcomeFilter === o ? 'active' : ''}`}
                  onClick={() => {
                    setOutcomeFilter(o)
                    setPage(1)
                  }}
                >
                  {o}
                </button>
              ))}
            </div>

            <div className="filter-chip-group">
              <span className="chip-group-label">SUPPRESSANT:</span>
              {['All', 'CO2', 'He', 'Baseline'].map((d) => (
                <button
                  type="button"
                  key={d}
                  className={`filter-chip ${diluentFilter === d ? 'active' : ''}`}
                  onClick={() => {
                    setDiluentFilter(d)
                    setPage(1)
                  }}
                >
                  {d === 'CO2'
                    ? 'CO₂ Inert'
                    : d === 'He'
                    ? 'He Inert'
                    : d === 'Baseline'
                    ? 'No Diluent'
                    : 'All Atmospheres'}
                </button>
              ))}
            </div>
          </div>

          <div className="runs-table-wrapper">
            <table className="runs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Test Identifier</th>
                  <th>Date / GMT</th>
                  <th>Fuel</th>
                  <th>Pressure</th>
                  <th>O₂ Mole Frac</th>
                  <th>Diluent (CO₂ / He)</th>
                  <th>Init Dia (d₀)</th>
                  <th>Extinction Dia</th>
                  <th>Burning Rate (K)</th>
                  <th>Burn Time</th>
                  <th>Test End Outcome</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRuns.map((r) => {
                  const outcomeClass = (r.test_end || 'unknown').toLowerCase()
                  const hasCO2 = r.co2_mole_fraction > 0
                  const hasHe = r.he_mole_fraction > 0

                  return (
                    <tr key={r.test_number}>
                      <td className="mono-num">{String(r.test_number).padStart(3, '0')}</td>
                      <td className="test-id-cell">
                        <strong>{r.flex_identifier}</strong>
                      </td>
                      <td className="date-cell">
                        <span>{r.test_date || '—'}</span>
                        <small>{r.test_gmt || ''}</small>
                      </td>
                      <td>
                        <span className={`fuel-tag fuel-${r.fuel?.toLowerCase()}`}>
                          {r.fuel}
                        </span>
                      </td>
                      <td className="mono-num">
                        {r.ambient_pressure_atm != null ? `${r.ambient_pressure_atm} atm` : '—'}
                        <small>
                          {r.ambient_pressure_mmhg ? `(${r.ambient_pressure_mmhg} mmHg)` : ''}
                        </small>
                      </td>
                      <td className="mono-num bold">
                        {r.o2_mole_fraction != null ? r.o2_mole_fraction : '—'}
                      </td>
                      <td>
                        {hasCO2 && (
                          <span className="diluent-tag co2">CO₂: {r.co2_mole_fraction}</span>
                        )}
                        {hasHe && (
                          <span className="diluent-tag he">He: {r.he_mole_fraction}</span>
                        )}
                        {!hasCO2 && !hasHe && (
                          <span className="diluent-tag baseline">N₂ Balance</span>
                        )}
                      </td>
                      <td className="mono-num bold">
                        {r.droplet_initial_dia_mm != null ? `${r.droplet_initial_dia_mm} mm` : '—'}
                      </td>
                      <td className="mono-num">
                        {r.visible_extinction_dia_mm != null ? (
                          <span className="ext-val">{r.visible_extinction_dia_mm} mm</span>
                        ) : (
                          <span className="muted-dash">—</span>
                        )}
                      </td>
                      <td className="mono-num">
                        {r.burning_rate_mm2_s != null ? `${r.burning_rate_mm2_s} mm/s` : '—'}
                      </td>
                      <td className="mono-num">
                        {r.burn_time_s != null ? `${r.burn_time_s} s` : '—'}
                      </td>
                      <td>
                        <span className={`outcome-badge outcome-${outcomeClass}`}>
                          {r.test_end}
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {paginatedRuns.length === 0 && (
                  <tr>
                    <td colSpan={12} className="no-runs-msg">
                      {loading
                        ? 'Loading 274 NASA FLEX flight records...'
                        : 'No test runs matched your filter criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="runs-pagination">
            <span className="page-summary">
              Showing {paginatedRuns.length} of {filteredRuns.length} test runs (Page {page} of{' '}
              {totalPages})
            </span>
            <div className="page-buttons">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: FLEX-2 (PSI-68 Official Experimental Matrix) */}
      {activeStudy === 'FLEX2' && (
        <div className="flex2-matrix-section">
          <div className="flex2-banner">
            <span className="badge-tag">NASA PSI-68</span>
            <h3>FLEX-2 Pure Fuels &amp; Bi-Component Mixtures Experimental Matrix</h3>
            <p>
              Tested inside the Multi-user Droplet Combustion Apparatus (MDCA) in the CIR rack across systematic pressure steps (0.5, 1.0, 1.5, 2.0, 3.0 atm) and oxygen fractions (0.17 to 0.30) with convective flows from 0.1 to 5.0 cm/s.
            </p>
          </div>

          <div className="runs-table-wrapper">
            <table className="runs-table flex2-table">
              <thead>
                <tr>
                  <th>Sample / Fuel Type</th>
                  <th>Fuel Classification</th>
                  <th>Initial Droplet Diameter (d₀)</th>
                  <th>Ambient Gas Mixture</th>
                  <th>Oxygen Mole Fractions</th>
                  <th>Ambient Pressure (atm)</th>
                  <th>Flow Velocity</th>
                  <th>Research Objective &amp; Extinction Mechanism</th>
                </tr>
              </thead>
              <tbody>
                {FLEX2_SAMPLES.map((sample) => (
                  <tr key={sample.sample}>
                    <td className="sample-name-cell">
                      <strong>{sample.sample}</strong>
                    </td>
                    <td>
                      <span
                        className={`fuel-tag ${
                          sample.category === 'Binary Mixture' ? 'fuel-binary' : 'fuel-pure'
                        }`}
                      >
                        {sample.category}
                      </span>
                    </td>
                    <td className="mono-num bold">{sample.d0}</td>
                    <td>
                      <code>{sample.gas}</code>
                    </td>
                    <td className="mono-num">{sample.o2}</td>
                    <td className="mono-num bold">{sample.pressures}</td>
                    <td className="mono-num">{sample.velocity}</td>
                    <td className="purpose-cell">{sample.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Direct FLEX-1 vs FLEX-2 Evolutionary Contrast */}
      {activeStudy === 'EVOLUTION' && (
        <div className="evolution-grid">
          <div className="evolution-card flex1-side">
            <span className="card-kicker">FLEX (PSI-69) · FLIGHT BASELINE</span>
            <h4>Isolated Droplet Extinction &amp; Suppressant Dilution</h4>
            <ul>
              <li><strong>Fuels:</strong> Pure Methanol and pure Heptane.</li>
              <li><strong>Physical Regime:</strong> Isolated, solitary spherical droplets (d₀ = 1.1–4.7 mm) in quiescent microgravity.</li>
              <li><strong>Extinction Mapping:</strong> Limiting Oxygen Index (LOI) down to 12% O₂; gaseous suppression thresholds for CO₂ (up to 70%) and He (up to 45%).</li>
              <li><strong>Key Finding:</strong> Radiative flame extinction at finite droplet cutoff diameter (d_ext / d₀ ≈ 0.64) without convective blowoff.</li>
            </ul>
          </div>

          <div className="evolution-card flex2-side">
            <span className="card-kicker">FLEX-2 (PSI-68) · ADVANCED COMPLEXITY</span>
            <h4>Bi-Component Volatility, Soot Shells &amp; Multi-Droplet Clouds</h4>
            <ul>
              <li><strong>Fuels:</strong> 5 Pure Alkanes/Alcohols + 3 Binary Mixtures (Heptane/IsoOctane, Propanol/Glycerol).</li>
              <li><strong>Physical Regime:</strong> Droplet arrays (d/d₀ = 1.5–5.0), soot-shell formation, and forced flows (0.1–5.0 cm/s).</li>
              <li><strong>Pressure Envelope:</strong> Expanded to systematic hyperbaric steps up to 3.0 atm.</li>
              <li><strong>Key Finding:</strong> Soot shells trap vaporized fuel and insulate flames at elevated pressures, delaying radiative extinction and extending fire persistence by up to 2.5×.</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
