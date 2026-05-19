/**
 * 테마(다크모드) 스토어 (Zustand + persist)
 *
 * isDark 변경 시 App.tsx에서 html.dark 클래스를 토글합니다.
 * Tailwind darkMode: "class" 설정과 함께 동작합니다.
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ThemeStore {
  isDark: boolean
  toggle: () => void
  setDark: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      // 최초 로드 시 OS 다크모드 설정을 기본값으로 사용
      isDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
      toggle: () => set((s) => ({ isDark: !s.isDark })),
      setDark: (isDark) => set({ isDark }),
    }),
    { name: "theme-storage" }
  )
)
