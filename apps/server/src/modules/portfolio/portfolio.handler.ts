import { FastifyRequest, FastifyReply } from "fastify"
import prisma from "../../lib/prisma"
import { CreatePortfolioSchema, UpdatePortfolioSchema } from "@portfolio-tracker/shared"

export async function getPortfoliosHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
  reply.send(portfolios)
}

export async function getPortfolioHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { id } = req.params as { id: string }
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId },
    include: { holdings: { orderBy: { order: "asc" } } },
  })
  if (!portfolio) return reply.status(404).send({ message: "포트폴리오를 찾을 수 없습니다" })
  reply.send(portfolio)
}

export async function createPortfolioHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const body = CreatePortfolioSchema.parse(req.body)
  const portfolio = await prisma.portfolio.create({
    data: { ...body, userId },
  })
  reply.status(201).send(portfolio)
}

export async function updatePortfolioHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { id } = req.params as { id: string }
  const body = UpdatePortfolioSchema.parse(req.body)
  const exists = await prisma.portfolio.findFirst({ where: { id, userId } })
  if (!exists) return reply.status(404).send({ message: "포트폴리오를 찾을 수 없습니다" })
  const portfolio = await prisma.portfolio.update({
    where: { id },
    data: body,
  })
  reply.send(portfolio)
}

export async function deletePortfolioHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { id } = req.params as { id: string }
  const exists = await prisma.portfolio.findFirst({ where: { id, userId } })
  if (!exists) return reply.status(404).send({ message: "포트폴리오를 찾을 수 없습니다" })
  await prisma.portfolio.delete({ where: { id } })
  reply.send({ message: "포트폴리오가 삭제되었습니다" })
}
