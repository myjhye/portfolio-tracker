import { type ReactNode } from "react"
import Header from "./Header"
import Footer from "./Footer"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
