import { useMemo, useState } from 'react'
import './App.css'

const investigations = [
  {
    id: 'BASS-II',
    name: 'Burning and Suppression of Solids II',
    project: 'BASS-II',
    type: 'Prevention',
    relevance: 98,
    fuel: 'Solid materials',
    environment: 'Microgravity',
    hardware: 'Microgravity Science Glovebox (MSG)',
    question: 'How do common spacecraft materials burn, and how can they be suppressed?',
    summary:
      'Directly relevant to choosing safer materials for crew habitats. BASS-II studies solid-fuel burning and suppression in microgravity.',
    application: 'Material selection and suppression strategies for crewed spacecraft.',
    tags: ['Materials', 'Suppression'],
  },
  {
    id: 'SAFFIRE',
    name: 'Spacecraft Fire Safety Demonstration',
    project: 'Saffire I–III',
    type: 'Prevention',
    relevance: 95,
    fuel: 'Solid materials',
    environment: 'Microgravity',
    hardware: 'Spacecraft Fire Safety Demonstration',
    question: 'How does fire behave in a spacecraft-sized environment?',
    summary:
      'The Saffire investigations studied material flammability in larger-scale spacecraft experiments, complementing smaller combustion tests.',
    application: 'Understanding fire growth and material flammability in spacecraft environments.',
    tags: ['Materials', 'Spacecraft scale'],
  },
  {
    id: 'FLEX',
    name: 'Flame Extinguishment Experiment',
    project: 'FLEX / FLEX-2',
    type: 'Suppression',
    relevance: 93,
    fuel: 'Liquid fuel droplets',
    environment: 'Microgravity',
    hardware: 'Multi-user Droplet Combustion Apparatus (MDCA)',
    question: 'How can a flame be extinguished in microgravity?',
    summary:
      'FLEX studies droplet combustion and extinguishment, including the use of carbon dioxide and helium to dilute the chamber atmosphere.',
    application: 'Informing fire suppression approaches for spacecraft and crew habitats.',
    tags: ['Droplet combustion', 'CO₂ · helium'],
  },
  {
    id: 'SAME-R',
    name: 'Smoke and Aerosol Measurement Experiment',
    project: 'SAME / SAME-R',
    type: 'Detection',
    relevance: 91,
    fuel: 'Smoke and aerosols',
    environment: 'Microgravity',
    hardware: 'Smoke and aerosol measurement instruments',
    question: 'How can smoke be detected in a microgravity environment?',
    summary:
      'SAME and SAME-R investigate smoke and aerosol behavior to support reliable fire detection where particles do not rise as they do on Earth.',
    application: 'Smoke detection and alarm placement in spacecraft.',
    tags: ['Smoke', 'Sensors'],
  },
  {
    id: 'CFI-G',
    name: 'Cool Flames Investigation with Gases',
    project: 'ACME · CFI-G',
    type: 'Prevention',
    relevance: 89,
    fuel: 'Gaseous fuel (e.g. propane)',
    environment: 'Microgravity',
    hardware: 'Combustion Integrated Rack (CIR)',
    question: 'How does oxygen concentration affect combustion in microgravity?',
    summary:
      'CFI-G examined flames with oxygen–nitrogen mixtures flowing from a spherical burner. Tests reached oxygen concentrations as high as 85%.',
    application: 'Assessing flammability risk in oxygen-enriched exploration habitats.',
    tags: ['Oxygen concentration', 'Gaseous fuel'],
  },
  {
    id: 'BRE',
    name: 'Burning Rate Emulator',
    project: 'ACME · BRE',
    type: 'Prevention',
    relevance: 84,
    fuel: 'Gaseous fuel',
    environment: 'Microgravity',
    hardware: 'Combustion Integrated Rack (CIR)',
    question: 'How do material properties relate to burning in still atmospheres?',
    summary:
      'BRE used gaseous fuels to study material flammability in still atmospheres as a function of material properties.',
    application: 'Predictive models of material flammability in exploration vehicles.',
    tags: ['Material properties', 'Predictive modeling'],
  },
]

const filters = ['All studies', 'Prevention', 'Detection', 'Suppression']

function Icon({ name, size = 18 }) {
  const paths = {
    orbit: <><circle cx="12" cy="12" r="2" /><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-35 12 12)" /><circle cx="18.8" cy="6.4" r="1" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    tune: <><path d="M4 7h9M17 7h3M4 17h3m4 0h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
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
      {paths[name]}
    </svg>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All studies')
  const [selectedId, setSelectedId] = useState('BASS-II')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const visibleInvestigations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return investigations.filter((item) => {
      const matchesFilter = activeFilter === 'All studies' || item.type === activeFilter
      const searchableText = [
        item.name,
        item.project,
        item.type,
        item.fuel,
        item.hardware,
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase()
      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery))
    })
  }, [activeFilter, query])

  const selectedInvestigation =
    visibleInvestigations.find((item) => item.id === selectedId) ?? visibleInvestigations[0]

  function submitQuestion(event) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || !selectedInvestigation) return
    setAnswer(
      `This dashboard is showing a prototype response. ${selectedInvestigation.project} is relevant because ${selectedInvestigation.summary.toLowerCase()} Explore the study details for its fuel, environment, and potential fire-safety application.`,
    )
  }

  function selectFilter(filter) {
    setActiveFilter(filter)
    setAnswer('')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Flame in Freefall home">
          <span className="brand-mark"><Icon name="orbit" size={22} /></span>
          <span className="brand-copy">
            <strong>FLAME<span> / </span>FREEFALL</strong>
            <small>SPACE SCIENCE, MADE CLEAR</small>
          </span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><Icon name="grid" /> Overview</a>
          <a className="nav-item" href="#investigations"><Icon name="search" /> Investigations <span className="nav-count">06</span></a>
        </nav>

        <div className="sidebar-bottom">
          <div className="source-card">
            <span className="source-dot" />
            <div>
              <strong>NASA PSI DATA</strong>
              <span>Research for safer spaceflight</span>
            </div>
          </div>
          <div className="sidebar-foot">A research explorer for the next giant leap.</div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>SPACE SCIENCE</span><span className="breadcrumb-slash">/</span> FIRE SAFETY</div>
          <div className="topbar-meta"><span className="live-dot" /> DATA EXPLORER <span className="meta-divider" /> PROTOTYPE</div>
        </header>

        <section className="intro">
          <div className="eyebrow"><span className="eyebrow-line" /> NASA PHYSICAL SCIENCE INFORMATICS</div>
          <h1>Flame in <span>Freefall</span></h1>
          <p className="intro-copy">
            Decades of microgravity combustion research, connected to the fire-safety questions that matter for life beyond Earth.
          </p>
        </section>

        <section className="stats-grid" aria-label="Dashboard overview">
          <article className="stat-card">
            <span className="stat-label">INVESTIGATIONS</span>
            <div className="stat-value">06<span className="stat-unit"> studies</span></div>
            <span className="stat-note">Across NASA combustion research</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">SAFETY PILLARS</span>
            <div className="stat-value">03<span className="stat-unit"> focus areas</span></div>
            <span className="stat-note">Prevention · detection · suppression</span>
          </article>
          <article className="stat-card stat-highlight">
            <span className="stat-label">EXPLORATION CONTEXT</span>
            <div className="stat-value">Moon<span className="stat-unit"> to Mars</span></div>
            <span className="stat-note">Research for crewed environments</span>
          </article>
        </section>

        <section className="research-section" id="investigations">
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow"><span className="eyebrow-line" /> RESEARCH LIBRARY</div>
              <h2>Find your next insight<span className="heading-period">.</span></h2>
            </div>
            <span className="sample-note">DEMO DATA · RANKINGS ARE ILLUSTRATIVE</span>
          </div>

          <div className="library-toolbar">
            <label className="search-field">
              <Icon name="search" size={19} />
              <input
                type="search"
                placeholder="Search investigations, fuels, hardware..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setAnswer('')
                }}
                aria-label="Search investigations"
              />
              <span className="search-shortcut"><Icon name="tune" size={15} /></span>
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
            <span>{visibleInvestigations.length} INVESTIGATION{visibleInvestigations.length === 1 ? '' : 'S'}</span>
            <span><span className="rank-marker" /> SAFETY RELEVANCE <span className="info-dot" title="Illustrative prototype score, not a NASA-published ranking">i</span></span>
          </div>

          <div className="investigation-list">
            {visibleInvestigations.map((item, index) => (
              <button
                type="button"
                className={`investigation-row${selectedInvestigation?.id === item.id ? ' is-selected' : ''}`}
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id)
                  setAnswer('')
                }}
                aria-pressed={selectedInvestigation?.id === item.id}
              >
                <span className={`row-index${selectedId === item.id ? ' current' : ''}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="row-copy">
                  <span className="row-title">{item.name}</span>
                  <span className="row-subtitle">{item.project}<span className="row-dot">·</span>{item.fuel}</span>
                </span>
                <span className={`focus-pill focus-${item.type.toLowerCase()}`}>{item.type}</span>
                <span className="relevance-cell">
                  <span className="relevance-number">{item.relevance}</span>
                  <span className="relevance-track"><span style={{ width: `${item.relevance}%` }} /></span>
                </span>
                <span className="row-arrow"><Icon name="chevron" size={17} /></span>
              </button>
            ))}
            {visibleInvestigations.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon"><Icon name="search" size={22} /></span>
                <strong>No investigations found</strong>
                <span>Try another search term or clear your focus filter.</span>
                <button type="button" onClick={() => { setQuery(''); selectFilter('All studies') }}>Clear filters</button>
              </div>
            )}
          </div>

          <div className="ranking-footnote">
            <span className="asterisk">*</span>
            Relevance scores are illustrative placeholders for this prototype and are not NASA ratings.
          </div>
        </section>

        <section className="si-panel" aria-label="Ask the research assistant">
          <div className="si-icon"><Icon name="spark" size={20} /></div>
          <div className="si-content">
            <div className="si-heading">
              <div><span className="si-kicker">RESEARCH ASSISTANT</span><h2>Ask a bigger question<span>.</span></h2></div>
              <span className="preview-label">SI PREVIEW</span>
            </div>
            <p>Connect an investigation to the challenges of fire safety in space.</p>
            <form className="question-form" onSubmit={submitQuestion}>
              <label className="visually-hidden" htmlFor="question">Ask about microgravity fire safety</label>
              <input
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="e.g. What can we learn about smoke detection?"
              />
              <button type="submit" disabled={!question.trim() || !selectedInvestigation}>Ask SI <Icon name="arrow" size={16} /></button>
            </form>
            {answer && <div className="si-answer" role="status">{answer}</div>}
            <div className="si-disclaimer">Prototype response · Connect the SI service when the backend is ready.</div>
          </div>
        </section>
        <footer className="page-footer"><span>FLAME IN FREEFALL</span><span>NASA SPACE APPS CHALLENGE · 2026</span></footer>
      </main>

      <aside className="detail-panel" aria-label="Selected investigation details">
        {selectedInvestigation && (
          <>
            <div className="detail-topline">
              <span>INVESTIGATION BRIEF</span>
              <span className="detail-index">NO. {selectedInvestigation.id}</span>
            </div>
            <div className="detail-emblem"><span className="emblem-orbit orbit-one" /><span className="emblem-orbit orbit-two" /><span className="emblem-core" /><span className="emblem-star">✳</span></div>
            <span className={`focus-pill focus-${selectedInvestigation.type.toLowerCase()}`}>{selectedInvestigation.type}</span>
            <h2 className="detail-title">{selectedInvestigation.name}</h2>
            <p className="detail-project">{selectedInvestigation.project}</p>
            <div className="detail-rule" />
            <div className="relevance-summary">
              <div><span>SAFETY RELEVANCE</span><strong>{selectedInvestigation.relevance}<small> / 100</small></strong></div>
              <span className="relevance-track"><span style={{ width: `${selectedInvestigation.relevance}%` }} /></span>
            </div>
            <div className="detail-question">
              <span className="detail-label">THE RESEARCH QUESTION</span>
              <p>{selectedInvestigation.question}</p>
            </div>
            <div className="detail-facts">
              <div className="fact-row"><span>FUEL / SUBJECT</span><strong>{selectedInvestigation.fuel}</strong></div>
              <div className="fact-row"><span>ENVIRONMENT</span><strong>{selectedInvestigation.environment}</strong></div>
              <div className="fact-row"><span>HARDWARE / CONTEXT</span><strong>{selectedInvestigation.hardware}</strong></div>
            </div>
            <div className="detail-takeaway">
              <div className="takeaway-heading"><Icon name="spark" size={15} /> WHY IT MATTERS</div>
              <p>{selectedInvestigation.application}</p>
            </div>
            <div className="detail-tags">
              {selectedInvestigation.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <div className="detail-source"><span className="source-dot" /> NASA PSI <span>·</span> Challenge context</div>
          </>
        )}
      </aside>
    </div>
  )
}

export default App
