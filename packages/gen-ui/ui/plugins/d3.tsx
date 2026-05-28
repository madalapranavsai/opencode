import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import * as d3 from "d3"

type D3Datum = { label?: string; x?: number | string; y?: number; value?: number; color?: string }
type D3Data = {
  title?: string
  type?: "bar" | "line" | "scatter"
  values?: number[]
  labels?: string[]
  points?: D3Datum[]
  data?: D3Datum[]
}

export function D3Plugin(props: { data: D3Data }) {
  let svg: SVGSVGElement | undefined
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string>()

  createEffect(() => {
    if (!svg) return
    setLoading(true)
    setError(undefined)
    d3.select(svg).selectAll("*").remove()

    try {
      const points = normalizePoints(props.data)
      if (points.length === 0) throw new Error("D3 visualization data must include values, points, or data.")
      renderChart(svg, props.data, points)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to render D3 visualization.")
    } finally {
      setLoading(false)
    }
  })

  onCleanup(() => {
    if (svg) d3.select(svg).selectAll("*").remove()
  })

  return (
    <div style={{ padding: "18px" }}>
      <Show when={props.data.title}>
        <div style={{ "font-size": "12px", "font-weight": "600", color: "var(--text-weak)", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "12px" }}>
          {props.data.title}
        </div>
      </Show>
      <Show when={loading()}>
        <PluginStatus>Rendering visualization...</PluginStatus>
      </Show>
      <Show when={error()}>
        {(message) => <PluginError message={message()} />}
      </Show>
      <svg ref={svg} viewBox="0 0 720 320" style={{ width: "100%", height: "320px", display: "block" }} />
    </div>
  )
}

function renderChart(svg: SVGSVGElement, data: D3Data, points: Required<Pick<D3Datum, "label" | "y">>[]) {
  const width = 720
  const height = 320
  const margin = { top: 20, right: 24, bottom: 42, left: 52 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom
  const root = d3.select(svg)
  const chart = root.append("g").attr("transform", `translate(${margin.left},${margin.top})`)
  const max = d3.max(points, (point) => point.y) ?? 1
  const min = Math.min(0, d3.min(points, (point) => point.y) ?? 0)
  const y = d3.scaleLinear().domain([min, max]).nice().range([chartHeight, 0])
  const x = d3.scalePoint(points.map((point) => point.label), [0, chartWidth]).padding(0.5)

  chart.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x)).attr("color", "#8f96a3")
  chart.append("g").call(d3.axisLeft(y).ticks(5)).attr("color", "#8f96a3")
  chart.append("g").attr("stroke", "rgba(255,255,255,0.08)").call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat(() => ""))

  if (data.type === "line" || data.type === "scatter") {
    const line = d3
      .line<Required<Pick<D3Datum, "label" | "y">>>()
      .x((point) => x(point.label) ?? 0)
      .y((point) => y(point.y))
      .curve(d3.curveMonotoneX)

    if (data.type === "line") {
      chart.append("path").datum(points).attr("d", line).attr("fill", "none").attr("stroke", "#8ab4ff").attr("stroke-width", 3)
    }

    chart
      .selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (point) => x(point.label) ?? 0)
      .attr("cy", (point) => y(point.y))
      .attr("r", 5)
      .attr("fill", "#9ee493")
    return
  }

  const band = d3.scaleBand(points.map((point) => point.label), [0, chartWidth]).padding(0.24)
  chart
    .selectAll("rect")
    .data(points)
    .enter()
    .append("rect")
    .attr("x", (point) => band(point.label) ?? 0)
    .attr("y", (point) => y(Math.max(0, point.y)))
    .attr("width", band.bandwidth())
    .attr("height", (point) => Math.abs(y(point.y) - y(0)))
    .attr("fill", "#8ab4ff")
    .attr("rx", 3)
}

function normalizePoints(data: D3Data): Required<Pick<D3Datum, "label" | "y">>[] {
  if (Array.isArray(data.values)) {
    return data.values.map((value, index) => ({ label: data.labels?.[index] ?? String(index + 1), y: value }))
  }
  return (data.points ?? data.data ?? []).map((point, index) => ({
    label: point.label ?? String(point.x ?? index + 1),
    y: point.y ?? point.value ?? 0,
  }))
}

function PluginStatus(props: { children: import("solid-js").JSX.Element }) {
  return <div style={{ padding: "12px", color: "var(--text-weak)", "font-size": "13px" }}>{props.children}</div>
}

function PluginError(props: { message: string }) {
  return <div style={{ padding: "12px", color: "#ff9b9b", "font-size": "13px" }}>{props.message}</div>
}
