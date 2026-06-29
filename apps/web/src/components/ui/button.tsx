import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-text-inverse hover:bg-accent-strong",
        secondary: "bg-surface text-text-primary hover:bg-surface-hover border border-border",
        subtle: "bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary",
        danger: "bg-danger text-text-inverse hover:bg-danger-subtle hover:text-danger-text",
        outline: "border border-accent text-accent hover:bg-surface",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-2.5 text-[13px]",
        md: "h-9 px-3 text-sm",
        lg: "h-11 px-4 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    // If asChild is true, we can't show a loading spinner easily without breaking the child.
    // In a real radix setup, we might handle it differently.
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Slottable>{children}</Slottable>
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
