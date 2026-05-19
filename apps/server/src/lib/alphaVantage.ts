/**
 * Alpha Vantage API 클라이언트
 *
 * 외부 주식 시세 API(GLOBAL_QUOTE)를 호출해 현재가·변동액·변동률을 가져옵니다.
 * API 키는 .env의 ALPHA_VANTAGE_API_KEY에서 읽습니다.
 */
import axios from "axios"

const BASE_URL = "https://www.alphavantage.co/query"
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY

/**
 * 종목 심볼로 실시간 시세 조회
 * @returns 정규화된 시세 객체 | null (종목 없음·응답 비정상)
 */
export async function fetchQuote(symbol: string): Promise<{ symbol: string; price: number; change: number; changePercent: number } | null> {
  const { data } = await axios.get(BASE_URL, {
    params: {
      function: "GLOBAL_QUOTE",
      symbol,
      apikey: API_KEY,
    },
  })

  // Alpha Vantage 응답 키는 "05. price" 형태의 번호 접두사 사용
  const quote = data["Global Quote"]
  if (!quote || !quote["05. price"]) return null

  return {
    symbol,
    price: parseFloat(quote["05. price"]),
    change: parseFloat(quote["09. change"]),
    changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
  }
}
