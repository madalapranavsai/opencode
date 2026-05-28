import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import * as THREE from "three"

type ThreeObject = {
  type?: "box" | "sphere" | "cone"
  color?: string
  position?: [number, number, number]
  scale?: [number, number, number] | number
}

type ThreeData = {
  title?: string
  objects?: ThreeObject[]
  background?: string
}

export function ThreeJSPlugin(props: { data: ThreeData }) {
  let container: HTMLDivElement | undefined
  let renderer: THREE.WebGLRenderer | undefined
  let frame = 0
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string>()

  createEffect(() => {
    if (!container) return
    setLoading(true)
    setError(undefined)
    cleanup()

    try {
      const width = container.clientWidth || 720
      const height = 420
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(props.data.background ?? "#101114")

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
      camera.position.set(0, 1.6, 6)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      container.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0xffffff, 0.72))
      const key = new THREE.DirectionalLight(0xffffff, 1.2)
      key.position.set(3, 5, 4)
      scene.add(key)

      const group = new THREE.Group()
      scene.add(group)

      const objects: ThreeObject[] = props.data.objects?.length ? props.data.objects : [{ type: "box", color: "#8ab4ff" }]
      objects.forEach((object, index) => {
        const mesh = new THREE.Mesh(createGeometry(object.type), new THREE.MeshStandardMaterial({ color: object.color ?? colorFor(index), roughness: 0.48, metalness: 0.12 }))
        const x = object.position?.[0] ?? (index - (objects.length - 1) / 2) * 1.6
        const y = object.position?.[1] ?? 0
        const z = object.position?.[2] ?? 0
        mesh.position.set(x, y, z)
        if (Array.isArray(object.scale)) mesh.scale.set(object.scale[0], object.scale[1], object.scale[2])
        else if (typeof object.scale === "number") mesh.scale.setScalar(object.scale)
        group.add(mesh)
      })

      const animate = () => {
        frame = requestAnimationFrame(animate)
        group.rotation.y += 0.008
        group.rotation.x = Math.sin(Date.now() / 1400) * 0.08
        renderer?.render(scene, camera)
      }

      animate()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to render 3D scene.")
    } finally {
      setLoading(false)
    }
  })

  onCleanup(cleanup)

  return (
    <div style={{ position: "relative", height: "420px", width: "100%", overflow: "hidden" }}>
      <Show when={props.data.title}>
        <div style={{ position: "absolute", top: "12px", left: "12px", "z-index": 2, color: "var(--text-base)", "font-size": "12px", "font-weight": "600", background: "rgba(17,17,17,0.78)", padding: "6px 8px", "border-radius": "6px" }}>
          {props.data.title}
        </div>
      </Show>
      <Show when={loading()}>
        <PluginStatus>Loading 3D scene...</PluginStatus>
      </Show>
      <Show when={error()}>
        {(message) => <PluginError message={message()} />}
      </Show>
      <div ref={container} style={{ width: "100%", height: "100%" }} />
    </div>
  )

  function cleanup() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    if (renderer) {
      renderer.dispose()
      renderer.domElement.remove()
      renderer = undefined
    }
  }
}

function createGeometry(type: ThreeObject["type"]) {
  if (type === "sphere") return new THREE.SphereGeometry(0.72, 32, 24)
  if (type === "cone") return new THREE.ConeGeometry(0.72, 1.35, 32)
  return new THREE.BoxGeometry(1.15, 1.15, 1.15)
}

function colorFor(index: number) {
  return ["#8ab4ff", "#9ee493", "#f6c177", "#f28fad"][index % 4]
}

function PluginStatus(props: { children: import("solid-js").JSX.Element }) {
  return <div style={{ position: "absolute", inset: "0", display: "grid", "place-items": "center", color: "var(--text-weak)", "font-size": "13px", "z-index": 3 }}>{props.children}</div>
}

function PluginError(props: { message: string }) {
  return <div style={{ position: "absolute", top: "12px", right: "12px", "z-index": 3, padding: "10px", color: "#ff9b9b", background: "rgba(17,17,17,0.88)", "border-radius": "6px", "font-size": "13px" }}>{props.message}</div>
}
