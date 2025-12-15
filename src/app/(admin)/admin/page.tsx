import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import {
    BanknotesIcon,
    CalendarDaysIcon,
    ClockIcon,
    UsersIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    NewspaperIcon,
    PhotoIcon,
    PlusIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline'

async function getStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
        totalBookings,
        todayBookings,
        pendingBookings,
        totalCustomers,
    ] = await Promise.all([
        prisma.booking.count(),
        prisma.booking.count({
            where: {
                createdAt: { gte: today },
            },
        }),
        prisma.booking.count({
            where: { status: 'PENDING' },
        }),
        prisma.user.count({
            where: { role: 'CUSTOMER' },
        }),
    ])

    // Calculate revenue (simplified)
    const payments = await prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
    })

    return {
        totalBookings,
        todayBookings,
        pendingBookings,
        totalCustomers,
        totalRevenue: payments._sum.amount || 0,
    }
}

async function getRecentBookings() {
    return prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            location: { select: { name: true } },
            combo: { select: { name: true } },
        },
    })
}

const statusLabels: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    CHECKED_IN: 'Đã check-in',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
}

const statusStyles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    CHECKED_IN: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    COMPLETED: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
}

const quickActions = [
    { name: 'Thêm bài viết', href: '/admin/posts/new', icon: NewspaperIcon, color: 'bg-blue-500' },
    { name: 'Upload Media', href: '/admin/media', icon: PhotoIcon, color: 'bg-purple-500' },
    { name: 'Quản lý Booking', href: '/admin/bookings', icon: CalendarDaysIcon, color: 'bg-emerald-500' },
    { name: 'Khách hàng', href: '/admin/customers', icon: UsersIcon, color: 'bg-orange-500' },
]

export default async function AdminDashboard() {
    const stats = await getStats()
    const recentBookings = await getRecentBookings()

    const statCards = [
        {
            name: 'Tổng doanh thu',
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue),
            change: '+12.5%',
            trend: 'up',
            icon: BanknotesIcon,
            gradient: 'from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            name: 'Booking hôm nay',
            value: stats.todayBookings.toString(),
            change: '+2',
            trend: 'up',
            icon: CalendarDaysIcon,
            gradient: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            name: 'Chờ xác nhận',
            value: stats.pendingBookings.toString(),
            change: '-1',
            trend: 'down',
            icon: ClockIcon,
            gradient: 'from-amber-500 to-orange-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            name: 'Tổng khách hàng',
            value: stats.totalCustomers.toString(),
            change: '+5',
            trend: 'up',
            icon: UsersIcon,
            gradient: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Xin chào! 👋
                    </h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        {format(new Date(), "EEEE, 'ngày' d MMMM yyyy", { locale: vi })}
                    </p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-xl"
                >
                    <PlusIcon className="size-4" />
                    Thêm bài viết
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.name}
                        className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-neutral-200/50 transition-all hover:shadow-lg hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                                <stat.icon className={`size-6 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} style={{ stroke: 'url(#gradient)' }} />
                                <stat.icon className={`size-6 text-${stat.gradient.includes('emerald') ? 'emerald' : stat.gradient.includes('blue') ? 'blue' : stat.gradient.includes('amber') ? 'amber' : 'purple'}-600 dark:text-${stat.gradient.includes('emerald') ? 'emerald' : stat.gradient.includes('blue') ? 'blue' : stat.gradient.includes('amber') ? 'amber' : 'purple'}-400`} />
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${stat.trend === 'up'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                {stat.trend === 'up' ? (
                                    <ArrowTrendingUpIcon className="size-3" />
                                ) : (
                                    <ArrowTrendingDownIcon className="size-3" />
                                )}
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{stat.name}</p>
                        </div>
                        {/* Decorative gradient */}
                        <div className={`absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`} />
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200/50 dark:bg-neutral-900 dark:border-neutral-800">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            className="group flex flex-col items-center gap-3 rounded-xl border border-neutral-200 p-4 transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                        >
                            <div className={`flex size-12 items-center justify-center rounded-xl ${action.color} text-white shadow-lg`}>
                                <action.icon className="size-6" />
                            </div>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                                {action.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="rounded-2xl bg-white shadow-sm border border-neutral-200/50 dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Booking gần đây</h2>
                    <Link
                        href="/admin/bookings"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                        Xem tất cả
                        <ArrowRightIcon className="size-4" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                <th className="px-6 py-4">Mã booking</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Dịch vụ</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {recentBookings.length > 0 ? (
                                recentBookings.map((booking) => (
                                    <tr key={booking.id} className="text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <Link
                                                href={`/admin/bookings/${booking.id}`}
                                                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                            >
                                                {booking.bookingCode}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white">
                                                    {booking.user.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">{booking.user.name}</p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{booking.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white">{booking.combo.name}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{booking.location.name}</p>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[booking.status]}`}>
                                                <span className={`size-1.5 rounded-full ${booking.status === 'PENDING' ? 'bg-amber-500' :
                                                        booking.status === 'CONFIRMED' ? 'bg-blue-500' :
                                                            booking.status === 'CHECKED_IN' ? 'bg-emerald-500' :
                                                                booking.status === 'COMPLETED' ? 'bg-neutral-500' :
                                                                    'bg-red-500'
                                                    }`} />
                                                {statusLabels[booking.status]}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-neutral-900 dark:text-white">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <CalendarDaysIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                                        <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">Chưa có booking nào</p>
                                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Các booking sẽ xuất hiện ở đây</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
