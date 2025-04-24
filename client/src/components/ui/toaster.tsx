import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { 
  InfoIcon, 
  AlertCircle, 
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, type, icon, variant: providedVariant, ...props }) {
        // Map type to variant for shadcn toast
        let variant = providedVariant || "default"
        
        if (type === "destructive") {
          variant = "destructive" 
        } else if (type === "success") {
          variant = "success"
        } else if (type === "warning") {
          variant = "warning"
        } else if (type === "info") {
          variant = "info"
        }

        // Default icons based on type
        const getIcon = () => {
          if (icon) return icon
          
          if (type === "success") {
            return <CheckCircle2 className="h-5 w-5" />
          } else if (type === "warning") {
            return <AlertTriangle className="h-5 w-5" />
          } else if (type === "destructive") {
            return <XCircle className="h-5 w-5" />
          } else if (type === "info") {
            return <InfoIcon className="h-5 w-5" />
          }
          
          return null
        }

        const toastIcon = getIcon()

        return (
          <Toast key={id} variant={variant as any} {...props}>
            <div className="flex items-start gap-3">
              {toastIcon && (
                <div className="shrink-0 mt-0.5">
                  {toastIcon}
                </div>
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
