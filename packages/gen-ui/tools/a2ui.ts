import { Effect, Schema } from "effect"
import * as Tool from "opencode/tool/tool"

export const Parameters = Schema.Struct({
  component: Schema.String.annotate({
    description: `The UI component to render. Choose from:
- "gen_ui": Typed GenUI schema. data can be { type: "dialog", dialog: { title: string, description?: string, options: { label: string, value: string, description?: string }[] } } or { type: "widget", widget: "chart", engine: "chartjs", props: object }
- "widget": Iframe widget schema. For charts, data MUST be { widget: "chart", engine: "chartjs", props: { title?: string, type?: "line" | "bar", labels?: string[], data: Array<number | { label?: string, x?: string | number, y?: number, value?: number }> } }. Do not put HTML in data.widget.
- "bar_chart": Bar chart. data: { title: string, labels: string[], values: number[] }
- "line_chart": Line chart. data: { title: string, labels: string[], values: number[] }
- "table": Data table. data: { headers: string[], rows: string[][] }
- "metric_card": KPI cards. data: { metrics: { label: string, value: string, change?: string, trend?: "up" | "down" }[] }
- "timeline": Events. data: { events: { date: string, title: string, description: string }[] }
- "progress": Progress bars. data: { items: { label: string, value: number, max: number, color?: string }[] }
- "mermaid": Diagrams. data: { title?: string, definition: string, theme?: "default" | "base" | "dark" | "forest" | "neutral" }
- "plotly": Advanced charts. data: { title?: string, data: object[], layout?: object, config?: object }
- "d3": Custom visualizations. data: { title?: string, type?: "bar" | "line" | "scatter", values?: number[], labels?: string[], points?: { label?: string, x?: string | number, y?: number, value?: number }[] }
- "leaflet": Interactive maps. data: { title?: string, center?: [number, number] | { lat: number, lng: number }, zoom?: number, markers?: { lat: number, lng: number, label?: string, popup?: string }[] }
- "threejs": 3D scenes. data: { title?: string, background?: string, objects?: { type?: "box" | "sphere" | "cone", color?: string, position?: [number, number, number], scale?: number | [number, number, number] }[] }
- "ag_grid": Large interactive tables. data: { title?: string, columns?: string[] | object[], columnDefs?: object[], rows?: object[], rowData?: object[] }
- "html": Raw HTML. data: { html: string }`,
  }),
  title: Schema.String.annotate({
    description: "Short display title for the widget header",
  }),
  data: Schema.Unknown.annotate({
    description: "Structured data object matching the chosen component schema",
  }),
})

export interface A2UIMetadata {
  component: string
  title: string
  data: unknown
}

export const A2UITool = Tool.define(
  "render_ui",
  Effect.gen(function* () {
    return {
      description: `Render a rich interactive UI component directly in the chat.
Use this whenever the user wants to SEE data, visualize something, or get an interactive result.
Examples: charts, tables, metrics, timelines, progress trackers, diagrams, maps, 3D scenes, and large data grids.
When required inputs are missing, use component "gen_ui" with a dialog schema before rendering a widget.
When rendering an iframe chart, call this with component "widget" and data.widget "chart"; never generate raw HTML as data.widget.
Prefer purpose-built components for rich data: mermaid for diagrams, plotly for advanced charts, d3 for custom visualizations, leaflet for maps, threejs for 3D, and ag_grid for large tables.
Always prefer this over plain text when the data is visual or comparative.`,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          return {
            title: params.title,
            output: `[UI: ${params.component}] ${params.title}`,
            metadata: {
              component: params.component,
              title: params.title,
              data: params.data,
            } satisfies A2UIMetadata,
          }
        }),
    }
  }),
)
