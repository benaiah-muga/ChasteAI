import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-border bg-surface placeholder:text-text-muted focus-visible:ring-accent focus-visible:border-accent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-danger focus-visible:ring-danger focus-visible:border-danger",
          className,
        )}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
