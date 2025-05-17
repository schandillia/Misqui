import { Button } from "@/components/ui/button"
import Image from "next/image"

const footerButtons = [
  { src: "/images/icons/chess-icon.svg", alt: "Chess", label: "Chess" },
  { src: "/images/icons/sudoku-icon.svg", alt: "Sudoku", label: "Sudoku" },
  { src: "/images/icons/math-icon.svg", alt: "Math", label: "Math" },
]

export const Footer = () => {
  return (
    <footer className="hidden h-20 w-full border-t-2 border-neutral-200 p-2 lg:block dark:border-neutral-800">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly">
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
