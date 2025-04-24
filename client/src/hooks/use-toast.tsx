import * as React from "react"

// Import these types from shadcn toast component
type ToastActionElement = React.ReactElement<{
  className?: string;
  altText?: string;
  onClick?: () => void;
}>;

type ToastProps = {
  id?: string;
  className?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  onOpenChange?: (open: boolean) => void;
};

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToastType = "default" | "success" | "warning" | "destructive" | "info"

type ToastOptions = {
  type?: ToastType 
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
  icon?: React.ReactNode
  duration?: number
}

export interface Toast extends ToastOptions {
  id: string
  visible: boolean
  variant?: "default" | "destructive" | "success" | "warning" | "info"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToastOptions
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToastOptions> & Pick<Toast, "id">
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: Toast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [
          ...state.toasts,
          {
            id: generateId(),
            ...action.toast,
            visible: true,
          },
        ].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id
            ? { ...t, ...action.toast }
            : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                visible: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

interface ToastContextToast extends Omit<ToastProps, "id"> {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  icon?: React.ReactNode
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast: (props: ToastOptions) => {
      const id = generateId()
      const duration = props.duration || 5000

      // Map type to variant for shadcn toast
      let variant: "default" | "destructive" = "default"
      if (props.type === "destructive") {
        variant = "destructive"
      }

      dispatch({
        type: "ADD_TOAST",
        toast: { ...props },
      })

      // Auto dismiss
      setTimeout(() => {
        dispatch({
          type: "DISMISS_TOAST",
          toastId: id,
        })
      }, duration)

      return id
    },
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    success: (props: Omit<ToastOptions, "type">) => {
      return dispatch({
        type: "ADD_TOAST",
        toast: { ...props, type: "success" },
      })
    },
    error: (props: Omit<ToastOptions, "type">) => {
      return dispatch({
        type: "ADD_TOAST",
        toast: { ...props, type: "destructive" },
      })
    },
    warning: (props: Omit<ToastOptions, "type">) => {
      return dispatch({
        type: "ADD_TOAST",
        toast: { ...props, type: "warning" },
      })
    },
    info: (props: Omit<ToastOptions, "type">) => {
      return dispatch({
        type: "ADD_TOAST",
        toast: { ...props, type: "info" },
      })
    },
  }
}

export { useToast }