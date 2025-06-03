import { Footer } from "@/components/nav/footer"
import { Navbar } from "@/components/nav/navbar"

type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center relative overflow-hidden">
        {/* Animated SVG Background */}
        <div
          className="absolute inset-0 opacity-10 dark:opacity-5"
          style={{
            backgroundImage:
              "url('/images/backgrounds/animated-background.svg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/10
            to-pink-50/20 dark:from-blue-900/10 dark:via-purple-900/5 dark:to-pink-900/10
            pointer-events-none"
        ></div>
        <div className="relative z-10">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
export default Layout
