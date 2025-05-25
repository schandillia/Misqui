import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-300 dark:focus-visible:ring-brand-500 aria-invalid:ring-danger-300/30 dark:aria-invalid:ring-danger-400/50 aria-invalid:border-danger-300 dark:aria-invalid:border-danger-400/50 uppercase tracking-normal relative overflow-hidden transform-gpu",
  {
    variants: {
      variant: {
        locked:
          "bg-neutral-200 text-primary-foreground border-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600",
        default:
          "rounded-3xl bg-gradient-to-b from-white to-gray-50 text-accent-foreground border-2 border-gray-300 hover:from-gray-50 hover:to-gray-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:from-neutral-700 dark:hover:to-neutral-800",
        primary:
          "bg-gradient-to-b from-brand-500 to-brand-700 text-white rounded-3xl hover:scale-102 hover:-translate-y-0.5 hover:from-brand-400 hover:to-brand-600 active:scale-98 active:translate-y-0 dark:from-brand-600 dark:to-brand-800 dark:hover:from-brand-500 dark:hover:to-brand-700",
        primaryOutline:
          "bg-gradient-to-b from-white to-brand-50 text-brand-600 border-2 border-brand-500 rounded-3xl hover:from-brand-50 hover:to-brand-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-brand-900/30 dark:text-brand-400 dark:border-brand-600 dark:hover:from-brand-900/30 dark:hover:to-brand-900/50",
        secondary:
          "bg-gradient-to-b from-brand-secondary-500 to-brand-secondary-700 text-white rounded-3xl hover:scale-102 hover:-translate-y-0.5 hover:from-brand-secondary-400 hover:to-brand-secondary-600 active:scale-98 active:translate-y-0 dark:from-brand-secondary-600 dark:to-brand-secondary-800 dark:hover:from-brand-secondary-500 dark:hover:to-brand-secondary-700",
        secondaryOutline:
          "bg-gradient-to-b from-white to-brand-secondary-50 text-brand-secondary-600 border-2 border-brand-secondary-500 rounded-3xl hover:from-brand-secondary-50 hover:to-brand-secondary-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-brand-secondary-900/30 dark:text-brand-secondary-400 dark:border-brand-secondary-600 dark:hover:from-brand-secondary-900/30 dark:hover:to-brand-secondary-900/50",
        danger:
          "bg-gradient-to-b from-brand-danger-500 to-brand-danger-700 text-white rounded-3xl hover:scale-102 hover:-translate-y-0.5 hover:from-brand-danger-400 hover:to-brand-danger-600 active:scale-98 active:translate-y-0 dark:from-brand-danger-600 dark:to-brand-danger-800 dark:hover:from-brand-danger-500 dark:hover:to-brand-danger-700",
        dangerOutline:
          "bg-gradient-to-b from-white to-brand-danger-50 text-brand-danger-600 border-2 border-brand-danger-500 rounded-3xl hover:from-brand-danger-50 hover:to-brand-danger-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-brand-danger-900/30 dark:text-brand-danger-400 dark:border-brand-danger-600 dark:hover:from-brand-danger-900/30 dark:hover:to-brand-danger-900/50",
        super:
          "bg-gradient-to-b from-brand-super-500 to-brand-super-700 text-white rounded-3xl hover:scale-102 hover:-translate-y-0.5 hover:from-brand-super-400 hover:to-brand-super-600 active:scale-98 active:translate-y-0 dark:from-brand-super-600 dark:to-brand-super-800 dark:hover:from-brand-super-500 dark:hover:to-brand-super-700",
        superOutline:
          "bg-gradient-to-b from-white to-brand-super-50 text-brand-super-600 border-2 border-brand-super-500 rounded-3xl hover:from-brand-super-50 hover:to-brand-super-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-brand-super-900/30 dark:text-brand-super-400 dark:border-brand-super-600 dark:hover:from-brand-super-900/30 dark:hover:to-brand-super-900/50",
        defaultOutline:
          "bg-gradient-to-b from-white to-gray-50 text-gray-600 border-2 border-gray-500 rounded-3xl hover:from-gray-50 hover:to-gray-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-gray-800/30 dark:text-gray-100 dark:border-gray-700 dark:hover:from-gray-800/30 dark:hover:to-gray-800/50",
        ghost:
          "bg-transparent text-gray-600 border-transparent rounded-3xl hover:bg-brand-100/50 dark:text-gray-300 dark:hover:bg-brand-900/40 hover:scale-102 active:scale-98 transition-all duration-200",
        sidebar:
          "bg-transparent text-gray-600 border-transparent rounded-3xl hover:bg-brand-100/50 dark:text-gray-300 dark:hover:bg-brand-900/40 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0",
        sidebarOutline:
          "bg-gradient-to-b from-brand-100 to-brand-200 text-brand-600 border-2 border-brand-300 rounded-3xl hover:from-brand-200 hover:to-brand-300 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-brand-900/50 dark:to-brand-900/70 dark:text-brand-300 dark:border-brand-700 dark:hover:from-brand-900/70 dark:hover:to-brand-900/90",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 px-6 has-[>svg]:px-4 text-base",
        icon: "size-10 rounded-full",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <span className="relative z-10 flex items-center gap-2 drop-shadow-xs">
            {children}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
