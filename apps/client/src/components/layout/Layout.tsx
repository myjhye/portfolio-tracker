import { type ReactNode } from "react"
import Header from "./Header"
import Footer from "./Footer"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header />
      <main className="flex-grow pt-[104px] pb-xl px-gutter max-w-container-max mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
