import { useState, useCallback } from 'react'

type LogEntry = { id: number; message: string; at: string }

function formatTime(): string {
  const d = new Date()
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

function App() {
  const [debugOpen, setDebugOpen] = useState(false)
  const [actionLog, setActionLog] = useState<LogEntry[]>([])
  const [runtimeError, setRuntimeError] = useState<string | null>(null)

  const addLog = useCallback((message: string) => {
    const at = formatTime()
    const id = Date.now()
    setActionLog((prev) => [...prev.slice(-19), { id, message, at }])
  }, [])

  const toggleDebug = useCallback(() => {
    setDebugOpen((prev) => {
      const next = !prev
      addLog(next ? 'Debug toggled ON' : 'Debug toggled OFF')
      return next
    })
  }, [addLog])

  return (
    <>
      <h1>Portfolio 2026</h1>
      <p className="subtitle">Project Zero: Kanban (coming soon)</p>

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
            <h3>Action Log</h3>
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
