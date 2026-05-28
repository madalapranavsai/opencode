import { For } from "solid-js"

type ProgressItem = { label: string; value: number; max: number; color?: string }

export function Progress(props: { data: { items: ProgressItem[] } }) {
  return (
    <div style={{ padding: "16px 20px", display: "flex", "flex-direction": "column", gap: "12px" }}>
      <For each={props.data.items}>
        {(item) => {
          const pct = () => Math.min(100, Math.round((item.value / item.max) * 100))
          return (
            <div>
              <div style={{ display: "flex", "justify-content": "space-between", "margin-bottom": "6px" }}>
                <span style={{ "font-size": "13px", color: "var(--text-base)" }}>{item.label}</span>
                <span style={{ "font-size": "13px", color: "var(--text-weak)" }}>{item.value}/{item.max}</span>
              </div>
              <div style={{ height: "6px", background: "var(--surface-raised-base, #2a2a2a)", "border-radius": "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct()}%`,
                  background: item.color ?? "var(--accent-base, #7c6af7)",
                  "border-radius": "999px", transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}
