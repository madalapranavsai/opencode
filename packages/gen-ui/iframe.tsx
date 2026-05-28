import { createSignal, onCleanup, onMount, Show, type Component } from "solid-js"
import type { WidgetSchema } from "./schema"

export interface WidgetIframeRuntimeProps<TSchema extends WidgetSchema<object> = WidgetSchema<object>> {
  component: Component<{ schema: TSchema }>
}

export function WidgetIframeRuntime<TSchema extends WidgetSchema<object>>(props: WidgetIframeRuntimeProps<TSchema>) {
  const [schema, setSchema] = createSignal<TSchema>()

  onMount(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== "opencode:widget-schema") return
      setSchema(() => event.data.schema as TSchema)
    }

    window.addEventListener("message", onMessage)
    window.parent?.postMessage({ type: "opencode:widget-ready" }, window.location.origin)
    onCleanup(() => window.removeEventListener("message", onMessage))
  })

  const Component = props.component

  return (
    <Show
      when={schema()}
      fallback={
        <div style={{ padding: "16px", color: "var(--text-weak, #888)", "font-family": "system-ui, sans-serif" }}>
          Loading widget...
        </div>
      }
    >
      {(value) => <Component schema={value()} />}
    </Show>
  )
}
