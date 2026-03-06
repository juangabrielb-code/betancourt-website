import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL environment variable is required. Run: ADMIN_EMAIL=your@email.com npx prisma db seed")
  }

  const user = await prisma.user.update({
    where: { email: adminEmail },
    data: { role: "ADMIN" },
  })

  console.log(`✓ ADMIN role set for: ${user.email}`)

  // Seed default services if none exist
  const existingServices = await prisma.serviceItem.count()
  if (existingServices === 0) {
    await prisma.serviceItem.createMany({
      data: [
        {
          nameEn: 'Stem Mixing',
          nameEs: 'Mezcla por Stems',
          descriptionEn: 'Professional mixing service for up to 20 stems. Analog warmth meets digital precision.',
          descriptionEs: 'Servicio profesional de mezcla hasta 20 stems. Calidez analógica con precisión digital.',
          priceUsd: 150,
          priceCop: 600000,
          type: 'MIXING',
          featuresEn: ['Analog Summing', 'Vocal Tuning', '3 Revisions', 'High-Res Delivery'],
          featuresEs: ['Sumador Analógico', 'Afinación Vocal', '3 Revisiones', 'Entrega en Alta Resolución'],
          isPopular: true,
          sortOrder: 0,
        },
        {
          nameEn: 'Stereo Mastering',
          nameEs: 'Masterización Estéreo',
          descriptionEn: 'The final polish your track needs to compete on streaming platforms.',
          descriptionEs: 'El pulido final que tu track necesita para competir en plataformas de streaming.',
          priceUsd: 60,
          priceCop: 240000,
          type: 'MASTERING',
          featuresEn: ['Loudness Optimization', 'EQ & Compression', 'Metadata Tagging', 'Apple Digital Master'],
          featuresEs: ['Optimización de Loudness', 'EQ y Compresión', 'Metadatos', 'Apple Digital Master'],
          imageUrl: 'https://picsum.photos/400/300',
          sortOrder: 1,
        },
        {
          nameEn: 'Full Production',
          nameEs: 'Producción Completa',
          descriptionEn: 'From a simple demo to a radio-ready hit. Full instrumental production.',
          descriptionEs: 'De un simple demo a un éxito radial. Producción instrumental completa.',
          priceUsd: 500,
          priceCop: 2000000,
          type: 'PRODUCTION',
          featuresEn: ['Custom Composition', 'Session Musicians', 'Arrangement', 'Mixing Included'],
          featuresEs: ['Composición Personalizada', 'Músicos de Sesión', 'Arreglos', 'Mezcla Incluida'],
          sortOrder: 2,
        },
        {
          nameEn: 'Career Consultation',
          nameEs: 'Consultoría de Carrera',
          descriptionEn: '1-on-1 strategy session to plan your next release or career move.',
          descriptionEs: 'Sesión estratégica 1 a 1 para planear tu próximo lanzamiento o paso profesional.',
          priceUsd: 100,
          priceCop: 400000,
          type: 'CONSULTATION',
          featuresEn: ['1 Hour Video Call', 'Release Strategy', 'Playlist Pitching Guide'],
          featuresEs: ['Videollamada de 1 Hora', 'Estrategia de Lanzamiento', 'Guía de Pitching'],
          sortOrder: 3,
        },
      ],
    })
    console.log('✓ Default services seeded')
  } else {
    console.log(`✓ Services already exist (${existingServices}), skipping seed`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
