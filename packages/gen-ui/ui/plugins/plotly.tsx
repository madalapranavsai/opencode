import { createEffect, createSignal, onCleanup, Show } from "solid-js"

const PLOTLY_SRC = "https://cdn.plot.ly/plotly-3.5.1.min.js"

type PlotlyData = {
  title?: string
  data?: unknown[]
  traces?: unknown[]
  layout?: Record<string, unknown>
  config?: Record<string, unknown>
}

type PlotlyApi = {
  react: (element: HTMLElement, data: unknown[], layout?: Record<string, unknown>, config?: Record<string, unknown>) => Promise<unknown>
  purge: (element: HTMLElement) => void
}

declare global {
  interface Window {
    Plotly?: PlotlyApi
  }
}

export function PlotlyPlugin(props: { data: PlotlyData }) {
  let container: HTMLDivElement | undefined
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string>()

  createEffect(() => {
    if (!container) return
    const traces = props.data.data ?? props.data.traces ?? []

    setLoading(true)
    setError(undefined)

    if (!Array.isArray(traces) || traces.length === 0) {
      setError("Plotly chart data must include a non-empty data or traces array.")
      setLoading(false)
      return
    }

    const layout = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#d6d8de" },
      margin: { t: props.data.title ? 44 : 20, r: 20, b: 44, l: 48 },
      title: props.data.title ? { text: props.data.title } : undefined,
      ...(props.data.layout ?? {}),
    }

    void loadPlotly()
      .then((plotly) => plotly.react(container, traces, layout, { responsive: true, displayModeBar: false, ...(props.data.config ?? {}) }))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to render Plotly chart."))
      .finally(() => setLoading(false))
  })

  onCleanup(() => {
    if (container && window.Plotly) window.Plotly.purge(container)
  })

  return (
    <div style={{ position: "relative", height: "420px", width: "100%" }}>
      <Show when={loading()}>
        <PluginStatus>Rendering chart...</PluginStatus>
      </Show>
      <Show when={error()}>
        {(message) => <PluginError message={message()} />}
      </Show>
      <div ref={container} style={{ width: "100%", height: "100%" }} />
    </div>
  )
}

function loadPlotly() {
  if (window.Plotly) return Promise.resolve(window.Plotly)

  return new Promise<PlotlyApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLOTLY_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => (window.Plotly ? resolve(window.Plotly) : reject(new Error("Plotly unavailable"))), { once: true })
      existing.addEventListener("error", () => reject(new Error("Failed to load Plotly")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = PLOTLY_SRC
    script.async = true
    script.onload = () => (window.Plotly ? resolve(window.Plotly) : reject(new Error("Plotly unavailable")))
    script.onerror = () => reject(new Error("Failed to load Plotly"))
    document.head.appendChild(script)
  })
}

function PluginStatus(props: { children: import("solid-js").JSX.Element }) {
  return <div style={{ position: "absolute", inset: "0", display: "grid", "place-items": "center", color: "var(--text-weak)", "font-size": "13px" }}>{props.children}</div>
}

function PluginError(props: { message: string }) {
  return <div style={{ padding: "14px", color: "#ff9b9b", "font-size": "13px" }}>{props.message}</div>
}
