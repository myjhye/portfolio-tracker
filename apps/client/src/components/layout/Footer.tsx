export default function Footer() {
  return (
    <footer className="bg-surface w-full py-lg border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto text-center md:text-left gap-base">
        <div className="text-headline-md font-bold text-primary mb-base md:mb-0">
          PortfolioTracker © 2026
        </div>
        <div className="flex gap-lg text-caption text-on-surface-variant">
          <span className="hover:underline decoration-primary transition-all cursor-pointer">
            Built with Fastify
          </span>
          <span className="hover:underline decoration-primary transition-all cursor-pointer">
            React
          </span>
          <span className="hover:underline decoration-primary transition-all cursor-pointer">
            PostgreSQL
          </span>
        </div>
      </div>
    </footer>
  )
}
