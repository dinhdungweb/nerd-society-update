import PaymentButton from '@/components/booking/PaymentButton'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CalendarDaysIcon, ClockIcon, CreditCardIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CHECKED_IN: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    COMPLETED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabels: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    CHECKED_IN: 'Đang sử dụng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
}

const paymentMethodLabels: Record<string, string> = {
    CASH: 'Tiền mặt',
    VNPAY: 'VNPay',
    MOMO: 'MoMo',
    ZALOPAY: 'ZaloPay',
    BANK_TRANSFER: 'Chuyển khoản',
}

export default async function BookingDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const { id } = await params

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            location: true,
            combo: true,
            payment: true,
        },
    })

    if (!booking || booking.userId !== session.user.id) notFound()

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    Chi tiết đặt lịch #{booking.bookingCode}
                </h2>
                <Link
                    href="/profile"
                    className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                    ← Quay lại
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Status */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">TRẠNG THÁI</h3>
                        <div className="flex items-center justify-between">
                            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusColors[booking.status]}`}>
                                {statusLabels[booking.status]}
                            </span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}
                            </span>
                        </div>
                    </div>

                    {/* Location & Time */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">THÔNG TIN ĐẶT LỊCH</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPinIcon className="mt-0.5 size-5 flex-shrink-0 text-neutral-400" />
                                <div>
                                    <p className="font-medium text-neutral-900 dark:text-white">{booking.location.name}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{booking.location.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CalendarDaysIcon className="mt-0.5 size-5 flex-shrink-0 text-neutral-400" />
                                <div>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {new Date(booking.date).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {booking.startTime} - {booking.endTime}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ClockIcon className="mt-0.5 size-5 flex-shrink-0 text-neutral-400" />
                                <div>
                                    <p className="font-medium text-neutral-900 dark:text-white">{booking.combo.name}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Gói {booking.combo.duration} phút</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Payment */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">THANH TOÁN</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-600 dark:text-neutral-400">Tổng tiền</span>
                                <span className="font-bold text-neutral-900 dark:text-white">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400">Phương thức</span>
                                <span className="font-medium text-neutral-900 dark:text-white">
                                    {booking.payment ? paymentMethodLabels[booking.payment.method] : 'Chưa thanh toán'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400">Trạng thái</span>
                                <span className={`font-medium ${booking.payment?.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                    {booking.payment?.status === 'COMPLETED' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                </span>
                            </div>

                            {/* Show Payment Button if pending */}
                            {booking.payment?.status === 'PENDING' && (
                                <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                                    <PaymentButton bookingId={booking.id} amount={booking.totalAmount} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">KHÁCH HÀNG</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                <UserIcon className="size-5" />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">{session.user.name}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{session.user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
