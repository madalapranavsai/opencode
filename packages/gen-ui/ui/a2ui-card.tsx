import { createMemo, ErrorBoundary, Match, Show, Switch } from "solid-js"
import type { ToolProps } from "@opencode-ai/ui/message-part"
import { BasicTool } from "@opencode-ai/ui/basic-tool"
import type { A2UIMetadata } from "../tools/a2ui"
import { BarChart } from "./catalog/bar-chart"
import { LineChart } from "./catalog/line-chart"
import { DataTable } from "./catalog/data-table"
import { MetricCard } from "./catalog/metric-card"
import { Timeline } from "./catalog/timeline"
import { Progress } from "./catalog/progress"
import { RenderGenUI, RenderWidget } from "../renderer"
import type { GenUISchema, WidgetSchema } from "../schema"
import { MermaidPlugin } from "./plugins/mermaid"
import { PlotlyPlugin } from "./plugins/plotly"
import { D3Plugin } from "./plugins/d3"
import { LeafletPlugin } from "./plugins/leaflet"
import { ThreeJSPlugin } from "./plugins/threejs"
import { AgGridPlugin } from "./plugins/ag-grid"

export function A2UICard(props: ToolProps) {
  const pending = createMemo(() => props.status === "pending" || props.status === "running")
  const meta = createMemo(() => props.metadata as Partial<A2UIMetadata>)
  const widgetSchema = createMemo(() => {
    const data = meta().data
    if (isWidgetSchema(data)) return data
    return undefined
  })
  const genUISchema = createMemo(() => {
    const data = meta().data
    if (isGenUISchema(data)) return data
    return undefined
  })
  const htmlSrcDoc = createMemo(() => {
    const data = meta().data
    if (typeof data === "string" && looksLikeHtml(data)) return data
    if (data && typeof data === "object" && "html" in data && looksLikeHtml((data as { html?: unknown }).html)) {
      return (data as { html: string }).html
    }
    return undefined
  })

  return (
    <BasicTool
      {...props}
      defaultOpen
      icon="window-cursor"
      trigger={{
        title: meta().title ?? "UI Widget",
        subtitle: pending() ? "Generating..." : (meta().component ?? ""),
      }}
    >
      <Show when={!pending() && meta().component && meta().data}>
        <div style={{
          "border-radius": "8px", overflow: "hidden",
          border: "1px solid var(--border-weak-base, #2a2a2a)",
          background: "var(--surface-base, #111)",
        }}>
          <ErrorBoundary fallback={(error) => <PluginError error={error} />}>
            <Switch fallback={
              <Show when={htmlSrcDoc()}>
                <iframe
                  srcdoc={htmlSrcDoc()}
                  sandbox="allow-scripts"
                  style={{ width: "100%", height: "400px", border: "none", display: "block" }}
                />
              </Show>
            }>
              <Match when={genUISchema()}>
                {(schema) => <RenderGenUI schema={schema()} title={meta().title} />}
              </Match>
              <Match when={widgetSchema()}>
                {(schema) => <RenderWidget schema={schema()} title={meta().title} />}
              </Match>
              <Match when={meta().component === "bar_chart"}>
                <BarChart data={meta().data as any} />
              </Match>
              <Match when={meta().component === "line_chart"}>
                <LineChart data={meta().data as any} />
              </Match>
              <Match when={meta().component === "table"}>
                <DataTable data={meta().data as any} />
              </Match>
              <Match when={meta().component === "metric_card"}>
                <MetricCard data={meta().data as any} />
              </Match>
              <Match when={meta().component === "timeline"}>
                <Timeline data={meta().data as any} />
              </Match>
              <Match when={meta().component === "progress"}>
                <Progress data={meta().data as any} />
              </Match>
              <Match when={meta().component === "mermaid"}>
                <MermaidPlugin data={meta().data as any} />
              </Match>
              <Match when={meta().component === "plotly"}>
                <PlotlyPlugin data={meta().data as any} />
              </Match>
              <Match when={meta().component === "d3"}>
                <D3Plugin data={meta().data as any} />
              </Match>
              <Match when={meta().component === "leaflet"}>
                <LeafletPlugin data={meta().data as any} />
              </Match>
              <Match when={meta().component === "threejs"}>
                <ThreeJSPlugin data={meta().data as any} />
              </Match>
              <Match when={meta().component === "ag_grid"}>
                <AgGridPlugin data={meta().data as any} />
              </Match>
            </Switch>
          </ErrorBoundary>
        </div>
      </Show>
    </BasicTool>
  )
}

function isWidgetSchema(value: unknown): value is WidgetSchema {
  return Boolean(value && typeof value === "object" && "widget" in value && typeof (value as WidgetSchema).widget === "string")
}

function isGenUISchema(value: unknown): value is GenUISchema {
  if (!value || typeof value !== "object" || !("type" in value)) return false
  const schema = value as GenUISchema
  if (schema.type === "dialog") return Boolean("dialog" in schema && schema.dialog?.options)
  return schema.type === "widget" && "widget" in schema
}

function looksLikeHtml(value: unknown): value is string {
  return typeof value === "string" && /^\s*(<!doctype html|<html|<body|<script|<div|<canvas)/i.test(value)
}

function PluginError(props: { error: unknown }) {
  const message = () => props.error instanceof Error ? props.error.message : "Unable to render this UI component."
  return (
    <div style={{ padding: "14px", color: "#ff9b9b", "font-size": "13px" }}>
      {message()}
    </div>
  )
}
