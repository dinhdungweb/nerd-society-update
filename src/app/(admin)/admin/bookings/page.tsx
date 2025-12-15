'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline'

interface Booking {
    id: string
    bookingCode: string
    date: string
    startTime: string
    endTime: string
    totalAmount: number
    status: string
    user: { name: string | null; email: string; phone: string | null }
    location: { name: string }
    combo: { name: string; duration: number }
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    CHECKED_IN: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    COMPLETED: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    NO_SHOW: 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700',
}

const statusLabels: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    CHECKED_IN: 'Đã check-in',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
}

const statusDots: Record<string, string> = {
    PENDING: 'bg-amber-500',
    CONFIRMED: 'bg-blue-500',
    CHECKED_IN: 'bg-emerald-500',
    COMPLETED: 'bg-neutral-500',
    CANCELLED: 'bg-red-500',
    NO_SHOW: 'bg-neutral-400',
}

const ITEMS_PER_PAGE = 10

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/admin/bookings')
            if (res.ok) {
                const data = await res.json()
                setBookings(data)
                setFilteredBookings(data)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = useCallback(() => {
        let result = [...bookings]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(b =>
                b.bookingCode.toLowerCase().includes(query) ||
                b.user.name?.toLowerCase().includes(query) ||
                b.user.email.toLowerCase().includes(query) ||
                b.user.phone?.includes(query)
            )
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            result = result.filter(b => b.status === statusFilter)
        }

        setFilteredBookings(result)
        setCurrentPage(1)
    }, [bookings, searchQuery, statusFilter])

    useEffect(() => {
        applyFilters()
    }, [applyFilters])

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Stats
    const stats = {
        pending: bookings.filter(b => b.status === 'PENDING').length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        checkedIn: bookings.filter(b => b.status === 'CHECKED_IN').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="grid gap-4 sm:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-neutral-200 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-96 bg-neutral-200 rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý Booking</h1>
                <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                    Xem và quản lý tất cả đặt lịch • {bookings.length} booking
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <button
                    onClick={() => setStatusFilter('PENDING')}
                    className={`group rounded-xl p-4 text-left transition-all border ${statusFilter === 'PENDING' ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            <ClockIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.pending}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Chờ xác nhận</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setStatusFilter('CONFIRMED')}
                    className={`group rounded-xl p-4 text-left transition-all border ${statusFilter === 'CONFIRMED' ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <CheckCircleIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.confirmed}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Đã xác nhận</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setStatusFilter('CHECKED_IN')}
                    className={`group rounded-xl p-4 text-left transition-all border ${statusFilter === 'CHECKED_IN' ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircleIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.checkedIn}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Đang sử dụng</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setStatusFilter('CANCELLED')}
                    className={`group rounded-xl p-4 text-left transition-all border ${statusFilter === 'CANCELLED' ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <XCircleIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.cancelled}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Đã hủy</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-xl p-4 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo mã, tên, email, SĐT..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <FunnelIcon className="size-5 text-neutral-400" />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-neutral-300 pl-4 pr-8 py-2.5 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    {statusFilter !== 'ALL' && (
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
                {paginatedBookings.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                        <th className="px-6 py-4">Mã booking</th>
                                        <th className="px-6 py-4">Khách hàng</th>
                                        <th className="px-6 py-4">Cơ sở</th>
                                        <th className="px-6 py-4">Combo</th>
                                        <th className="px-6 py-4">Ngày/Giờ</th>
                                        <th className="px-6 py-4">Tổng tiền</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {paginatedBookings.map((booking) => (
                                        <tr key={booking.id} className="text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                    {booking.bookingCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">{booking.user.name}</p>
                                                    <p className="text-neutral-500 dark:text-neutral-400">{booking.user.phone || booking.user.email}</p>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                {booking.location.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                {booking.combo.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                <div>
                                                    <p>{new Date(booking.date).toLocaleDateString('vi-VN')}</p>
                                                    <p className="text-neutral-500 dark:text-neutral-400">{booking.startTime} - {booking.endTime}</p>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[booking.status]}`}>
                                                    <span className={`size-1.5 rounded-full ${statusDots[booking.status]}`} />
                                                    {statusLabels[booking.status]}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <Link
                                                    href={`/admin/bookings/${booking.id}`}
                                                    className="flex size-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                                >
                                                    <EyeIcon className="size-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} của {filteredBookings.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronLeftIcon className="size-4" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`size-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                                                ? 'bg-primary-600 text-white'
                                                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronRightIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <CalendarDaysIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                        <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                            {searchQuery || statusFilter !== 'ALL' ? 'Không tìm thấy kết quả' : 'Chưa có booking nào'}
                        </p>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                            {searchQuery || statusFilter !== 'ALL' ? 'Thử thay đổi bộ lọc' : 'Các booking sẽ xuất hiện ở đây'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
