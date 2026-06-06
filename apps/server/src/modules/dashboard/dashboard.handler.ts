import { FastifyRequest, FastifyReply } from "fastify"
import prisma from "../../lib/prisma"

export async function getDashboardHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }

  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    include: {
      holdings: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const summary = portfolios.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    holdingCount: p.holdings.length,
    symbols: p.holdings.map((h) => h.symbol),
    totalCost: p.holdings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0),
  }))

  reply.send({
    portfolioCount: portfolios.length,
    totalHoldingCount: portfolios.reduce((sum, p) => sum + p.holdings.length, 0),
    portfolios: summary,
  })
}
