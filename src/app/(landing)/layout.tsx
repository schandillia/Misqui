import { Footer } from "@/components/nav/footer"
import { Navbar } from "@/components/nav/navbar"

type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  )
}
export default Layout
