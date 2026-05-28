import { createMemo, Show } from "solid-js"
import type { ToolProps } from "@opencode-ai/ui/message-part"
import { BasicTool } from "@opencode-ai/ui/basic-tool"
import type { WeatherMetadata } from "../tools/weather"

export function WeatherCard(props: ToolProps) {
  const pending = createMemo(() => props.status === "pending" || props.status === "running")
  const meta = createMemo(() => props.metadata as Partial<WeatherMetadata>)
  const unitLabel = createMemo(() => (meta().units === "imperial" ? "°F" : "°C"))
  const windUnit = createMemo(() => (meta().units === "imperial" ? "mph" : "km/h"))

  return (
    <BasicTool
      {...props}
      defaultOpen
      icon="cloud"
      trigger={{
        title: "Weather",
        subtitle: props.input?.location ?? "",
      }}
    >
      <Show when={!pending() && meta().temperature !== undefined}>
        <div
          style={{
            padding: "16px",
            "border-radius": "10px",
            background: "var(--surface-raised-base, #1e1e2e)",
            border: "1px solid var(--border-weak-base, #333)",
            "max-width": "320px",
            "font-family": "inherit",
          }}
        >
          {/* Location */}
          <div
            style={{
              "font-size": "11px",
              "text-transform": "uppercase",
              "letter-spacing": "0.08em",
              color: "var(--text-weak, #888)",
              "margin-bottom": "8px",
            }}
          >
            WEATHER IN
          </div>
          <div
            style={{
              "font-size": "18px",
              "font-weight": "600",
              color: "var(--text-strong, #fff)",
              "margin-bottom": "16px",
            }}
          >
            {meta().location}
          </div>

          {/* Temperature row */}
          <div
            style={{
              display: "flex",
              "align-items": "flex-end",
              gap: "12px",
              "margin-bottom": "16px",
            }}
          >
            <div style={{ "font-size": "48px", "line-height": "1" }}>
              {meta().icon}
            </div>
            <div>
              <div
                style={{
                  "font-size": "42px",
                  "font-weight": "300",
                  "line-height": "1",
                  color: "var(--text-strong, #fff)",
                }}
              >
                {meta().temperature}
                <span style={{ "font-size": "20px", "vertical-align": "top", "margin-top": "8px", display: "inline-block" }}>
                  {unitLabel()}
                </span>
              </div>
              <div style={{ "font-size": "13px", color: "var(--text-weak, #888)", "margin-top": "2px" }}>
                {meta().description}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              "grid-template-columns": "1fr 1fr 1fr",
              gap: "8px",
              "border-top": "1px solid var(--border-weak-base, #333)",
              "padding-top": "12px",
            }}
          >
            <StatItem label="Feels like" value={`${meta().feels_like}${unitLabel()}`} />
            <StatItem label="Humidity" value={`${meta().humidity}%`} />
            <StatItem label="Wind" value={`${meta().wind_speed} ${windUnit()}`} />
          </div>
        </div>
      </Show>
    </BasicTool>
  )
}

function StatItem(props: { label: string; value: string }) {
  return (
    <div style={{ "text-align": "center" }}>
      <div style={{ "font-size": "11px", color: "var(--text-weak, #888)", "margin-bottom": "2px" }}>
        {props.label}
      </div>
      <div style={{ "font-size": "13px", "font-weight": "500", color: "var(--text-base, #ccc)" }}>
        {props.value}
      </div>
    </div>
  )
}