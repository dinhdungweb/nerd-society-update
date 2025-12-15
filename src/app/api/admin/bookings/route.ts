import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

// GET /api/admin/bookings - Get all bookings
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                location: { select: { name: true } },
                combo: { select: { name: true, duration: true } },
                payment: { select: { status: true, method: true } },
            },
        })

        return NextResponse.json(bookings)
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
