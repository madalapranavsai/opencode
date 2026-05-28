export type WidgetKind = "chart" | (string & {})

export interface WidgetSchema<TProps extends object = Record<string, unknown>> {
  widget: WidgetKind
  engine?: string
  props?: TProps
}

export type ChartDataPoint =
  | number
  | {
      label?: string
      x?: string | number
      y?: number
      value?: number
    }

export interface ChartWidgetProps {
  title?: string
  type?: "line" | "bar"
  labels?: string[]
  data: ChartDataPoint[]
}

export type ChartWidgetSchema = WidgetSchema<ChartWidgetProps> & {
  widget: "chart"
  engine: "chartjs"
}

export interface DialogOption {
  label: string
  value: string
  description?: string
}

export interface DialogSchema {
  type: "dialog"
  dialog: {
    title: string
    description?: string
    options: DialogOption[]
  }
}

export type WidgetRenderSchema = WidgetSchema & {
  type?: "widget"
}

export type GenUISchema = DialogSchema | WidgetRenderSchema

export interface GenUIAction {
  type: "gen-ui:dialog.select"
  value: string
  label: string
  schema: DialogSchema
}
