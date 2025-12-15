import { prisma } from '@/lib/prisma'
import { EnvelopeIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'

async function getCustomers() {
    return prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { bookings: true } },
        },
    })
}

export default async function CustomersPage() {
    const customers = await getCustomers()

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Khách hàng</h1>
                <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                    Danh sách khách hàng đã đăng ký
                </p>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                {customers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                    <th className="px-6 py-4 font-medium">Khách hàng</th>
                                    <th className="px-6 py-4 font-medium">Email</th>
                                    <th className="px-6 py-4 font-medium">Số điện thoại</th>
                                    <th className="px-6 py-4 font-medium">Số lần đặt</th>
                                    <th className="px-6 py-4 font-medium">Ngày tham gia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                                    {customer.avatar ? (
                                                        <img src={customer.avatar} alt="" className="size-10 rounded-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="size-5" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-neutral-900 dark:text-white">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                                                <EnvelopeIcon className="size-4 text-neutral-400" />
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                                                <PhoneIcon className="size-4 text-neutral-400" />
                                                {customer.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                                                {customer._count.bookings} booking
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-neutral-500 dark:text-neutral-400">
                                            {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <UserIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                        <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">Chưa có khách hàng</p>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Khách hàng sẽ xuất hiện ở đây sau khi đăng ký</p>
                    </div>
                )}
            </div>
        </div>
    )
}
