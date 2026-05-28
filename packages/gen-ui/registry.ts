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
  const registration = widgetRegistry[schema.widget as keyof typeof widgetRegistry]
  if (!registration) return undefined
  if (registration.engines && schema.engine && !registration.engines.includes(schema.engine)) return undefined
  return registration.route
}

export function getWidgetRegistration(widget: string) {
  return widgetRegistry[widget as keyof typeof widgetRegistry]
}
