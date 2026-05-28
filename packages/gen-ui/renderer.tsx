import { createEffect, createSignal, Show } from "solid-js"
import type { GenUIAction, GenUISchema, WidgetSchema } from "./schema"
import { resolveWidgetRoute } from "./registry"
import { DialogRenderer } from "./dialog-renderer"

export interface RenderWidgetProps {
  schema: WidgetSchema
  title?: string
  height?: number | string
}

export interface RenderGenUIProps {
  schema: GenUISchema
  title?: string
  height?: number | string
  onAction?: (action: GenUIAction) => void
}

export function RenderGenUI(props: RenderGenUIProps) {
  return (
    <Show
      when={props.schema.type === "dialog"}
      fallback={() => {
        if (props.schema.type === "dialog") return undefined
        return <RenderWidget schema={props.schema as WidgetSchema} title={props.title} height={props.height} />
      }}
    >
      {() => {
        if (props.schema.type !== "dialog") return undefined
        // Schema type guard ensures this is DialogSchema
        return <DialogRenderer schema={props.schema} onAction={props.onAction} />
      }}
    </Show>
  )
}

export function RenderWidget(props: RenderWidgetProps) {
  let frame: HTMLIFrameElement | undefined
  const [loaded, setLoaded] = createSignal(false)
  const route = () => resolveWidgetRoute(props.schema)
  const height = () => (typeof props.height === "number" ? `${props.height}px` : (props.height ?? "420px"))
  const html = () => htmlFromWidgetSchema(props.schema)

  const postSchema = () => {
    const target = frame?.contentWindow
    if (!target || !loaded()) return
    target.postMessage({ type: "opencode:widget-schema", schema: props.schema }, window.location.origin)
  }

  createEffect(postSchema)

  return (
    <Show
      when={route()}
      fallback={
        <Show
          when={html()}
          fallback={
            <div style={{ padding: "12px", color: "var(--text-weak, #888)" }}>
              Unknown widget: {props.schema.widget}
            </div>
          }
        >
          {(srcdoc) => (
            <iframe
              title={props.title ?? "HTML widget"}
              srcdoc={srcdoc()}
              sandbox="allow-scripts"
              style={{
                width: "100%",
                height: height(),
                border: "none",
                display: "block",
                "border-radius": "8px",
                background: "var(--surface-base, #111)",
              }}
            />
          )}
        </Show>
      }
    >
      {(src) => (
        <iframe
          ref={frame}
          title={props.title ?? `${props.schema.widget} widget`}
          src={src()}
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => {
            setLoaded(true)
            postSchema()
          }}
          style={{
            width: "100%",
            height: height(),
            border: "none",
            display: "block",
            "border-radius": "8px",
            background: "var(--surface-base, #111)",
          }}
        />
      )}
    </Show>
  )
}

function htmlFromWidgetSchema(schema: WidgetSchema) {
  if (looksLikeHtml(schema.widget)) return schema.widget

  const props = schema.props as { html?: unknown } | undefined
  if (looksLikeHtml(props?.html)) return props.html

  return undefined
}

function looksLikeHtml(value: unknown): value is string {
  return typeof value === "string" && /^\s*(<!doctype html|<html|<body|<script|<div|<canvas)/i.test(value)
}
