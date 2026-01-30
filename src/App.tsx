import { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type LogEntry = { id: number; message: string; at: string }
type Card = { id: string; title: string }
type Column = { id: string; title: string; cardIds: string[] }

type TicketFile = { name: string; path: string }

const DEFAULT_COLUMNS: Column[] = [
  { id: 'col-todo', title: 'To-do', cardIds: ['c-1', 'c-2', 'c-3'] },
  { id: 'col-doing', title: 'Doing', cardIds: ['c-4', 'c-5', 'c-6'] },
  { id: 'col-done', title: 'Done', cardIds: ['c-7', 'c-8', 'c-9'] },
]

const INITIAL_CARDS: Record<string, Card> = {
  'c-1': { id: 'c-1', title: 'Card A' },
  'c-2': { id: 'c-2', title: 'Card B' },
  'c-3': { id: 'c-3', title: 'Card C' },
  'c-4': { id: 'c-4', title: 'Card D' },
  'c-5': { id: 'c-5', title: 'Card E' },
  'c-6': { id: 'c-6', title: 'Card F' },
  'c-7': { id: 'c-7', title: 'Card G' },
  'c-8': { id: 'c-8', title: 'Card H' },
  'c-9': { id: 'c-9', title: 'Card I' },
}

function formatTime(): string {
  const d = new Date()
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

function stableColumnId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `col-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase()
}

function SortableCard({
  card,
  columnId,
}: {
  card: Card
  columnId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', columnId },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="ticket-card"
      data-card-id={card.id}
      {...attributes}
      {...listeners}
    >
      {card.title}
    </div>
  )
}

function SortableColumn({
  col,
  cards,
  onRemove,
}: {
  col: Column
  cards: Record<string, Card>
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: col.id,
    data: { type: 'column' },
  })
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: col.id,
    data: { type: 'column-drop', columnId: col.id },
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
      <div
        ref={setDroppableRef}
        className={`column-cards ${isOver ? 'column-cards-over' : ''}`}
      >
        <SortableContext items={col.cardIds} strategy={verticalListSortingStrategy}>
          {col.cardIds.map((cardId) => {
            const card = cards[cardId]
            if (!card) return null
            return <SortableCard key={card.id} card={card} columnId={col.id} />
          })}
        </SortableContext>
      </div>
    </div>
  )
}

function App() {
  const [debugOpen, setDebugOpen] = useState(false)
  const [actionLog, setActionLog] = useState<LogEntry[]>([])
  const [runtimeError, _setRuntimeError] = useState<string | null>(null)
  const [columns, setColumns] = useState<Column[]>(() => DEFAULT_COLUMNS)
  const [cards] = useState<Record<string, Card>>(() => ({ ...INITIAL_CARDS }))
  const [showAddColumnForm, setShowAddColumnForm] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [addColumnError, setAddColumnError] = useState<string | null>(null)
  const [activeCardId, setActiveCardId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)

  // Ticket Store (Docs read-only)
  const [ticketStoreConnected, setTicketStoreConnected] = useState(false)
  const [ticketStoreRootHandle, setTicketStoreRootHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [ticketStoreFiles, setTicketStoreFiles] = useState<TicketFile[]>([])
  const [ticketStoreLastRefresh, setTicketStoreLastRefresh] = useState<Date | null>(null)
  const [ticketStoreLastError, setTicketStoreLastError] = useState<string | null>(null)
  const [ticketStoreConnectMessage, setTicketStoreConnectMessage] = useState<string | null>(null)
  const [selectedTicketPath, setSelectedTicketPath] = useState<string | null>(null)
  const [selectedTicketContent, setSelectedTicketContent] = useState<string | null>(null)
  const [ticketViewerLoading, setTicketViewerLoading] = useState(false)

  const refreshTicketStore = useCallback(async (root: FileSystemDirectoryHandle) => {
    setTicketStoreLastError(null)
    try {
      const docs = await root.getDirectoryHandle('docs')
      const tickets = await docs.getDirectoryHandle('tickets')
      const files: TicketFile[] = []
      for await (const [name, entry] of tickets.entries()) {
        if (entry.kind === 'file' && name.endsWith('.md')) {
          files.push({ name, path: `docs/tickets/${name}` })
        }
      }
      files.sort((a, b) => a.name.localeCompare(b.name))
      setTicketStoreFiles(files)
      setTicketStoreLastRefresh(new Date())
    } catch {
      setTicketStoreLastError('No `docs/tickets` folder found.')
      setTicketStoreFiles([])
      setTicketStoreLastRefresh(new Date())
    }
  }, [])

  const handleConnectProject = useCallback(async () => {
    setTicketStoreConnectMessage(null)
    if (typeof window.showDirectoryPicker !== 'function') {
      setTicketStoreLastError('Folder picker not supported in this browser.')
      return
    }
    try {
      const root = await window.showDirectoryPicker()
      setTicketStoreConnected(true)
      setTicketStoreRootHandle(root)
      await refreshTicketStore(root)
    } catch (e) {
      const err = e as { name?: string }
      if (err.name === 'AbortError') {
        setTicketStoreConnectMessage('Connect cancelled.')
        return
      }
      setTicketStoreLastError(err instanceof Error ? err.message : 'Failed to open folder.')
    }
  }, [refreshTicketStore])

  const handleSelectTicket = useCallback(
    async (path: string, name: string) => {
      const root = ticketStoreRootHandle
      if (!root) return
      setSelectedTicketPath(path)
      setTicketViewerLoading(true)
      setSelectedTicketContent(null)
      try {
        const docs = await root.getDirectoryHandle('docs')
        const tickets = await docs.getDirectoryHandle('tickets')
        const fileHandle = await tickets.getFileHandle(name)
        const file = await fileHandle.getFile()
        const text = await file.text()
        setSelectedTicketContent(text)
      } catch {
        setSelectedTicketContent('(Failed to read file.)')
      } finally {
        setTicketViewerLoading(false)
      }
    },
    [ticketStoreRootHandle]
  )

  const handleRefreshTickets = useCallback(async () => {
    const root = ticketStoreRootHandle
    if (root) await refreshTicketStore(root)
  }, [ticketStoreRootHandle, refreshTicketStore])

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

  const findColumnByCardId = useCallback(
    (cardId: string) => columns.find((c) => c.cardIds.includes(cardId)),
    [columns]
  )
  const findColumnById = useCallback(
    (id: string) => columns.find((c) => c.id === id),
    [columns]
  )

  const isColumnId = useCallback(
    (id: UniqueIdentifier) => columns.some((c) => c.id === id),
    [columns]
  )

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args)
      let overId: UniqueIdentifier | null = getFirstCollision(intersections, 'id') ?? null
      if (overId != null) {
        const overColumn = findColumnById(String(overId))
        if (overColumn) {
          const containerItems = overColumn.cardIds
          if (containerItems.length > 0) {
            const closest = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (c) => c.id !== overId && containerItems.includes(String(c.id))
              ),
            })
            overId = closest[0]?.id ?? overId
          }
        }
        lastOverId.current = overId
        return [{ id: overId }]
      }
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [findColumnById]
  )

  const handleCreateColumn = useCallback(() => {
    const title = newColumnTitle.trim()
    if (!title) return
    const normalized = normalizeTitle(title)
    const isDuplicate = columns.some((c) => normalizeTitle(c.title) === normalized)
    if (isDuplicate) {
      setAddColumnError('Column title must be unique.')
      addLog(`Column add blocked (duplicate): "${normalized}"`)
      return
    }
    setAddColumnError(null)
    const col: Column = { id: stableColumnId(), title, cardIds: [] }
    setColumns((prev) => [...prev, col])
    setNewColumnTitle('')
    setShowAddColumnForm(false)
    addLog(`Column added: "${title}"`)
  }, [newColumnTitle, columns, addLog])

  const handleCancelAddColumn = useCallback(() => {
    setNewColumnTitle('')
    setAddColumnError(null)
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

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!isColumnId(event.active.id)) setActiveCardId(event.active.id)
    },
    [isColumnId]
  )

  const handleDragOver = useCallback(() => {
    // State is updated only on drop (handleDragEnd) so that cross-column moves
    // see the correct source column and persist.
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCardId(null)
      const { active, over } = event
      // Use last known over from collision detection when over is null on drop
      const effectiveOverId = over?.id ?? lastOverId.current
      if (effectiveOverId == null) return

      if (isColumnId(active.id)) {
        const oldIndex = columns.findIndex((c) => c.id === active.id)
        const newIndex = columns.findIndex((c) => c.id === effectiveOverId)
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
        const next = arrayMove(columns, oldIndex, newIndex)
        setColumns(next)
        const oldOrder = columns.map((c) => c.title)
        const newOrder = next.map((c) => c.title)
        addLog(`Columns reordered: ${oldOrder.join(',')} -> ${newOrder.join(',')}`)
        return
      }

      const sourceColumn = findColumnByCardId(String(active.id))
      if (!sourceColumn) return

      const overId = effectiveOverId
      // overId can be column id (droppable) or card id (dropped on a card)
      const overColumn = findColumnById(String(overId)) ?? findColumnByCardId(String(overId))
      if (!overColumn) return

      const sourceCardIds = sourceColumn.cardIds
      const activeIndex = sourceCardIds.indexOf(String(active.id))
      const isSameColumn = sourceColumn.id === overColumn.id

      if (isSameColumn) {
        let overIndex = overColumn.cardIds.indexOf(String(overId))
        if (overIndex < 0) overIndex = overColumn.cardIds.length
        if (activeIndex === overIndex) return
        setColumns((prev) =>
          prev.map((c) =>
            c.id === sourceColumn.id
              ? { ...c, cardIds: arrayMove(c.cardIds, activeIndex, overIndex) }
              : c
          )
        )
        const card = cards[String(active.id)]
        const colTitle = sourceColumn.title
        const oldOrder = sourceCardIds.map((id) => cards[id]?.title ?? id).join(',')
        const newOrder = arrayMove(sourceCardIds, activeIndex, overIndex).map(
          (id) => cards[id]?.title ?? id
        ).join(',')
        addLog(`Card reordered in ${colTitle}: ${oldOrder} -> ${newOrder} (card: ${card?.title ?? active.id})`)
      } else {
        let overIndex = overColumn.cardIds.indexOf(String(overId))
        if (overIndex < 0) overIndex = overColumn.cardIds.length
        setColumns((prev) =>
          prev.map((c) => {
            if (c.id === sourceColumn.id) {
              return { ...c, cardIds: c.cardIds.filter((id) => id !== active.id) }
            }
            if (c.id === overColumn.id) {
              const without = c.cardIds.filter((id) => id !== active.id)
              return {
                ...c,
                cardIds: [...without.slice(0, overIndex), String(active.id), ...without.slice(overIndex)],
              }
            }
            return c
          })
        )
        const card = cards[String(active.id)]
        const fromTitle = sourceColumn.title
        const toTitle = overColumn.title
        const fromBefore = sourceCardIds.map((id) => cards[id]?.title ?? id).join(',')
        const fromAfter = sourceCardIds.filter((id) => id !== active.id).map((id) => cards[id]?.title ?? id).join(',')
        const toBefore = overColumn.cardIds.map((id) => cards[id]?.title ?? id).join(',')
        const toAfter = [...overColumn.cardIds.slice(0, overIndex), String(active.id), ...overColumn.cardIds.slice(overIndex)]
          .map((id) => cards[id]?.title ?? id)
          .join(',')
        addLog(
          `Card moved from ${fromTitle} [${fromBefore}] to ${toTitle} [${toBefore}]; after: ${fromTitle} [${fromAfter}], ${toTitle} [${toAfter}] (${card?.title ?? active.id})`
        )
      }
    },
    [columns, cards, findColumnByCardId, findColumnById, isColumnId, addLog]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const columnOrderDisplay =
    columns.length === 0 ? '(none)' : columns.map((c) => c.title).join(' → ')

  const kanbanCardsDisplay =
    columns.length === 0
      ? '(none)'
      : columns
          .map((c) => `${c.title}: ${c.cardIds.map((id) => cards[id]?.title ?? id).join(',')}`)
          .join(' | ')

  return (
    <>
      <h1>Portfolio 2026</h1>
      <p className="subtitle">Project Zero: Kanban (coming soon)</p>

      <section className="columns-section" aria-label="Columns">
        <h2>Columns</h2>
        <button
          type="button"
          className="add-column-btn"
          onClick={() => {
            setAddColumnError(null)
            setShowAddColumnForm(true)
          }}
          aria-expanded={showAddColumnForm}
        >
          Add column
        </button>
        {showAddColumnForm && (
          <div className="add-column-form" role="form" aria-label="Add column form">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => {
                setNewColumnTitle(e.target.value)
                setAddColumnError(null)
              }}
              placeholder="Column name"
              autoFocus
              aria-label="Column name"
              aria-invalid={!!addColumnError}
              aria-describedby={addColumnError ? 'add-column-error' : undefined}
            />
            {addColumnError && (
              <p id="add-column-error" className="add-column-error" role="alert">
                {addColumnError}
              </p>
            )}
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
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
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
                  cards={cards}
                  onRemove={handleRemoveColumn}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeCardId && cards[String(activeCardId)] ? (
              <div className="ticket-card" data-card-id={activeCardId}>
                {cards[String(activeCardId)].title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>

      <section className="tickets-docs-section" aria-label="Tickets (Docs)">
        <h2>Tickets (Docs)</h2>
        <p className="tickets-status" data-status={ticketStoreConnected ? 'connected' : 'disconnected'}>
          {ticketStoreConnected ? 'Connected' : 'Disconnected'}
        </p>
        {!ticketStoreConnected ? (
          <>
            <p className="tickets-explanation">
              Connect a project folder to read ticket files from <code>docs/tickets/*.md</code> (read-only).
            </p>
            <button type="button" className="connect-project-btn" onClick={handleConnectProject}>
              Connect project
            </button>
            {ticketStoreConnectMessage && (
              <p className="tickets-message" role="alert">
                {ticketStoreConnectMessage}
              </p>
            )}
          </>
        ) : (
          <>
            {ticketStoreLastError && (
              <p className="tickets-message tickets-error" role="alert">
                {ticketStoreLastError}
              </p>
            )}
            <p className="tickets-count">Found {ticketStoreFiles.length} tickets.</p>
            <button type="button" className="refresh-tickets-btn" onClick={handleRefreshTickets}>
              Refresh
            </button>
            <div className="tickets-layout">
              <ul className="tickets-list" aria-label="Ticket files">
                {ticketStoreFiles.map((f) => (
                  <li key={f.path}>
                    <button
                      type="button"
                      className="ticket-file-btn"
                      onClick={() => handleSelectTicket(f.path, f.name)}
                      aria-pressed={selectedTicketPath === f.path}
                    >
                      {f.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ticket-viewer" aria-label="Ticket viewer">
                {selectedTicketPath ? (
                  <>
                    <p className="ticket-viewer-path">
                      <strong>Path:</strong> {selectedTicketPath}
                    </p>
                    {ticketViewerLoading ? (
                      <p className="ticket-viewer-loading">Loading…</p>
                    ) : (
                      <pre className="ticket-viewer-content">{selectedTicketContent ?? ''}</pre>
                    )}
                  </>
                ) : (
                  <p className="ticket-viewer-placeholder">Click a ticket file to view its contents.</p>
                )}
              </div>
            </div>
          </>
        )}
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
              <p className="kanban-cards-per-column">
                Cards per column: {kanbanCardsDisplay}
              </p>
            </div>
          </section>
          <section>
            <h3>Ticket Store</h3>
            <div className="build-info">
              <p>Store: Docs (read-only)</p>
              <p>Connected: {String(ticketStoreConnected)}</p>
              <p>Last refresh: {ticketStoreLastRefresh ? ticketStoreLastRefresh.toISOString() : 'never'}</p>
              <p>Last error: {ticketStoreLastError ?? 'none'}</p>
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
