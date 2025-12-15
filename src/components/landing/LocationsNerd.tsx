'use client'

import { Button } from '@/shared/Button'
import {
    BuildingOffice2Icon,
    BuildingStorefrontIcon,
    MapIcon,
    MapPinIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const locations = [
    {
        name: 'Cơ sở Hồ Tùng Mậu',
        address: 'Tập thể trường múa, Khu Văn hóa & Nghệ Thuật, đường Hồ Tùng Mậu, P. Mai Dịch, Hà Nội',
        hotline: '036 848 3689',
        mapUrl: 'https://maps.app.goo.gl/1hdXj2VDtcScxGKm9',
        icon: BuildingOffice2Icon,
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop',
    },
    {
        name: 'Cơ sở Tây Sơn',
        address: 'Tầng 2, 3 ngõ 167 Tây Sơn, Hà Nội',
        hotline: '036 848 3689',
        mapUrl: 'https://maps.app.goo.gl/RVeYRTPuWTuiTymq9',
        icon: BuildingStorefrontIcon,
        image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=400&fit=crop',
    },
]

export default function LocationsNerd() {
    return (
        <section id="locations" className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="container">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block rounded-full bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 dark:bg-secondary-900/50 dark:text-secondary-300"
                    >
                        Địa điểm
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white"
                    >
                        2 Cơ sở tại Hà Nội
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-lg text-neutral-600 dark:text-neutral-300"
                    >
                        Chọn cơ sở gần bạn nhất để đến và trải nghiệm
                    </motion.p>
                </div>

                {/* Locations Grid */}
                <div className="mt-16 grid gap-8 lg:grid-cols-2">
                    {locations.map((location, index) => (
                        <motion.div
                            key={location.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {/* Location Image */}
                            <div className="relative h-80 overflow-hidden">
                                <img
                                    src={location.image}
                                    alt={location.name}
                                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {location.name}
                                </h3>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="size-5 shrink-0 text-primary-500" />
                                        <p className="text-neutral-600 dark:text-neutral-400">{location.address}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <PhoneIcon className="size-5 shrink-0 text-primary-500" />
                                        <a
                                            href={`tel:${location.hotline.replace(/\s/g, '')}`}
                                            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                                        >
                                            {location.hotline}
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <Button outline href={location.mapUrl} className="flex-1 justify-center">
                                        <MapIcon className="size-5" />
                                        Xem bản đồ
                                    </Button>
                                    <Button color="primary" href="/booking" className="flex-1 justify-center">
                                        Đặt lịch
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
