import { prisma } from '@/lib/prisma'
import {
    MapPinIcon,
    PencilIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline'
import AddLocationWrapper from '@/components/admin/AddLocationWrapper'

async function getLocations() {
    return prisma.location.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
            _count: { select: { bookings: true } },
        },
    })
}

export default async function LocationsPage() {
    const locations = await getLocations()

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý Cơ sở</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Quản lý các chi nhánh Nerd Society
                    </p>
                </div>
                <AddLocationWrapper />
            </div>

            {/* Locations Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
                {locations.map((location) => (
                    <div
                        key={location.id}
                        className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-neutral-900"
                    >
                        {/* Status badge */}
                        <div className={`mb-4 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${location.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {location.isActive ? 'Đang hoạt động' : 'Tạm đóng'}
                        </div>

                        {/* Location info */}
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            {location.name}
                        </h3>

                        {/* Address */}
                        <div className="mt-3 flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                            <MapPinIcon className="mt-0.5 size-4 flex-shrink-0 text-neutral-400" />
                            <span>{location.address}</span>
                        </div>

                        {/* Phone */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                            <PhoneIcon className="size-4 text-neutral-400" />
                            <span>{location.phone}</span>
                        </div>

                        {/* Map link */}
                        {location.mapUrl && (
                            <a
                                href={location.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
                            >
                                Xem trên bản đồ →
                            </a>
                        )}

                        {/* Stats */}
                        <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {location._count.bookings} lượt đặt
                            </p>
                        </div>

                        {/* Edit button */}
                        <button className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-neutral-800 dark:text-neutral-300">
                            <PencilIcon className="size-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
