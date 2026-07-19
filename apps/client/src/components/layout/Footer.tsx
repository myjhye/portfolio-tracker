export default function Footer() {
  return (
    <footer className="bg-surface w-full py-lg border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto text-center md:text-left gap-base">
        <div className="text-headline-md font-bold text-primary mb-base md:mb-0">
          PortfolioTracker © 2026
        </div>
        <div className="flex gap-lg text-caption text-on-surface-variant">
          <span className="hover:underline decoration-primary transition-all cursor-pointer">
            Fastify 백엔드
          </span>
          <span className="hover:underline decoration-primary transition-all cursor-pointer">
            React 프론트엔드
          </span>
          <span className="hover:underline decoration-primary transition-all cursor-pointer">
            PostgreSQL 데이터베이스
          </span>
        </div>
      </div>
    </footer>
  )
}
