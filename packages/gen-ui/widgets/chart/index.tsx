import { WidgetIframeRuntime } from "../../iframe"
import type { ChartWidgetSchema } from "../../schema"
import { ChartWidget } from "./chart-widget"

export default function ChartWidgetRoute() {
  return <WidgetIframeRuntime<ChartWidgetSchema> component={ChartWidget} />
}

export { ChartWidget }
