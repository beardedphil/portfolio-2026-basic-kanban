import { useState, useCallback } from 'react'

type LogEntry = { id: number; message: string; at: string }
type Column = { id: string; title: string }

function formatTime(): string {
  const d = new Date()
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

function stableColumnId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `col-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function App() {
  const [debugOpen, setDebugOpen] = useState(false)
  const [actionLog, setActionLog] = useState<LogEntry[]>([])
  const [runtimeError, _setRuntimeError] = useState<string | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [showAddColumnForm, setShowAddColumnForm] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const addLog = useCallback((message: string) => {
    const at = formatTime()
    const id = Date.now()
    setActionLog((prev) => [...prev.slice(-19), { id, message, at }])
  }, [])

  const toggleDebug = useCallback(() => {
    const next = !debugOpen
    setDebugOpen(next)
    addLog(next ? 'Debug toggled ON' : 'Debug toggled OFF')
  }, [debugOpen, addLog])

  const handleCreateColumn = useCallback(() => {
    const title = newColumnTitle.trim()
    if (!title) return
    const col: Column = { id: stableColumnId(), title }
    setColumns((prev) => [...prev, col])
    setNewColumnTitle('')
    setShowAddColumnForm(false)
    addLog(`Column added: "${title}"`)
  }, [newColumnTitle, addLog])

  const handleCancelAddColumn = useCallback(() => {
    setNewColumnTitle('')
    setShowAddColumnForm(false)
  }, [])

  const handleRemoveColumn = useCallback(
    (id: string) => {
      const col = columns.find((c) => c.id === id)
      setColumns((prev) => prev.filter((c) => c.id !== id))
      if (col) addLog(`Column removed: "${col.title}"`)
    },
    [columns, addLog]
  )

  return (
    <>
      <h1>Portfolio 2026</h1>
      <p className="subtitle">Project Zero: Kanban (coming soon)</p>

      <section className="columns-section" aria-label="Columns">
        <h2>Columns</h2>
        <button
          type="button"
          className="add-column-btn"
          onClick={() => setShowAddColumnForm(true)}
          aria-expanded={showAddColumnForm}
        >
          Add column
        </button>
        {showAddColumnForm && (
          <div className="add-column-form" role="form" aria-label="Add column form">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Column name"
              autoFocus
              aria-label="Column name"
            />
            <div className="form-actions">
              <button type="button" onClick={handleCreateColumn}>
                Create
              </button>
              <button type="button" onClick={handleCancelAddColumn}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="columns-row">
          {columns.map((col) => (
            <div key={col.id} className="column-card" data-column-id={col.id}>
              <span className="column-title">{col.title}</span>
              <button
                type="button"
                className="column-remove"
                onClick={() => handleRemoveColumn(col.id)}
                aria-label={`Remove column ${col.title}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <button type="button" className="debug-toggle" onClick={toggleDebug} aria-pressed={debugOpen}>
        Debug {debugOpen ? 'ON' : 'OFF'}
      </button>

      {debugOpen && (
        <div className="debug-panel" role="region" aria-label="Debug panel">
          <section>
            <h3>Build info</h3>
            <div className="build-info">
              Mode: {import.meta.env.MODE ?? 'unknown'}
            </div>
          </section>
          <section>
            <h3>Kanban state</h3>
            <div className="build-info">
              <p className="kanban-summary">Column count: {columns.length}</p>
              <p className="kanban-column-names">
                Column names: {columns.length === 0 ? '(none)' : columns.map((c) => c.title).join(', ')}
              </p>
            </div>
          </section>
          <section>
            <h3>Action Log</h3>
            <p className="action-log-summary">Total actions: {actionLog.length}</p>
            <ul>
              {actionLog.length === 0 ? (
                <li>No actions yet.</li>
              ) : (
                actionLog.map((e) => (
                  <li key={e.id}>
                    [{e.at}] {e.message}
                  </li>
                ))
              )}
            </ul>
          </section>
          <section>
            <h3>Errors</h3>
            <div className={`error-section ${runtimeError ? '' : 'empty'}`}>
              {runtimeError ?? 'No errors.'}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default App
