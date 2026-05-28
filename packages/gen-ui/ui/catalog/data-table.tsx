import { For } from "solid-js"

export function DataTable(props: { data: { headers: string[]; rows: string[][] } }) {
  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "13px" }}>
        <thead>
          <tr>
            <For each={props.data.headers}>
              {(h) => (
                <th style={{
                  padding: "10px 14px", "text-align": "left",
                  "border-bottom": "1px solid var(--border-weak-base, #333)",
                  color: "var(--text-weak)", "font-weight": "500",
                  "font-size": "11px", "text-transform": "uppercase", "letter-spacing": "0.06em",
                  "white-space": "nowrap",
                }}>{h}</th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.data.rows}>
            {(row, ri) => (
              <tr style={{ background: ri() % 2 === 0 ? "transparent" : "var(--surface-raised-base, rgba(255,255,255,0.02))" }}>
                <For each={row}>
                  {(cell) => (
                    <td style={{
                      padding: "9px 14px",
                      "border-bottom": "1px solid var(--border-weak-base, #1f1f1f)",
                      color: "var(--text-base)",
                    }}>{cell}</td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}
