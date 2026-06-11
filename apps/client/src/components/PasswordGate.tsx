import { useState } from "react"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export function PasswordGate({ children }: Props) {
  const [passed, setPassed] = useState(() => {
    return sessionStorage.getItem("gate_passed") === "true"
  })
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const expected = import.meta.env.VITE_GATE_PASSWORD
    if (input === expected) {
      sessionStorage.setItem("gate_passed", "true")
      setPassed(true)
      setError(false)
    } else {
      setError(true)
      setInput("")
    }
  }

  if (passed) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm w-full max-w-sm space-y-md">
        <div>
          <h1 className="text-headline-md font-bold text-primary">PortfolioTracker</h1>
          <p className="text-caption text-on-surface-variant mt-base">
            접근 비밀번호를 입력하세요. 비밀번호는 포트폴리오 페이지에서 확인할 수 있습니다.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-sm">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            placeholder="Password"
            className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm text-body-md focus:outline-none focus:border-secondary transition-colors"
          />
          {error && (
            <p className="text-caption text-error">비밀번호가 틀렸습니다</p>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-on-primary px-md py-sm rounded-lg text-label-mono hover:opacity-90 transition-all active:scale-95"
          >
            입장
          </button>
        </form>
      </div>
    </div>
  )
}
