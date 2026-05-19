/**
 * API 클라이언트 (axios)
 *
 * 서버와 쿠키 기반 인증(JWT token 쿠키)을 사용합니다.
 * 401 응답 시 자동 로그아웃 후 로그인 페이지로 이동합니다.
 */
import axios from "axios"
import { useAuthStore } from "../store/authStore"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  withCredentials: true, // 쿠키 전송 (로그인 세션)
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // 세션 만료·미인증 → 스토어 초기화 후 로그인으로
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api
