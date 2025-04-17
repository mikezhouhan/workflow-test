import { createContext, useContext } from "react"

type ToastVariant = "neutral" | "success" | "error"

interface ToastState {
  open: boolean;
  title: string;
  description: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (title: string, description: string, variant: ToastVariant) => void;
  toast?: ToastState;
  setToast?: React.Dispatch<React.SetStateAction<ToastState>>;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
