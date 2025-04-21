import { Button } from "@/components/ui/button"
import Image from "next/image"

const footerButtons = [
  { src: "/chess-icon.svg", alt: "Chess", label: "Chess" },
  { src: "/sudoku-icon.svg", alt: "Sudoku", label: "Sudoku" },
  { src: "/math-icon.svg", alt: "Math", label: "Math" },
]

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
      <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
        {footerButtons.map(({ src, alt, label }) => (
          <Button key={label} size="lg" variant="sidebar">
            <Image
              src={src}
              alt={alt}
              width={40}
              height={40}
              className="mr-2"
            />
            {label}
          </Button>
        ))}
      </div>
    </footer>
  )
}
