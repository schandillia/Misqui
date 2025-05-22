import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-300 dark:focus-visible:ring-brand-500 aria-invalid:ring-red-300/30 dark:aria-invalid:ring-red-400/50 aria-invalid:border-red-300 dark:aria-invalid:border-red-400/50 uppercase tracking-normal relative overflow-hidden transform-gpu",
  {
    variants: {
      variant: {
        locked:
          "bg-neutral-200 text-primary-foreground border-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600 shadow-md shadow-neutral-300/30 dark:shadow-neutral-800/50",
        default:
          "rounded-3xl bg-gradient-to-b from-white to-gray-50 text-accent-foreground border-2 border-gray-200 hover:from-gray-50 hover:to-gray-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-100 dark:border-neutral-600 dark:hover:from-neutral-700 dark:hover:to-neutral-800 shadow-md shadow-gray-300/40 hover:shadow-sm hover:shadow-gray-400/50 dark:shadow-neutral-900/60 dark:hover:shadow-neutral-900/80",
        primary:
          "bg-gradient-to-b from-brand-500 to-brand-700 text-white rounded-3xl hover:scale-102 hover:-translate-y-0.5 hover:from-brand-400 hover:to-brand-600 active:scale-98 active:translate-y-0 dark:from-brand-600 dark:to-brand-800 dark:hover:from-brand-500 dark:hover:to-brand-700 shadow-md shadow-brand-500/40 hover:shadow-sm hover:shadow-brand-500/60 border-2 border-brand-400",
        primaryOutline:
          "bg-gradient-to-b from-white to-brand-50 text-brand-600 border-2 border-brand-400 rounded-3xl hover:from-brand-50 hover:to-brand-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-brand-900/30 dark:text-brand-400 dark:border-brand-500 dark:hover:from-brand-900/30 dark:hover:to-brand-900/50 shadow-md shadow-brand-300/40 hover:shadow-sm hover:shadow-brand-400/50",
        secondary:
          "bg-gradient-to-b from-teal-400 to-teal-600 text-white rounded-3xl hover:scale-102 hover:-translate-y-0.5 hover:from-teal-300 hover:to-teal-500 active:scale-98 active:translate-y-0 dark:from-teal-600 dark:to-teal-800 dark:hover:from-teal-500 dark:hover:to-teal-700 shadow-md shadow-teal-400/40 hover:shadow-sm hover:shadow-teal-500/60 border-2 border-teal-300",
        secondaryOutline:
          "bg-gradient-to-b from-white to-teal-50 text-teal-600 border-2 border-teal-400 rounded-3xl hover:from-teal-50 hover:to-teal-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-teal-900/30 dark:text-teal-400 dark:border-teal-500 dark:hover:from-teal-900/30 dark:hover:to-teal-900/50 shadow-md shadow-teal-300/40 hover:shadow-sm hover:shadow-teal-400/50",
        danger:
          "bg-gradient-to-b from-red-400 to-red-600 text-white rounded-3xl hover:scale-102 hover:-translate-y-0.5 hover:from-red-300 hover:to-red-500 active:scale-98 active:translate-y-0 dark:from-red-500 dark:to-red-700 dark:hover:from-red-400 dark:hover:to-red-600 shadow-md shadow-red-400/40 hover:shadow-sm hover:shadow-red-500/60 border-2 border-red-300",
        dangerOutline:
          "bg-gradient-to-b from-white to-red-50 text-red-600 border-2 border-red-400 rounded-3xl hover:from-red-50 hover:to-red-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-red-900/30 dark:text-red-400 dark:border-red-500 dark:hover:from-red-900/30 dark:hover:to-red-900/50 shadow-md shadow-red-300/40 hover:shadow-sm hover:shadow-red-400/50",
        super:
          "bg-gradient-to-b from-yellow-300 to-orange-500 text-white rounded-3xl hover:scale-102 hover:-translate-y-0.5 hover:from-yellow-200 hover:to-orange-400 active:scale-98 active:translate-y-0 dark:from-yellow-400 dark:to-orange-600 dark:hover:from-yellow-300 dark:hover:to-orange-500 shadow-md shadow-orange-400/50 hover:shadow-sm hover:shadow-orange-500/70 border-2 border-yellow-200",
        superOutline:
          "bg-gradient-to-b from-white to-orange-50 text-orange-600 border-2 border-orange-400 rounded-3xl hover:from-orange-50 hover:to-orange-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-orange-900/30 dark:text-orange-400 dark:border-orange-500 dark:hover:from-orange-900/30 dark:hover:to-orange-900/50 shadow-md shadow-orange-300/40 hover:shadow-sm hover:shadow-orange-400/50",
        defaultOutline:
          "bg-gradient-to-b from-white to-gray-50 text-gray-600 border-2 border-gray-400 rounded-3xl hover:from-gray-50 hover:to-gray-100 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-transparent dark:to-gray-800/30 dark:text-gray-100 dark:border-gray-600 dark:hover:from-gray-800/30 dark:hover:to-gray-800/50 shadow-md shadow-gray-300/40 hover:shadow-sm hover:shadow-gray-400/50",
        ghost:
          "bg-transparent text-gray-600 border-transparent rounded-3xl hover:bg-brand-100/50 dark:text-gray-300 dark:hover:bg-brand-900/40 hover:scale-102 active:scale-98 transition-all duration-200",
        sidebar:
          "bg-transparent text-gray-600 border-transparent rounded-3xl hover:bg-brand-100/50 dark:text-gray-300 dark:hover:bg-brand-900/40 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 shadow-sm shadow-transparent hover:shadow-md hover:shadow-brand-200/30",
        sidebarOutline:
          "bg-gradient-to-b from-brand-100 to-brand-200 text-brand-600 border-2 border-brand-300 rounded-3xl hover:from-brand-200 hover:to-brand-300 hover:scale-102 hover:-translate-y-0.5 active:scale-98 active:translate-y-0 dark:from-brand-900/50 dark:to-brand-900/70 dark:text-brand-300 dark:border-brand-700 dark:hover:from-brand-900/70 dark:hover:to-brand-900/90 shadow-md shadow-brand-200/40 hover:shadow-sm hover:shadow-brand-300/50",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 px-6 has-[>svg]:px-4 text-base",
        icon: "size-10 rounded-full shadow-md hover:shadow-sm",
        rounded: "rounded-full shadow-md hover:shadow-sm",
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
