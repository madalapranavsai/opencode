import { createMemo } from "solid-js"

export function LineChart(props: { data: { title: string; labels: string[]; values: number[] } }) {
  const max = createMemo(() => Math.max(...props.data.values, 1))
  const min = createMemo(() => Math.min(...props.data.values, 0))
  const range = createMemo(() => max() - min() || 1)
  const W = 400
  const H = 120
  const pad = 10

  const points = createMemo(() =>
    props.data.values.map((v, i) => {
      const x = pad + (i / (props.data.values.length - 1 || 1)) * (W - pad * 2)
      const y = H - pad - ((v - min()) / range()) * (H - pad * 2)
      return `${x},${y}`
    }).join(" ")
  )

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ "font-size": "12px", "font-weight": "600", color: "var(--text-weak)", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "12px" }}>
        {props.data.title}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "120px" }}>
        <polyline
          points={points()}
          fill="none"
          stroke="var(--accent-base, #7c6af7)"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        {props.data.values.map((v, i) => {
          const x = pad + (i / (props.data.values.length - 1 || 1)) * (W - pad * 2)
          const y = H - pad - ((v - min()) / range()) * (H - pad * 2)
          return <circle cx={x} cy={y} r="3" fill="var(--accent-base, #7c6af7)" />
        })}
      </svg>
      <div style={{ display: "flex", "justify-content": "space-between", "margin-top": "4px" }}>
        <span style={{ "font-size": "10px", color: "var(--text-weak)" }}>{props.data.labels[0]}</span>
        <span style={{ "font-size": "10px", color: "var(--text-weak)" }}>{props.data.labels[props.data.labels.length - 1]}</span>
      </div>
    </div>
  )
}
