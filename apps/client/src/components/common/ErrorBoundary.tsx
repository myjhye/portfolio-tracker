import { Component, type ReactNode } from "react"

// ── 에러 바운더리 ──
// 감싼 영역에서 에러가 나면 전체 화면 대신 해당 영역만 fallback UI로 교체
// 사용법: <ErrorBoundary fallback={<p>에러 메시지</p>}><컴포넌트 /></ErrorBoundary>

interface Props {
  children: ReactNode
  fallback?: ReactNode  // 에러 발생 시 보여줄 대체 UI. 없으면 기본 메시지 표시
}

interface State {
  hasError: boolean    // 에러 발생 여부
  error: Error | null  // 발생한 에러 객체
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  // 자식에서 에러 발생 시 React가 호출 → hasError를 true로 바꿔 fallback 표시
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  // 에러 내용을 콘솔에 기록 (어디서 왜 터졌는지 파악용)
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border border-dashed rounded-lg">
          이 영역을 불러오지 못했습니다
        </div>
      )
    }
    return this.props.children
  }
}