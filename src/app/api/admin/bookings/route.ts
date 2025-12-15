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
                room: { select: { name: true, type: true } },
                payment: { select: { status: true, method: true } },
            },
        })

        // Transform bookings for backward compatibility with frontend
        const transformedBookings = bookings.map(b => ({
            ...b,
            // Map room to combo-like structure for existing frontend
            combo: b.room ? { name: b.room.name, duration: 60 } : null,
            // Use customerName or user.name for display
            user: {
                name: b.customerName || b.user?.name || 'N/A',
                email: b.customerEmail || b.user?.email || '',
                phone: b.customerPhone || b.user?.phone || '',
            },
            // Map estimatedAmount to totalAmount for backward compat
            totalAmount: b.estimatedAmount,
        }))

        return NextResponse.json(transformedBookings)
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
