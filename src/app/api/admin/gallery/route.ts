import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/gallery - Get gallery images
export async function GET() {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: 'galleryImages' },
        })

        if (setting) {
            return NextResponse.json({ images: JSON.parse(setting.value) })
        }

        return NextResponse.json({ images: [] })
    } catch (error) {
        console.error('Error fetching gallery:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST /api/admin/gallery - Save gallery images
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { images } = body

        // Upsert gallery setting
        await prisma.setting.upsert({
            where: { key: 'galleryImages' },
            update: { value: JSON.stringify(images) },
            create: { key: 'galleryImages', value: JSON.stringify(images) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving gallery:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
