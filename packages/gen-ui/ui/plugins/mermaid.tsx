import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import mermaid from "mermaid"

type MermaidData = {
  title?: string
  definition?: string
  code?: string
  chart?: string
  theme?: "default" | "base" | "dark" | "forest" | "neutral"
}

let renderCount = 0

export function MermaidPlugin(props: { data: MermaidData | string }) {
  let container: HTMLDivElement | undefined
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string>()
  let disposed = false

  createEffect(() => {
    const source = normalizeMermaid(props.data)
    const current = ++renderCount

    setLoading(true)
    setError(undefined)

    if (!container) return
    container.innerHTML = ""

    if (!source.definition.trim()) {
      setError("Mermaid diagram data is missing a definition.")
      setLoading(false)
      return
    }

    mermaid.initialize({
      startOnLoad: false,
      theme: source.theme ?? "dark",
      securityLevel: "strict",
    })

    void mermaid
      .render(`a2ui-mermaid-${current}`, source.definition)
      .then((result) => {
        if (disposed || !container) return
        container.innerHTML = result.svg
        result.bindFunctions?.(container)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to render Mermaid diagram."))
      .finally(() => setLoading(false))
  })

  onCleanup(() => {
    disposed = true
    if (container) container.innerHTML = ""
  })

  return (
    <PluginFrame title={normalizeMermaid(props.data).title ?? "Diagram"}>
      <Show when={loading()}>
        <PluginStatus>Rendering diagram...</PluginStatus>
      </Show>
      <Show when={error()}>
        {(message) => <PluginError message={message()} />}
      </Show>
      <div ref={container} style={{ padding: "16px", overflow: "auto", "min-height": "220px" }} />
    </PluginFrame>
  )
}

function normalizeMermaid(data: MermaidData | string) {
  if (typeof data === "string") return { definition: data }
  return {
    title: data.title,
    definition: data.definition ?? data.code ?? data.chart ?? "",
    theme: data.theme,
  }
}

function PluginFrame(props: { title: string; children: import("solid-js").JSX.Element }) {
  return (
    <div style={{ padding: "18px", color: "var(--text-base)" }}>
      <div style={{ "font-size": "12px", "font-weight": "600", color: "var(--text-weak)", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "12px" }}>
        {props.title}
      </div>
      {props.children}
    </div>
  )
}

function PluginStatus(props: { children: import("solid-js").JSX.Element }) {
  return <div style={{ padding: "12px", color: "var(--text-weak)", "font-size": "13px" }}>{props.children}</div>
}

function PluginError(props: { message: string }) {
  return <div style={{ padding: "12px", color: "#ff9b9b", "font-size": "13px" }}>{props.message}</div>
}
