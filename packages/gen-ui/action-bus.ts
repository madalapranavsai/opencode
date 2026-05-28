import type { GenUIAction } from "./schema"

type ActionHandler = (action: GenUIAction) => void

const handlers = new Set<ActionHandler>()

export const GenUIActionBus = {
  subscribe(handler: ActionHandler) {
    handlers.add(handler)
    return () => handlers.delete(handler)
  },

  dispatch(action: GenUIAction) {
    for (const handler of handlers) handler(action)

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<GenUIAction>("gen-ui:action", { detail: action }))
    }
  },
}
