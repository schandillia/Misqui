import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive uppercase tracking-wide group relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-yellow-300 text-yellow-900 border-yellow-400 border-2 border-b-4 active:border-b-2 hover:bg-yellow-200 hover:scale-[1.02] shadow-md",
        primary:
          "bg-brand-400 text-white border-brand-500 border-2 border-b-4 active:border-b-2 hover:bg-brand-300 hover:scale-[1.02] shadow-md",
        primaryOutline:
          "bg-white text-brand-500 border-2 border-brand-200 hover:bg-brand-50 hover:scale-[1.02]",
        secondary:
          "bg-emerald-400 text-white border-emerald-500 border-2 border-b-4 active:border-b-2 hover:bg-emerald-300 hover:scale-[1.02] shadow-md",
        secondaryOutline:
          "bg-white text-emerald-500 border-2 border-emerald-200 hover:bg-emerald-50 hover:scale-[1.02]",
        danger:
          "bg-rose-400 text-white border-rose-500 border-2 border-b-4 active:border-b-2 hover:bg-rose-300 hover:scale-[1.02] shadow-md",
        dangerOutline:
          "bg-white text-rose-500 border-2 border-rose-200 hover:bg-rose-50 hover:scale-[1.02]",
        super:
          "bg-orange-400 text-white border-orange-500 border-2 border-b-4 active:border-b-2 hover:bg-orange-300 hover:scale-[1.02] shadow-md",
        superOutline:
          "bg-white text-orange-500 border-2 border-orange-200 hover:bg-orange-50 hover:scale-[1.02]",
        defaultOutline:
          "bg-transparent text-gray-600 border-gray-300 border-2 hover:bg-gray-100 hover:scale-[1.02]",
        sidebar:
          "bg-transparent text-gray-500 border-transparent hover:bg-gray-100 transition-none",
        sidebarOutline:
          "bg-cyan-100 text-cyan-600 border-cyan-300 hover:bg-cyan-200 transition-none",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 px-6 has-[>svg]:px-4 text-base",
        icon: "size-10",
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
