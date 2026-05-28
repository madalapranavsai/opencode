import type { WidgetSchema } from "./schema"

export interface WidgetRegistration {
  widget: string
  route: string
  engines?: string[]
}

export const widgetRegistry = {
  chart: {
    widget: "chart",
    route: "/widgets/chart",
    engines: ["chartjs"],
  },
} satisfies Record<string, WidgetRegistration>

export function resolveWidgetRoute(schema: WidgetSchema) {
  const widget = schema.widget
  // Runtime check ensures widget is in registry
  if (!(widget in widgetRegistry)) return undefined
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const registration = widgetRegistry[widget as keyof typeof widgetRegistry]
  if (registration.engines && schema.engine && !registration.engines.includes(schema.engine)) return undefined
  return registration.route
}

export function getWidgetRegistration(widget: string) {
  // Runtime check ensures widget is in registry
  if (!(widget in widgetRegistry)) return undefined
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return widgetRegistry[widget as keyof typeof widgetRegistry]
}
