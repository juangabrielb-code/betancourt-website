import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const featured = searchParams.get("featured")
  const limit = parseInt(searchParams.get("limit") ?? "50")

  const items = await prisma.portfolioItem.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(featured === "true" ? { featured: true } : {}),
    },
    select: {
      id: true,
      title: true,
      description: true,
      mediaType: true,
      embedUrl: true,
      fileUrl: true,
      category: true,
      tags: true,
      coverImage: true,
      featured: true,
      sortOrder: true,
      createdAt: true,
    },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  })

  return NextResponse.json(items)
}
