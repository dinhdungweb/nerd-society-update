import BookingWizard from '@/components/booking/BookingWizard'
import { prisma } from '@/lib/prisma'

export const metadata = {
    title: 'Đặt lịch - Nerd Society',
    description: 'Đặt lịch sử dụng không gian làm việc chung tại Nerd Society',
}

async function getBookingData() {
    const [locations, combos] = await Promise.all([
        prisma.location.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                address: true,
                image: true,
            },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.combo.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                duration: true,
                price: true,
                description: true,
                features: true,
                isPopular: true,
            },
            orderBy: { sortOrder: 'asc' },
        }),
    ])

    return { locations, combos }
}

export default async function BookingPage() {
    const { locations, combos } = await getBookingData()

    return (
        <div className="bg-neutral-50 min-h-screen py-16 dark:bg-neutral-950">
            <div className="container">
                <div className="mx-auto max-w-2xl text-center mb-12">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                        Đặt lịch ngay
                    </h1>
                    <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400">
                        Chỉ vài bước đơn giản để sở hữu không gian làm việc lý tưởng
                    </p>
                </div>

                <BookingWizard locations={locations} combos={combos} />
            </div>
        </div>
    )
}
