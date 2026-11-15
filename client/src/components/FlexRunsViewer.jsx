import React, { useState, useEffect, useMemo } from 'react'
import './FlexRunsViewer.css'

export default function FlexRunsViewer() {
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

      // If API unavailable, fetch or build fallback from sample
      setLoading(false)
    }
    loadData()
  }, [])

  // Filtering
  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      if (fuelFilter !== 'All' && r.fuel !== fuelFilter) return false
      if (outcomeFilter !== 'All' && r.test_end !== outcomeFilter) return false
      if (diluentFilter === 'CO2' && (!r.co2_mole_fraction || r.co2_mole_fraction <= 0)) return false
      if (diluentFilter === 'He' && (!r.he_mole_fraction || r.he_mole_fraction <= 0)) return false
      if (diluentFilter === 'Baseline' && ((r.co2_mole_fraction && r.co2_mole_fraction > 0) || (r.he_mole_fraction && r.he_mole_fraction > 0))) return false

      if (search) {
        const q = search.trim().toLowerCase()
        const text = [r.flex_identifier, r.fuel, r.test_end, String(r.test_number)].join(' ').toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [runs, fuelFilter, outcomeFilter, diluentFilter, search])

  // Summary statistics computed dynamically
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

  // Pagination
  const totalPages = Math.ceil(filteredRuns.length / pageSize) || 1
  const paginatedRuns = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRuns.slice(start, start + pageSize)
  }, [filteredRuns, page])

  return (
    <section className="flex-runs-container" id="flex-runs">
      <div className="flex-runs-head">
        <div>
          <div className="runs-eyebrow">
            <span className="eyebrow-line" /> EMPIRICAL MICROGRAVITY FLIGHT TELEMETRY
          </div>
          <h2 className="runs-title">PSI-69 FLEX: 274 Droplet Extinction Test Runs</h2>
          <p className="runs-subtitle">
            Authentic NASA flight experiment records mapping isolated droplet combustion, Limiting Oxygen Index (LOI), and gaseous suppressant inerting ($CO_2$ &amp; $He$).
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex-kpi-grid">
          <div className="flex-kpi-card">
            <span className="kpi-label">FILTERED TESTS</span>
            <strong className="kpi-val">{stats.total} <small>/ 274</small></strong>
          </div>
          <div className="flex-kpi-card highlight">
            <span className="kpi-label">EXTINCTION RATE</span>
            <strong className="kpi-val">{stats.extinctionPct}%</strong>
          </div>
          <div className="flex-kpi-card">
            <span className="kpi-label">MEAN D₀</span>
            <strong className="kpi-val">{stats.avgD0} <small>mm</small></strong>
          </div>
          <div className="flex-kpi-card">
            <span className="kpi-label">MEAN D_EXT</span>
            <strong className="kpi-val">{stats.avgDext} <small>mm</small></strong>
          </div>
          <div className="flex-kpi-card">
            <span className="kpi-label">MEAN BURNING RATE (K)</span>
            <strong className="kpi-val">{stats.avgK} <small>mm/s</small></strong>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="runs-filter-bar">
        {/* Search */}
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

        {/* Fuel Filter */}
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

        {/* Outcome Filter */}
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

        {/* Diluent Filter */}
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
              {d === 'CO2' ? 'CO₂ Inert' : d === 'He' ? 'He Inert' : d === 'Baseline' ? 'No Diluent' : 'All Atmospheres'}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Tests Table */}
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
                <tr key={r.flex_identifier || r.test_number}>
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
                    <small>{r.ambient_pressure_mmhg ? `(${r.ambient_pressure_mmhg} mmHg)` : ''}</small>
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
                  {loading ? 'Loading 274 NASA FLEX flight records...' : 'No test runs matched your filter criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="runs-pagination">
        <span className="page-summary">
          Showing {paginatedRuns.length} of {filteredRuns.length} test runs (Page {page} of {totalPages})
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
    </section>
  )
}
