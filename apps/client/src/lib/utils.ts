import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS 클래스 병합 유틸리티
 *
 * clsx로 조건부 클래스를 처리하고, twMerge로 중복/충돌 클래스를 정리합니다.
 * 예: cn("px-4", isLarge && "px-8") → isLarge가 true면 "px-8"만 적용
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}