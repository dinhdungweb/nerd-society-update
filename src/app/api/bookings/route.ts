import { authOptions } from '@/lib/auth'
import { sendBookingEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { locationId, comboId, date, startTime } = body

        if (!locationId || !comboId || !date || !startTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Fetch combo details to calculate price and end time
        const combo = await prisma.combo.findUnique({
            where: { id: comboId },
        })

        if (!combo) {
            return NextResponse.json({ error: 'Invalid combo' }, { status: 400 })
        }

        // Calculate end time
        const startHour = parseInt(startTime.split(':')[0])
        const startMinute = parseInt(startTime.split(':')[1])
        const startDate = new Date(date)
        startDate.setHours(startHour, startMinute, 0, 0)

        const endDate = new Date(startDate.getTime() + combo.duration * 60000)
        const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

        // Generate booking code
        const dateStr = startDate.toISOString().split('T')[0].replace(/-/g, '')
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        const bookingCode = `NERD-${dateStr}-${randomSuffix}`

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                bookingCode,
                userId: session.user.id,
                locationId,
                comboId,
                date: startDate,
                startTime,
                endTime,
                totalAmount: combo.price,
                status: 'PENDING',
                payment: {
                    create: {
                        amount: combo.price,
                        method: 'VNPAY', // Default to VNPAY, user can change in success page
                        status: 'PENDING',
                    },
                },
            },
            include: {
                user: true,
                location: true,
                combo: true,
            },
        })

        // Send email (async)
        sendBookingEmail(booking).catch(console.error)

        return NextResponse.json(booking)
    } catch (error) {
        console.error('Booking error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
