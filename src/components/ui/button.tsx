import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-300 aria-invalid:ring-red-300/30 dark:aria-invalid:ring-red-400/50 aria-invalid:border-red-300 uppercase tracking-normal group relative overflow-hidden",
  {
    variants: {
      variant: {
        locked:
          "bg-neutral-200 text-primary-foreground hover:bg-neutral-200/90 border-neutral-400",
        default:
          "rounded-3xl bg-white text-accent-foreground border border-input hover:bg-accent hover:scale-105 active:scale-95",
        primary:
          "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl hover:scale-105 hover:from-purple-500 hover:to-indigo-500 active:scale-95",
        primaryOutline:
          "bg-white text-purple-600 border-2 border-purple-300 rounded-3xl hover:bg-purple-50 hover:scale-105 active:scale-95",
        secondary:
          "bg-gradient-to-r from-teal-500 to-emerald-400 text-white rounded-3xl hover:scale-105 hover:from-teal-400 hover:to-emerald-300 active:scale-95",
        secondaryOutline:
          "bg-white text-teal-600 border-2 border-emerald-300 rounded-3xl hover:bg-emerald-50 hover:scale-105 active:scale-95",
        danger:
          "bg-gradient-to-r from-red-500 to-red-600 text-white rounded-3xl hover:scale-105 hover:from-red-400 hover:to-red-500 active:scale-95",
        dangerOutline:
          "bg-white text-red-600 border-2 border-red-300 rounded-3xl hover:bg-red-50 hover:scale-105 active:scale-95",
        super:
          "bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-3xl hover:scale-105 hover:from-yellow-300 hover:to-orange-300 active:scale-95",
        superOutline:
          "bg-white text-yellow-600 border-2 border-yellow-300 rounded-3xl hover:bg-yellow-50 hover:scale-105 active:scale-95",
        defaultOutline:
          "bg-transparent text-gray-600 border-2 border-gray-300 rounded-3xl hover:bg-gray-50 hover:scale-105 active:scale-95",
        ghost:
          "bg-transparent text-gray-600 border-transparent rounded-3xl hover:bg-purple-100/50",
        sidebar:
          "bg-transparent text-gray-600 border-transparent rounded-3xl hover:bg-purple-100/50",
        sidebarOutline:
          "bg-purple-100 text-purple-600 border-2 border-purple-200 rounded-3xl hover:bg-purple-200 hover:scale-105 active:scale-95",
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

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="custom-ease absolute -left-[75px] -top-[50px] -z-10 h-[155px] w-8 rotate-[135deg] bg-white opacity-20 transition-all duration-500 group-hover:left-[120%]" />
    </>
  )

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {asChild ? children : content}
    </Comp>
  )
}

export { Button, buttonVariants }
