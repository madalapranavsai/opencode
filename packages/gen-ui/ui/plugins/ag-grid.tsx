import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import { createGrid, type ColDef, type GridApi, type GridOptions } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"

type AgGridData = {
  title?: string
  columns?: Array<string | ColDef>
  columnDefs?: ColDef[]
  rows?: Record<string, unknown>[]
  rowData?: Record<string, unknown>[]
}

export function AgGridPlugin(props: { data: AgGridData }) {
  let container: HTMLDivElement | undefined
  let api: GridApi | undefined
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string>()

  createEffect(() => {
    if (!container) return
    setLoading(true)
    setError(undefined)

    try {
      api?.destroy()
      const rows = props.data.rowData ?? props.data.rows ?? []
      const columnDefs = normalizeColumns(props.data, rows)
      if (!Array.isArray(rows)) throw new Error("AG Grid data must include rows or rowData as an array.")
      if (columnDefs.length === 0) throw new Error("AG Grid data needs column definitions or at least one row.")

      const options: GridOptions = {
        columnDefs,
        rowData: rows,
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
          minWidth: 120,
          flex: 1,
        },
        animateRows: true,
        pagination: rows.length > 25,
        paginationPageSize: 25,
        suppressCellFocus: true,
      }

      api = createGrid(container, options)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to render AG Grid table.")
    } finally {
      setLoading(false)
    }
  })

  onCleanup(() => api?.destroy())

  return (
    <div style={{ height: "460px", width: "100%", padding: "14px", "box-sizing": "border-box" }}>
      <Show when={props.data.title}>
        <div style={{ "font-size": "12px", "font-weight": "600", color: "var(--text-weak)", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "10px" }}>
          {props.data.title}
        </div>
      </Show>
      <Show when={loading()}>
        <PluginStatus>Loading table...</PluginStatus>
      </Show>
      <Show when={error()}>
        {(message) => <PluginError message={message()} />}
      </Show>
      <div class="ag-theme-quartz-dark" ref={container} style={{ height: props.data.title ? "400px" : "432px", width: "100%" }} />
    </div>
  )
}

function normalizeColumns(data: AgGridData, rows: Record<string, unknown>[]): ColDef[] {
  if (data.columnDefs) return data.columnDefs
  if (data.columns) {
    return data.columns.map((column) => {
      if (typeof column === "string") return { field: column, headerName: titleCase(column) }
      return column
    })
  }
  return Object.keys(rows[0] ?? {}).map((field) => ({ field, headerName: titleCase(field) }))
}

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (match) => match.toUpperCase())
}

function PluginStatus(props: { children: import("solid-js").JSX.Element }) {
  return <div style={{ padding: "12px", color: "var(--text-weak)", "font-size": "13px" }}>{props.children}</div>
}

function PluginError(props: { message: string }) {
  return <div style={{ padding: "12px", color: "#ff9b9b", "font-size": "13px" }}>{props.message}</div>
}
