import { createSignal, For, Show } from "solid-js"
import { GenUIActionBus } from "./action-bus"
import type { DialogOption, DialogSchema, GenUIAction } from "./schema"

export interface DialogRendererProps {
  schema: DialogSchema
  onAction?: (action: GenUIAction) => void
}

export function DialogRenderer(props: DialogRendererProps) {
  const [selected, setSelected] = createSignal<DialogOption>()
  const [submitted, setSubmitted] = createSignal(false)

  const select = (option: DialogOption) => {
    if (submitted()) return
    setSelected(option)
    setSubmitted(true)
    const action: GenUIAction = {
      type: "gen-ui:dialog.select",
      value: option.value,
      label: option.label,
      schema: props.schema,
    }

    GenUIActionBus.dispatch(action)
    props.onAction?.(action)
  }

  return (
    <div
      style={{
        padding: "14px",
        border: "1px solid var(--border-weak-base, #2a2a2a)",
        "border-radius": "8px",
        background: "var(--surface-base, #111)",
        color: "var(--text-base, #ddd)",
      }}
    >
      <div style={{ "font-size": "14px", "font-weight": 600, color: "var(--text-strong, #fff)" }}>
        {props.schema.dialog.title}
      </div>
      <Show when={props.schema.dialog.description}>
        <div style={{ "font-size": "12px", color: "var(--text-weak, #888)", "margin-top": "4px" }}>
          {props.schema.dialog.description}
        </div>
      </Show>
      <div style={{ display: "grid", gap: "8px", "margin-top": "12px" }}>
        <For each={props.schema.dialog.options}>
          {(option) => {
            const active = () => selected()?.value === option.value
            return (
              <button
                type="button"
                onClick={() => select(option)}
                disabled={submitted()}
                aria-pressed={active()}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: active() ? "1px solid var(--border-focus-base, #8ab4ff)" : "1px solid var(--border-weak-base, #2a2a2a)",
                  "border-radius": "8px",
                  background: active() ? "rgba(138, 180, 255, 0.12)" : "var(--surface-raised-base, #181818)",
                  color: "var(--text-strong, #fff)",
                  "text-align": "left",
                  cursor: submitted() ? "default" : "pointer",
                  "font-family": "inherit",
                  opacity: submitted() && !active() ? 0.58 : 1,
                }}
              >
                <span style={{ display: "block", "font-size": "13px", "font-weight": 600 }}>{option.label}</span>
                <Show when={option.description}>
                  <span style={{ display: "block", "font-size": "12px", color: "var(--text-weak, #888)", "margin-top": "2px" }}>
                    {option.description}
                  </span>
                </Show>
              </button>
            )
          }}
        </For>
      </div>
    </div>
  )
}
