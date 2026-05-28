import { createEffect, onCleanup } from "solid-js"
import type { ChartDataPoint, ChartWidgetSchema } from "../../schema"

const CHART_JS_SRC = "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js"

type ChartInstance = {
  destroy: () => void
}

type ChartConstructor = new (canvas: HTMLCanvasElement, config: Record<string, unknown>) => ChartInstance

declare global {
  interface Window {
    Chart?: ChartConstructor
  }
}

export function ChartWidget(props: { schema: ChartWidgetSchema }) {
  let canvas: HTMLCanvasElement | undefined
  let chart: ChartInstance | undefined
  let version = 0

  createEffect(() => {
    const schema = props.schema
    if (!canvas) return

    const currentVersion = ++version
    const chartData = normalizeChartData(schema.props?.data ?? [])
    const type = schema.props?.type ?? "line"

    const config = {
      type,
      data: {
        labels: schema.props?.labels ?? chartData.labels,
        datasets: [
          {
            label: schema.props?.title ?? "Chart",
            data: chartData.values,
            borderColor: "#8ab4ff",
            backgroundColor: type === "bar" ? "rgba(138, 180, 255, 0.42)" : "rgba(138, 180, 255, 0.14)",
            pointBackgroundColor: "#8ab4ff",
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.36,
            fill: type === "line",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#d6d8de",
            },
          },
          title: {
            display: Boolean(schema.props?.title),
            text: schema.props?.title,
            color: "#f4f6fb",
            font: {
              size: 16,
              weight: "600",
            },
            padding: {
              bottom: 18,
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
            ticks: {
              color: "#aab0bd",
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
            ticks: {
              color: "#aab0bd",
            },
          },
        },
      },
    }

    void loadChartJs().then((Chart) => {
      if (currentVersion !== version || !canvas) return
      chart?.destroy()
      chart = new Chart(canvas, config)
    })
  })

  onCleanup(() => chart?.destroy())

  return (
    <div
      style={{
        height: "100vh",
        padding: "16px",
        "box-sizing": "border-box",
        background: "#101114",
        color: "#f4f6fb",
        "font-family": "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <canvas ref={canvas} aria-label={props.schema.props?.title ?? "Chart"} />
    </div>
  )
}

function loadChartJs() {
  if (window.Chart) return Promise.resolve(window.Chart)

  return new Promise<ChartConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHART_JS_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => (window.Chart ? resolve(window.Chart) : reject(new Error("Chart.js unavailable"))), {
        once: true,
      })
      existing.addEventListener("error", () => reject(new Error("Failed to load Chart.js")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = CHART_JS_SRC
    script.async = true
    script.onload = () => (window.Chart ? resolve(window.Chart) : reject(new Error("Chart.js unavailable")))
    script.onerror = () => reject(new Error("Failed to load Chart.js"))
    document.head.appendChild(script)
  })
}

function normalizeChartData(data: ChartDataPoint[]) {
  return data.reduce(
    (acc, point, index) => {
      if (typeof point === "number") {
        acc.labels.push(String(index + 1))
        acc.values.push(point)
        return acc
      }

      acc.labels.push(point.label ?? String(point.x ?? index + 1))
      acc.values.push(point.y ?? point.value ?? 0)
      return acc
    },
    { labels: [] as string[], values: [] as number[] },
  )
}
