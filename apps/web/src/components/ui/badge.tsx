import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        muted: "border-transparent bg-surface-elevated text-text-muted",
        neutral: "border-transparent bg-surface-high text-text-tertiary",
        accent: "border-transparent bg-accent-subtle text-accent-text",
        success: "border-transparent bg-success-subtle text-success-text",
        warning: "border-transparent bg-warning-subtle text-warning-text",
        danger: "border-transparent bg-danger-subtle text-danger-text",
        outline: "text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
