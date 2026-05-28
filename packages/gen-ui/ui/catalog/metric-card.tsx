import { For, Show } from "solid-js"

type Metric = { label: string; value: string; change?: string; trend?: "up" | "down" }

export function MetricCard(props: { data: { metrics: Metric[] } }) {
  return (
    <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", padding: "16px" }}>
      <For each={props.data.metrics}>
        {(m) => (
          <div style={{
            padding: "16px", background: "var(--surface-raised-base, rgba(255,255,255,0.04))",
            "border-radius": "8px", border: "1px solid var(--border-weak-base, #2a2a2a)",
          }}>
            <div style={{ "font-size": "11px", color: "var(--text-weak)", "margin-bottom": "8px", "text-transform": "uppercase", "letter-spacing": "0.06em" }}>
              {m.label}
            </div>
            <div style={{ "font-size": "22px", "font-weight": "700", color: "var(--text-strong)", "line-height": "1" }}>
              {m.value}
            </div>
            <Show when={m.change}>
              <div style={{
                "font-size": "12px", "margin-top": "6px",
                color: m.trend === "up" ? "#4ade80" : m.trend === "down" ? "#f87171" : "var(--text-weak)",
              }}>
                {m.trend === "up" ? "↑ " : m.trend === "down" ? "↓ " : ""}{m.change}
              </div>
            </Show>
          </div>
        )}
      </For>
    </div>
  )
}
