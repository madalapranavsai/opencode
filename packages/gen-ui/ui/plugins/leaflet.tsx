import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type LeafletMarker = { lat: number; lng: number; label?: string; popup?: string }
type LeafletData = {
  title?: string
  center?: [number, number] | { lat: number; lng: number }
  zoom?: number
  markers?: LeafletMarker[]
  tileLayer?: string
}

export function LeafletPlugin(props: { data: LeafletData }) {
  let container: HTMLDivElement | undefined
  let map: L.Map | undefined
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string>()

  createEffect(() => {
    if (!container) return
    setLoading(true)
    setError(undefined)

    try {
      const center = normalizeCenter(props.data.center)
      if (!map) {
        map = L.map(container, { zoomControl: true }).setView(center, props.data.zoom ?? 3)
        L.tileLayer(props.data.tileLayer ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map)
      } else {
        map.setView(center, props.data.zoom ?? map.getZoom())
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) layer.remove()
        })
      }

      for (const marker of props.data.markers ?? []) {
        if (!Number.isFinite(marker.lat) || !Number.isFinite(marker.lng)) continue
        const pin = L.marker([marker.lat, marker.lng]).addTo(map)
        const label = marker.popup ?? marker.label
        if (label) pin.bindPopup(label)
      }

      queueMicrotask(() => map?.invalidateSize())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to render map.")
    } finally {
      setLoading(false)
    }
  })

  onCleanup(() => {
    map?.remove()
    map = undefined
  })

  return (
    <div style={{ position: "relative", height: "420px", width: "100%" }}>
      <Show when={props.data.title}>
        <div style={{ position: "absolute", top: "12px", left: "12px", "z-index": 500, padding: "6px 8px", background: "rgba(17,17,17,0.82)", color: "var(--text-base)", "border-radius": "6px", "font-size": "12px", "font-weight": "600" }}>
          {props.data.title}
        </div>
      </Show>
      <Show when={loading()}>
        <PluginStatus>Loading map...</PluginStatus>
      </Show>
      <Show when={error()}>
        {(message) => <PluginError message={message()} />}
      </Show>
      <div ref={container} style={{ width: "100%", height: "100%" }} />
    </div>
  )
}

function normalizeCenter(center: LeafletData["center"]): L.LatLngExpression {
  if (Array.isArray(center)) return center
  if (center) return [center.lat, center.lng]
  return [20, 0]
}

function PluginStatus(props: { children: import("solid-js").JSX.Element }) {
  return <div style={{ position: "absolute", inset: "0", display: "grid", "place-items": "center", color: "var(--text-weak)", "font-size": "13px", "z-index": 600 }}>{props.children}</div>
}

function PluginError(props: { message: string }) {
  return <div style={{ position: "absolute", top: "12px", right: "12px", "z-index": 600, padding: "10px", color: "#ff9b9b", background: "rgba(17,17,17,0.88)", "border-radius": "6px", "font-size": "13px" }}>{props.message}</div>
}
