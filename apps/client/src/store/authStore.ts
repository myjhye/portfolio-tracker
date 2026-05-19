/**
 * 인증 상태 스토어 (Zustand + persist)
 *
 * 로그인한 사용자 정보를 localStorage에 저장해 새로고침 후에도 유지합니다.
 * ProtectedRoute와 api 인터셉터에서 이 스토어를 참조합니다.
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }), // 로그인/회원가입 성공 시 서버 응답으로 설정
      logout: () => set({ user: null }), // 로그아웃·401 시 초기화
    }),
    { name: "auth-storage" } // localStorage 키
  )
)
