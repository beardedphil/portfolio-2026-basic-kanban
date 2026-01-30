import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type LogEntry = { id: number; message: string; at: string }
type Column = { id: string; title: string }

const DUMMY_CARDS = [
  { id: 'd1', title: 'Dummy task A' },
  { id: 'd2', title: 'Dummy task B' },
  { id: 'd3', title: 'Dummy task C' },
]

function formatTime(): string {
  const d = new Date()
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

function stableColumnId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `col-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function SortableColumn({
  col,
  onRemove,
}: {
  col: Column
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: col.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="column-card"
      data-column-id={col.id}
    >
      <div className="column-header">
        <span className="column-title" {...attributes} {...listeners}>
          {col.title}
        </span>
        <button
          type="button"
          className="column-remove"
          onClick={() => onRemove(col.id)}
          aria-label={`Remove column ${col.title}`}
        >
          Remove
        </button>
      </div>
      <div className="column-cards">
        {DUMMY_CARDS.map((card) => (
          <div key={card.id} className="ticket-card">
            {card.title}
          </div>
        ))}
      </div>
    </div>
  )
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

  const handleColumnDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldOrder = columns.map((c) => c.title)
      const oldIndex = columns.findIndex((c) => c.id === active.id)
      const newIndex = columns.findIndex((c) => c.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const next = arrayMove(columns, oldIndex, newIndex)
      setColumns(next)
      const newOrder = next.map((c) => c.title)
      addLog(`Columns reordered: ${oldOrder.join(',')} -> ${newOrder.join(',')}`)
    },
    [columns, addLog]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const columnOrderDisplay =
    columns.length === 0 ? '(none)' : columns.map((c) => c.title).join(' → ')

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleColumnDragEnd}
        >
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="columns-row">
              {columns.map((col) => (
                <SortableColumn
                  key={col.id}
                  col={col}
                  onRemove={handleRemoveColumn}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
              <p className="kanban-column-order">
                Column order: {columnOrderDisplay}
              </p>
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
