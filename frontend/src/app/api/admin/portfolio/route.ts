import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return null
  }
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const items = await prisma.portfolioItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, mediaType, embedUrl, fileUrl, fileKey, category, tags, coverImage, featured, published, sortOrder } = body

  if (!title || !mediaType || !category) {
    return NextResponse.json({ error: "title, mediaType and category are required" }, { status: 400 })
  }

  const item = await prisma.portfolioItem.create({
    data: {
      title,
      description,
      mediaType,
      embedUrl,
      fileUrl,
      fileKey,
      category,
      tags: tags ?? [],
      coverImage,
      featured: featured ?? false,
      published: published ?? false,
      sortOrder: sortOrder ?? 0,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
