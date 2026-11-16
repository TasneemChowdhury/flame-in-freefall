import { useEffect, useMemo, useState } from 'react'
import './App.css'
import ComparisonMatrix from './components/ComparisonMatrix'
import FlexRunsViewer from './components/FlexRunsViewer'
import {
  fetchInvestigations,
  FALLBACK_INVESTIGATIONS,
} from './services/supabaseClient'

const filters = ['All studies', 'Prevention', 'Detection', 'Suppression']

function Icon({ name, size = 18 }) {
  const paths = {
    orbit: (
      <>
        <circle cx="12" cy="12" r="2" />
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-35 12 12)" />
        <circle cx="18.8" cy="6.4" r="1" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </>
    ),
    close: <path d="m18 6-12 12M6 6l12 12" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    tune: (
      <>
        <path d="M4 7h9M17 7h3M4 17h3m4 0h9" />
        <circle cx="15" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </>
    ),
    columns: (
      <>
        <rect x="4" y="4" width="6.5" height="16" rx="1.5" />
        <rect x="13.5" y="4" width="6.5" height="16" rx="1.5" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.orbit}
    </svg>
  )
}

function App() {
  const [investigationsList, setInvestigationsList] = useState(FALLBACK_INVESTIGATIONS)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All studies')
  const [selectedAcronym, setSelectedAcronym] = useState('PSI-69')
  const [comparisonAcronyms, setComparisonAcronyms] = useState(['PSI-69', 'PSI-68'])
  const [activeView, setActiveView] = useState('all') // 'all', 'library', 'matrix'
  const [isBriefHidden, setIsBriefHidden] = useState(false)

  // Fetch dynamic investigations from API / Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchInvestigations()
        if (data && data.length > 0) {
          setInvestigationsList(data)
        }
      } catch (err) {
        console.warn('Error fetching investigations, using default seed set:', err)
      }
    }
    loadData()
  }, [])

  // Filter investigations
  const visibleInvestigations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return investigationsList.filter((item) => {
      const matchesFilter =
        activeFilter === 'All studies' ||
        item.fire_safety_pillar === activeFilter ||
        item.type === activeFilter

      const searchableText = [
        item.acronym,
        item.full_name,
        item.title,
        item.fire_safety_pillar,
        item.fuel_domain,
        item.hardware_rack,
        item.space_application,
        item.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery))
    })
  }, [investigationsList, activeFilter, query])

  // Current selected investigation for details panel
  const selectedInvestigation =
    visibleInvestigations.find(
      (item) => item.acronym === selectedAcronym || item.nasa_id === selectedAcronym
    ) ?? visibleInvestigations[0] ?? investigationsList[0]

  // Toggle investigation in comparison matrix
  function toggleComparison(acronym) {
    setComparisonAcronyms((prev) => {
      if (prev.includes(acronym)) {
        return prev.filter((a) => a !== acronym)
      } else {
        return [...prev, acronym]
      }
    })
  }

  // Handle preset selection
  function handleSelectPreset(acronyms) {
    setComparisonAcronyms(acronyms)
    const el = document.getElementById('matrix')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function selectFilter(filter) {
    setActiveFilter(filter)
  }

  return (
    <div className={`app-shell${isBriefHidden ? ' brief-hidden' : ''}`}>
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Flame in Freefall home">
          <span className="brand-mark">
            <Icon name="orbit" size={22} />
          </span>
          <span className="brand-copy">
            <strong>
              FLAME<span> / </span>FREEFALL
            </strong>
            <small>SPACE SCIENCE, MADE CLEAR</small>
          </span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a
            className={`nav-item ${activeView === 'all' || activeView === 'library' ? 'active' : ''}`}
            href="#overview"
            onClick={() => setActiveView('all')}
          >
            <Icon name="grid" /> Overview & Library
          </a>
          <a
            className={`nav-item ${activeView === 'matrix' ? 'active' : ''}`}
            href="#matrix"
            onClick={() => setActiveView('all')}
          >
            <Icon name="columns" /> Comparison Matrix{' '}
            <span className="nav-count">{comparisonAcronyms.length} Active</span>
          </a>
          <a
            className={`nav-item ${activeView === 'flex-runs' ? 'active' : ''}`}
            href="#flex-runs"
            onClick={() => setActiveView('flex-runs')}
          >
            <Icon name="orbit" /> FLEX Flight Runs{' '}
            <span className="nav-count">274 Tests</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="source-card">
            <span className="source-dot" />
            <div>
              <strong>NASA PSI DATABASE</strong>
              <span>Normalized Microgravity Science</span>
            </div>
          </div>
          <div className="sidebar-foot">A research explorer for the next giant leap.</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">
            <span>NASA SPACE APPS 2026</span>
            <span className="breadcrumb-slash">/</span>
            <span>FIRE SAFETY IN MICROGRAVITY</span>
          </div>
          <div className="topbar-meta">
            <span className="live-dot" />
            <span>SUPABASE LIVE REPOSITORY</span>
            <button
              type="button"
              className="brief-toggle-btn"
              aria-controls="investigation-brief-panel"
              aria-expanded={!isBriefHidden}
              aria-label={`${isBriefHidden ? 'Show' : 'Hide'} investigation brief`}
              onClick={() => setIsBriefHidden((hidden) => !hidden)}
            >
              {isBriefHidden ? 'Show brief' : 'Hide brief'}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="intro">
          <div className="eyebrow">
            <span className="eyebrow-line" /> PHYSICAL SCIENCES INFORMATICS (PSI)
          </div>
          <h1>
            Flame in <span>Freefall</span>
          </h1>
          <p className="intro-copy">
            Decades of microgravity combustion research across FLEX, BASS, Saffire, and CFI-G,
            connected to critical fire-safety questions for Moon and Mars exploration habitats.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid" aria-label="Dashboard overview">
          <article className="stat-card">
            <span className="stat-label">INVESTIGATIONS</span>
            <div className="stat-value">
              05<span className="stat-unit"> core studies</span>
            </div>
            <span className="stat-note">FLEX · FLEX-2 · BASS · Saffire · CFI-G</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">SAFETY PILLARS</span>
            <div className="stat-value">
              03<span className="stat-unit"> focus areas</span>
            </div>
            <span className="stat-note">Prevention · Detection · Suppression</span>
          </article>
          <article className="stat-card stat-highlight">
            <span className="stat-label">EXPLORATION CONTEXT</span>
            <div className="stat-value">
              Moon<span className="stat-unit"> to Mars</span>
            </div>
            <span className="stat-note">Normoxic 8.2 psia (≥30% O₂) habitats</span>
          </article>
        </section>

        {/* View Switcher Tabs */}
        <div className="view-tabs">
          <button
            type="button"
            className={`view-tab-btn ${activeView === 'all' ? 'active' : ''}`}
            onClick={() => setActiveView('all')}
          >
            All Views
          </button>
          <button
            type="button"
            className={`view-tab-btn ${activeView === 'library' ? 'active' : ''}`}
            onClick={() => setActiveView('library')}
          >
            Research Library
          </button>
          <button
            type="button"
            className={`view-tab-btn ${activeView === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveView('matrix')}
          >
            Cross-Experiment Matrix ({comparisonAcronyms.length})
          </button>
          <button
            type="button"
            className={`view-tab-btn ${activeView === 'flex-runs' ? 'active' : ''}`}
            onClick={() => setActiveView('flex-runs')}
          >
            FLEX Flight Telemetry (274 Tests)
          </button>
        </div>

        {/* Section 1: Research Library */}
        {(activeView === 'all' || activeView === 'library') && (
          <section className="research-section" id="investigations">
            <div className="section-heading">
              <div>
                <div className="eyebrow section-eyebrow">
                  <span className="eyebrow-line" /> RESEARCH LIBRARY
                </div>
                <h2>
                  Explore Microgravity Investigations<span className="heading-period">.</span>
                </h2>
              </div>
              <span className="sample-note">NORMALIZED SUPABASE REPOSITORY</span>
            </div>

            {/* Toolbar */}
            <div className="library-toolbar">
              <label className="search-field">
                <Icon name="search" size={19} />
                <input
                  type="search"
                  placeholder="Search investigations, fuels, hardware (e.g. droplet, SIBAL, CIR)..."
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                  }}
                  aria-label="Search investigations"
                />
                <span className="search-shortcut">
                  <Icon name="tune" size={15} />
                </span>
              </label>

              <div className="filter-list" role="group" aria-label="Filter by fire-safety focus">
                {filters.map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={`filter-button${activeFilter === filter ? ' selected' : ''}`}
                    onClick={() => selectFilter(filter)}
                    aria-pressed={activeFilter === filter}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="results-caption">
              <span>
                {visibleInvestigations.length} INVESTIGATION
                {visibleInvestigations.length === 1 ? '' : 'S'}
              </span>
              <span>
                <span className="rank-marker" /> SAFETY RELEVANCE{' '}
                <span className="info-dot" title="Microgravity fire-safety criticality score">
                  i
                </span>
              </span>
            </div>

            {/* Investigation List */}
            <div
              className="investigation-list-scroll"
              role="region"
              aria-label="Research library results, scroll horizontally to see all columns"
              tabIndex={0}
            >
              <div className="investigation-list">
                {visibleInvestigations.map((item, index) => {
                  const isSelectedInList = selectedInvestigation?.acronym === item.acronym
                  const isInMatrix = comparisonAcronyms.includes(item.acronym)

                  return (
                    <div
                      key={item.acronym}
                      className={`investigation-row${isSelectedInList ? ' is-selected' : ''}`}
                      onClick={() => {
                        setSelectedAcronym(item.acronym)
                      }}
                    >
                      <span className={`row-index${isSelectedInList ? ' current' : ''}`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="row-copy">
                        <span className="row-title">
                          <strong>{item.acronym}</strong> — {item.full_name || item.name}
                        </span>
                        <span className="row-subtitle">
                          {item.fuel_domain || item.fuel} Fuel
                          <span className="row-dot">·</span>
                          {item.hardware_rack || item.hardware}
                          <span className="row-dot">·</span>
                          {item.space_application || 'Microgravity'}
                        </span>
                      </span>

                      <button
                        type="button"
                        className={`row-compare-btn ${isInMatrix ? 'is-active' : ''}`}
                        title={isInMatrix ? 'Remove from Comparison Matrix' : 'Add to Comparison Matrix'}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleComparison(item.acronym)
                        }}
                      >
                        {isInMatrix ? '✓ In Matrix' : '+ Compare'}
                      </button>

                      <span
                        className={`focus-pill focus-${(
                          item.fire_safety_pillar ||
                          item.type ||
                          'prevention'
                        ).toLowerCase()}`}
                      >
                        {item.fire_safety_pillar || item.type}
                      </span>

                      <span className="relevance-cell">
                        <span className="relevance-number">
                          {item.relevance_score || item.relevance || 90}
                        </span>
                        <span className="relevance-track">
                          <span
                            style={{
                              width: `${item.relevance_score || item.relevance || 90}%`,
                            }}
                          />
                        </span>
                      </span>

                      <span className="row-arrow">
                        <Icon name="chevron" size={17} />
                      </span>
                    </div>
                  )
                })}

                {visibleInvestigations.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <Icon name="search" size={22} />
                    </span>
                    <strong>No investigations found</strong>
                    <span>Try another search term or clear your focus filter.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        selectFilter('All studies')
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="ranking-footnote">
              <span className="asterisk">*</span>
              Normalized parameters pulled from NASA PSI data and Space Apps challenge literature.
            </div>
          </section>
        )}

        {/* Section 2: Cross-Experiment Comparison Matrix Component */}
        {(activeView === 'all' || activeView === 'matrix') && (
          <ComparisonMatrix
            allInvestigations={investigationsList}
            selectedAcronyms={comparisonAcronyms}
            onToggleAcronym={toggleComparison}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* Section 3: FLEX Empirical Flight Telemetry (274 Tests) */}
        {(activeView === 'all' || activeView === 'flex-runs') && (
          <FlexRunsViewer />
        )}

        <footer className="page-footer">
          <span>FLAME IN FREEFALL</span>
          <span>NASA SPACE APPS CHALLENGE · 2026</span>
        </footer>
      </main>

      {/* Right Aside: Selected Investigation Detail Panel */}
      <aside
        id="investigation-brief-panel"
        className="detail-panel"
        aria-label="Selected investigation details"
        hidden={isBriefHidden}
      >
        {selectedInvestigation && (
          <>
            <div className="detail-topline">
              <span>INVESTIGATION BRIEF</span>
              <span className="detail-index">NO. {selectedInvestigation.acronym}</span>
            </div>

            <div className="detail-emblem">
              <span className="emblem-orbit orbit-one" />
              <span className="emblem-orbit orbit-two" />
              <span className="emblem-core" />
              <span className="emblem-star">✳</span>
            </div>

            <span
              className={`focus-pill focus-${(
                selectedInvestigation.fire_safety_pillar ||
                selectedInvestigation.type ||
                'prevention'
              ).toLowerCase()}`}
            >
              {selectedInvestigation.fire_safety_pillar || selectedInvestigation.type}
            </span>

            <h2 className="detail-title">
              {selectedInvestigation.full_name || selectedInvestigation.name}
            </h2>
            <p className="detail-project">
              {selectedInvestigation.acronym} · {selectedInvestigation.hardware_rack || selectedInvestigation.hardware}
            </p>

            {/* Matrix comparison toggle button */}
            <button
              type="button"
              className={`detail-compare-btn ${
                comparisonAcronyms.includes(selectedInvestigation.acronym) ? 'active' : ''
              }`}
              onClick={() => toggleComparison(selectedInvestigation.acronym)}
            >
              <Icon name="columns" size={15} />
              {comparisonAcronyms.includes(selectedInvestigation.acronym)
                ? 'Included in Comparison Matrix (Active)'
                : '+ Add to Comparison Matrix'}
            </button>

            <div className="detail-rule" />

            {/* Relevance Score */}
            <div className="relevance-summary">
              <div>
                <span>SAFETY RELEVANCE</span>
                <strong>
                  {selectedInvestigation.relevance_score || selectedInvestigation.relevance || 92}
                  <small> / 100</small>
                </strong>
              </div>
              <span className="relevance-track">
                <span
                  style={{
                    width: `${
                      selectedInvestigation.relevance_score || selectedInvestigation.relevance || 92
                    }%`,
                  }}
                />
              </span>
            </div>

            {/* Research Question */}
            <div className="detail-question">
              <span className="detail-label">THE RESEARCH QUESTION</span>
              <p>
                {selectedInvestigation.research_question || selectedInvestigation.question}
              </p>
            </div>

            {/* Key Facts */}
            <div className="detail-facts">
              <div className="fact-row">
                <span>FUEL DOMAIN</span>
                <strong>{selectedInvestigation.fuel_domain || selectedInvestigation.fuel}</strong>
              </div>
              <div className="fact-row">
                <span>HARDWARE RACK</span>
                <strong>
                  {selectedInvestigation.hardware_rack || selectedInvestigation.hardware}
                </strong>
              </div>
              <div className="fact-row">
                <span>SPACE APPLICATION</span>
                <strong>
                  {selectedInvestigation.space_application || selectedInvestigation.application}
                </strong>
              </div>
            </div>

            {/* Numerical Parameter Ranges Grid */}
            {selectedInvestigation.investigation_parameters &&
              selectedInvestigation.investigation_parameters.length > 0 && (
                <div className="detail-params-section">
                  <span className="detail-label">TESTED PARAMETER BOUNDARIES</span>
                  <div className="detail-params-list">
                    {selectedInvestigation.investigation_parameters.map((param) => (
                      <div key={param.parameter_name} className="detail-param-item">
                        <span className="detail-param-name">{param.parameter_name}</span>
                        <span className="detail-param-range">
                          {param.min_value} – {param.max_value} {param.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* AI Scenario Insight Preview */}
            {selectedInvestigation.investigation_ai_insights &&
              selectedInvestigation.investigation_ai_insights[0] && (
                <div className="detail-insight-preview">
                  <strong>
                    SCENARIO: {selectedInvestigation.investigation_ai_insights[0].scenario_tag}
                  </strong>
                  <p>{selectedInvestigation.investigation_ai_insights[0].safety_insight}</p>
                </div>
              )}

            {/* Why It Matters */}
            <div className="detail-takeaway">
              <div className="takeaway-heading">
                <Icon name="spark" size={15} /> WHY IT MATTERS FOR EXPLORATION
              </div>
              <p>
                {selectedInvestigation.description || selectedInvestigation.summary}
              </p>
            </div>

            <div className="detail-source">
              <span className="source-dot" /> NASA Physical Sciences Informatics (PSI)
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default App
