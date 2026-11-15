import React, { useState, useMemo } from 'react'
import './ComparisonMatrix.css'
import {
  buildComparisonMatrix,
  generateSISynthesisPrompt,
  requestSISynthesis,
} from '../services/supabaseClient'

export default function ComparisonMatrix({
  allInvestigations = [],
  selectedAcronyms = ['PSI-69', 'PSI-68'],
  onToggleAcronym,
  onSelectPreset,
}) {
  const [activeScenario, setActiveScenario] = useState('Lunar Base >= 30% O2')
  const [userQuery, setUserQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [synthesisResult, setSynthesisResult] = useState(null)
  const [showRawPrompt, setShowRawPrompt] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  // Scenarios list
  const scenarios = [
    { id: 'Lunar Base >= 30% O2', label: 'Lunar Base (≥30% O₂, 8.2 psia)' },
    { id: 'Mars Transit Microgravity', label: 'Mars Transit (Microgravity Drift)' },
    { id: 'Spacesuit', label: 'Spacesuit / Hyperbaric Pre-Breathe' },
  ]

  // Filter selected investigations
  const selectedExperiments = useMemo(() => {
    return allInvestigations.filter((inv) => selectedAcronyms.includes(inv.acronym))
  }, [allInvestigations, selectedAcronyms])

  // Build matrix
  const { matrix, scenarioInsights } = useMemo(() => {
    return buildComparisonMatrix(selectedExperiments, activeScenario)
  }, [selectedExperiments, activeScenario])

  // Current prompt
  const currentPrompt = useMemo(() => {
    return generateSISynthesisPrompt({
      selectedExperiments,
      scenario: activeScenario,
      userQuery,
    })
  }, [selectedExperiments, activeScenario, userQuery])

  // Trigger SI synthesis
  async function handleRunSynthesis() {
    if (selectedExperiments.length === 0) return
    setIsGenerating(true)
    setSynthesisResult(null)

    try {
      const res = await requestSISynthesis({
        acronyms: selectedExperiments.map((e) => e.acronym),
        scenario: activeScenario,
        userQuery,
        selectedExperiments,
      })
      setSynthesisResult(res)
    } catch (err) {
      console.error('Synthesis error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  function handleCopyPrompt() {
    navigator.clipboard.writeText(currentPrompt)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  return (
    <section className="comparison-container" id="matrix">
      {/* Header & Mission Scenario Context */}
      <div className="matrix-header">
        <div>
          <div className="matrix-eyebrow">
            <span className="eyebrow-line" /> CROSS-INVESTIGATION SYNTHESIS
          </div>
          <h2 className="matrix-title">Microgravity Combustion Comparison Matrix</h2>
          <p className="matrix-subtitle">
            Side-by-side numerical parameter ranges, extinction limits, and SI-synthesized safety thresholds.
          </p>
        </div>

        {/* Quick Comparison Presets */}
        <div className="presets-group">
          <span className="presets-label">QUICK PRESETS:</span>
          <button
            type="button"
            className="preset-btn"
            onClick={() => onSelectPreset(['PSI-69', 'PSI-68'])}
          >
            FLEX vs. FLEX-2
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => onSelectPreset(['PSI-69', 'BASS', 'CFI-G'])}
          >
            Liquid · Solid · Gas
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => onSelectPreset(['BASS', 'Saffire-I'])}
          >
            BASS vs. Saffire
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => onSelectPreset(allInvestigations.map((i) => i.acronym))}
          >
            All 5 Studies
          </button>
        </div>
      </div>

      {/* Target Selector & Mission Scenario Bar */}
      <div className="matrix-controls-bar">
        {/* Experiment multi-selector chips */}
        <div className="experiment-chips">
          <span className="control-label">SELECT STUDIES ({selectedAcronyms.length}):</span>
          {allInvestigations.map((inv) => {
            const isSelected = selectedAcronyms.includes(inv.acronym)
            return (
              <button
                type="button"
                key={inv.acronym}
                className={`exp-chip ${isSelected ? 'active' : ''}`}
                onClick={() => onToggleAcronym(inv.acronym)}
                aria-pressed={isSelected}
              >
                <span className="chip-indicator" />
                <span className="chip-acronym">{inv.acronym}</span>
                <span className="chip-domain">{inv.fuel_domain}</span>
              </button>
            )
          })}
        </div>

        {/* Mission Scenario selector */}
        <div className="scenario-selector">
          <span className="control-label">MISSION SCENARIO:</span>
          <div className="scenario-buttons">
            {scenarios.map((sc) => (
              <button
                type="button"
                key={sc.id}
                className={`scenario-btn ${activeScenario === sc.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveScenario(sc.id)
                  setSynthesisResult(null)
                }}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Alert Banner */}
      {activeScenario.includes('>= 30% O2') && (
        <div className="scenario-alert-banner">
          <span className="alert-icon">⚡</span>
          <div>
            <strong>EXPLORATION THRESHOLD ALERT: HIGH OXYGEN CONCENTRATION (≥30% O₂)</strong>
            <p>
              Exploration habitat normoxic atmospheres (e.g. Lunar Gateway / Artemis Surface at 8.2 psia & 32% O₂) drastically reduce Limiting Oxygen Index (LOI) and accelerate droplet and solid burning rates. Standard terrestrial fire codes (NASA-STD-6001 Test 1 at 21% O₂) are non-conservative.
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Matrix Table */}
      {selectedExperiments.length > 0 ? (
        <div className="matrix-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="param-header-col">Physical Parameter / Metric</th>
                {selectedExperiments.map((inv) => (
                  <th key={inv.acronym} className="exp-header-col">
                    <div className="col-header-content">
                      <span className="col-acronym">{inv.acronym}</span>
                      <span className="col-fullname">{inv.full_name}</span>
                      <div className="col-badges">
                        <span className={`pillar-badge ${inv.fire_safety_pillar?.toLowerCase()}`}>
                          {inv.fire_safety_pillar}
                        </span>
                        <span className="domain-badge">{inv.fuel_domain} Fuel</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Architecture & Hardware Row */}
              <tr className="metadata-row">
                <td className="param-name-cell">
                  <strong>Hardware Rack & Facility</strong>
                  <small>PSI Experimental Rig</small>
                </td>
                {selectedExperiments.map((inv) => (
                  <td key={inv.acronym} className="param-value-cell hardware-cell">
                    <code>{inv.hardware_rack || 'CIR'}</code>
                  </td>
                ))}
              </tr>

              {/* Space Application Row */}
              <tr className="metadata-row">
                <td className="param-name-cell">
                  <strong>Primary Space Application</strong>
                  <small>Exploration Context</small>
                </td>
                {selectedExperiments.map((inv) => (
                  <td key={inv.acronym} className="param-value-cell">
                    <span className="app-tag">{inv.space_application || 'Microgravity Habitat'}</span>
                  </td>
                ))}
              </tr>

              {/* Numerical Range Rows */}
              {matrix.map((row) => {
                const isO2 = row.parameter_name.toLowerCase().includes('oxygen')
                const isPressure = row.parameter_name.toLowerCase().includes('pressure')

                return (
                  <tr key={row.parameter_name} className={isO2 ? 'highlight-o2-row' : ''}>
                    <td className="param-name-cell">
                      <strong>{row.parameter_name}</strong>
                      <small>Unit: {row.unit}</small>
                    </td>

                    {selectedExperiments.map((inv) => {
                      const val = row.values[inv.acronym]
                      if (!val) {
                        return (
                          <td key={inv.acronym} className="param-value-cell empty-cell">
                            <span className="not-measured">—</span>
                            <small>Not in parameter scope</small>
                          </td>
                        )
                      }

                      // Compute relative visual bar fill (normalized roughly for visual preview)
                      let pct = 50
                      if (isPressure) {
                        pct = Math.min(100, Math.round((val.max / 3.0) * 100))
                      } else if (isO2) {
                        pct = Math.min(100, Math.round((val.max / 0.85) * 100))
                      }

                      const exceedsO2Alert = isO2 && val.max >= 0.30

                      return (
                        <td key={inv.acronym} className="param-value-cell">
                          <div className="range-number-display">
                            <span className="range-val">{val.min}</span>
                            <span className="range-sep">to</span>
                            <span className="range-val bold">{val.max}</span>
                            <span className="range-unit">{val.unit}</span>
                          </div>

                          {/* Visual Range Indicator Bar */}
                          <div className="range-bar-track" title={`${val.min} - ${val.max} ${val.unit}`}>
                            <div
                              className={`range-bar-fill ${exceedsO2Alert ? 'o2-alert-fill' : ''}`}
                              style={{ width: `${Math.max(15, pct)}%` }}
                            />
                          </div>

                          {exceedsO2Alert && (
                            <span className="o2-indicator-badge">
                              Encompasses ≥ 30% O₂ Scenario
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}

              {/* Scenario-Specific Comparative AI Insights Row */}
              <tr className="insights-row-header">
                <td colSpan={selectedExperiments.length + 1}>
                  <div className="insights-subheading">
                    <span className="sparkle-icon">✦</span>
                    <strong>SCENARIO-ALIGNED AI SAFETY INSIGHTS: {activeScenario}</strong>
                  </div>
                </td>
              </tr>

              <tr className="insights-data-row">
                <td className="param-name-cell">
                  <strong>Comparative Physical Summary</strong>
                  <small>Extinction & Combustion Dynamics</small>
                </td>
                {scenarioInsights.map((insight) => (
                  <td key={insight.acronym} className="insight-cell">
                    <p className="insight-text">{insight.comparative_summary}</p>
                  </td>
                ))}
              </tr>

              <tr className="insights-data-row">
                <td className="param-name-cell">
                  <strong>Mission Safety & Mitigation Insight</strong>
                  <small>Critical Habitat Engineering Action</small>
                </td>
                {scenarioInsights.map((insight) => (
                  <td key={insight.acronym} className="insight-cell highlight-cell">
                    <p className="insight-text">{insight.safety_insight}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-selection-box">
          <p>Please select at least one investigation above to view the cross-experiment matrix.</p>
        </div>
      )}

      {/* SI Synthesis Prompt Engine Section */}
      <div className="si-synthesis-card">
        <div className="si-synthesis-head">
          <div className="si-synthesis-title-area">
            <span className="si-spark-icon">✨</span>
            <div>
              <h3>SI Scientific Intelligence Cross-Synthesis Engine</h3>
              <p>
                Synthesize boundary divergences and generate actionable habitat fire safety protocols using LLM / Gemini API.
              </p>
            </div>
          </div>

          <div className="si-actions-top">
            <button
              type="button"
              className="toggle-prompt-btn"
              onClick={() => setShowRawPrompt(!showRawPrompt)}
            >
              {showRawPrompt ? 'Hide SI Prompt' : 'Inspect SI Prompt'}
            </button>
            <button
              type="button"
              className="run-synthesis-btn"
              onClick={handleRunSynthesis}
              disabled={isGenerating || selectedExperiments.length === 0}
            >
              {isGenerating ? (
                <>
                  <span className="loading-spinner" /> Synthesizing Data...
                </>
              ) : (
                <>
                  <span>✦ Run SI Synthesis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom inquiry input */}
        <div className="synthesis-input-bar">
          <label htmlFor="custom-query" className="visually-hidden">Custom Investigation Query</label>
          <input
            id="custom-query"
            type="text"
            placeholder="Add specific focus (e.g., 'Compare soot shell insulating effects and multi-droplet extinction limits vs solid cloth spread')..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </div>

        {/* Inspect raw prompt accordion */}
        {showRawPrompt && (
          <div className="raw-prompt-drawer">
            <div className="raw-prompt-header">
              <span>ACTIVE SI SYNTHESIS PROMPT (SYSTEM + CONTEXT)</span>
              <button type="button" className="copy-btn" onClick={handleCopyPrompt}>
                {copiedPrompt ? '✓ Copied to Clipboard' : 'Copy Prompt'}
              </button>
            </div>
            <pre className="raw-prompt-code">{currentPrompt}</pre>
          </div>
        )}

        {/* Synthesis Result Display */}
        {synthesisResult && (
          <div className="synthesis-result-panel" role="region" aria-live="polite">
            <div className="result-header">
              <span className="result-badge">SI SYNTHESIS REPORT</span>
              <span className="result-meta">
                Targets: {synthesisResult.meta?.investigations?.join(', ')} · Scenario: {synthesisResult.meta?.scenario}
              </span>
            </div>
            <div className="result-body">
              {synthesisResult.synthesis.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ') || paragraph.startsWith('#### ')) {
                  return <h4 key={idx} className="result-subheading">{paragraph.replace(/#+\s*/, '')}</h4>
                }
                return <p key={idx} className="result-paragraph">{paragraph}</p>
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
