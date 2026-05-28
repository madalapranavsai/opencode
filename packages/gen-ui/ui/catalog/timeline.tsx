import { For, Show } from "solid-js"

export function Timeline(props: { data: { events: { date: string; title: string; description: string }[] } }) {
  return (
    <div style={{ padding: "16px 20px" }}>
      <For each={props.data.events}>
        {(event, i) => (
          <div style={{ display: "flex", gap: "14px" }}>
            <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", "flex-shrink": "0" }}>
              <div style={{
                width: "10px", height: "10px", "border-radius": "50%", "margin-top": "4px",
                background: "var(--accent-base, #7c6af7)", "flex-shrink": "0",
              }} />
              <Show when={i() < props.data.events.length - 1}>
                <div style={{ width: "2px", flex: "1", background: "var(--border-weak-base, #2a2a2a)", "min-height": "20px", "margin-top": "3px" }} />
              </Show>
            </div>
            <div style={{ "padding-bottom": "20px", "min-width": "0" }}>
              <div style={{ "font-size": "11px", color: "var(--text-weak)", "margin-bottom": "2px" }}>{event.date}</div>
              <div style={{ "font-size": "14px", "font-weight": "600", color: "var(--text-strong)", "margin-bottom": "3px" }}>{event.title}</div>
              <div style={{ "font-size": "13px", color: "var(--text-base)", "line-height": "1.5" }}>{event.description}</div>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}
