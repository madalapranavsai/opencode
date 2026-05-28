import { For, createMemo } from "solid-js"

export function BarChart(props: { data: { title: string; labels: string[]; values: number[] } }) {
  const max = createMemo(() => Math.max(...props.data.values, 1))
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ "font-size": "12px", "font-weight": "600", color: "var(--text-weak)", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "16px" }}>
        {props.data.title}
      </div>
      <div style={{ display: "flex", "align-items": "flex-end", gap: "6px", height: "140px" }}>
        <For each={props.data.values}>
          {(val, i) => (
            <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", flex: "1", height: "100%", "justify-content": "flex-end" }}>
              <div style={{ "font-size": "10px", color: "var(--text-weak)", "margin-bottom": "4px" }}>{val}</div>
              <div style={{
                width: "100%",
                height: `${(val / max()) * 110}px`,
                background: "var(--accent-base, #7c6af7)",
                "border-radius": "3px 3px 0 0",
                "min-height": "2px",
              }} />
              <div style={{ "font-size": "10px", color: "var(--text-weak)", "margin-top": "6px", "text-align": "center", "word-break": "break-word" }}>
                {props.data.labels[i()]}
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
