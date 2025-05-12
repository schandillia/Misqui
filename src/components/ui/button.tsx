import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // REMOVED 'group' from here, it's only needed if shine is intrinsic.
  // 'custom-ease' was also removed as it's not standard and the shine has its own transition.
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-300 dark:focus-visible:ring-brand-500 aria-invalid:ring-red-300/30 dark:aria-invalid:ring-red-400/50 aria-invalid:border-red-300 dark:aria-invalid:border-red-400/50 uppercase tracking-normal relative overflow-hidden",
  {
    variants: {
      variant: {
        locked:
          "bg-neutral-200 text-primary-foreground hover:bg-neutral-200/90 border-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700/90 dark:border-neutral-600",
        default:
          "rounded-3xl bg-white text-accent-foreground border border-input hover:bg-accent hover:scale-105 active:scale-95 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-700",
        primary:
          "bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-3xl hover:scale-105 hover:from-brand-500 hover:to-indigo-500 active:scale-95 dark:hover:from-brand-700 dark:hover:to-indigo-700",
        primaryOutline:
          "bg-white text-brand-600 border-2 border-brand-300 rounded-3xl hover:bg-brand-50 hover:scale-105 active:scale-95 dark:bg-transparent dark:text-brand-400 dark:border-brand-500 dark:hover:bg-brand-900/50",
        secondary:
          "bg-gradient-to-r from-teal-500 to-emerald-400 text-white rounded-3xl hover:scale-105 hover:from-teal-400 hover:to-emerald-300 active:scale-95 dark:from-teal-700 dark:to-emerald-600 dark:hover:from-teal-600 dark:hover:to-emerald-500",
        secondaryOutline:
          "bg-white text-teal-600 border-2 border-emerald-300 rounded-3xl hover:bg-emerald-50 hover:scale-105 active:scale-95 dark:bg-transparent dark:text-teal-400 dark:border-emerald-500 dark:hover:bg-emerald-900/50",
        danger:
          "bg-gradient-to-r from-red-500 to-red-600 text-white rounded-3xl hover:scale-105 hover:from-red-400 hover:to-red-500 active:scale-95 dark:hover:from-red-600 dark:hover:to-red-700",
        dangerOutline:
          "bg-white text-red-600 border-2 border-red-300 rounded-3xl hover:bg-red-50 hover:scale-105 active:scale-95 dark:bg-transparent dark:text-red-400 dark:border-red-500 dark:hover:bg-red-900/50",
        super:
          "bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-3xl hover:scale-105 hover:from-yellow-300 hover:to-orange-300 active:scale-95 dark:hover:from-yellow-500 dark:hover:to-orange-500",
        superOutline:
          "bg-white text-yellow-600 border-2 border-yellow-300 rounded-3xl hover:bg-yellow-50 hover:scale-105 active:scale-95 dark:bg-transparent dark:text-yellow-400 dark:border-yellow-500 dark:hover:bg-yellow-900/50",
        defaultOutline:
          "bg-transparent text-gray-600 border-2 border-gray-300 rounded-3xl hover:bg-gray-50 hover:scale-105 active:scale-95 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
        ghost:
          "bg-transparent text-gray-600 border-transparent rounded-3xl hover:bg-brand-100/50 dark:text-gray-300 dark:hover:bg-brand-900/40",
        sidebar:
          "bg-transparent text-gray-600 border-transparent rounded-3xl hover:bg-brand-100/50 dark:text-gray-300 dark:hover:bg-brand-900/40",
        sidebarOutline:
          "bg-brand-100 text-brand-600 border-2 border-brand-200 rounded-3xl hover:bg-brand-200 hover:scale-105 active:scale-95 dark:bg-brand-900/50 dark:text-brand-300 dark:border-brand-800 dark:hover:bg-brand-900/70",
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

    // REMOVED the content wrapper and the shine div.
    // The span wrapper is now conditionally applied if not asChild,
    // to ensure content is above the ::after pseudo-element (shine)
    // and to maintain the `gap-2` for icons.

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
          <span className="relative z-[1] flex items-center gap-2">
            {" "}
            {/* z-index ensures content is above pseudo-element */}
            {children}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
