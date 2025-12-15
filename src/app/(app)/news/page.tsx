import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    CalendarDaysIcon,
    MapPinIcon,
    ClockIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/shared/Badge'
import { HeaderNerd, FooterNerd } from '@/components/landing'
import NewsTabs from './NewsTabs'

export const metadata: Metadata = {
    title: 'Tin tức & Sự kiện',
    description: 'Cập nhật những hoạt động mới nhất từ Nerd Society',
}

interface PageProps {
    searchParams: Promise<{ type?: string; page?: string }>
}

async function getPosts(type?: string, page = 1, limit = 9) {
    const where: Record<string, unknown> = {
        status: 'PUBLISHED',
    }
    if (type && type !== 'ALL') {
        where.type = type
    }

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            orderBy: [
                { featured: 'desc' },
                { publishedAt: 'desc' },
            ],
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                excerpt: true,
                thumbnail: true,
                publishedAt: true,
                eventDate: true,
                eventTime: true,
                eventLocation: true,
                featured: true,
                author: { select: { name: true } },
            },
        }),
        prisma.post.count({ where }),
    ])

    return { posts, total, totalPages: Math.ceil(total / limit) }
}

export default async function NewsListPage({ searchParams }: PageProps) {
    const { type, page } = await searchParams
    const currentPage = parseInt(page || '1')
    const { posts, total, totalPages } = await getPosts(type, currentPage)

    return (
        <>
            <HeaderNerd />
            <main className="pt-20">
                <div className="py-12 lg:py-16 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="container">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white">
                                Tin tức & Sự kiện
                            </h1>
                            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                                Cập nhật những hoạt động, sự kiện và tin tức mới nhất từ Nerd Society
                            </p>
                        </div>

                        {/* Tabs */}
                        <NewsTabs currentType={type || 'ALL'} />

                        {/* Posts grid */}
                        {posts.length > 0 ? (
                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/news/${post.slug}`}
                                        className="group block bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-[16/10] overflow-hidden">
                                            {post.thumbnail ? (
                                                <Image
                                                    src={post.thumbnail}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
                                                    <CalendarDaysIcon className="size-12 text-primary-400" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <Badge color="primary">
                                                    {post.type === 'EVENT' ? 'Sự kiện' : 'Tin tức'}
                                                </Badge>
                                            </div>
                                            {post.featured && (
                                                <div className="absolute top-3 right-3">
                                                    <Badge color="featured">Nổi bật</Badge>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            {post.type === 'EVENT' && post.eventDate && (
                                                <div className="flex flex-wrap gap-3 mb-3 text-sm text-neutral-500 dark:text-neutral-400">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarDaysIcon className="size-4" />
                                                        {format(new Date(post.eventDate), 'dd/MM/yyyy', { locale: vi })}
                                                    </div>
                                                    {post.eventTime && (
                                                        <div className="flex items-center gap-1">
                                                            <ClockIcon className="size-4" />
                                                            {post.eventTime}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>

                                            {post.excerpt && (
                                                <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between text-sm">
                                                <span className="text-neutral-500 dark:text-neutral-400">
                                                    {post.publishedAt && format(new Date(post.publishedAt), 'dd MMM yyyy', { locale: vi })}
                                                </span>
                                                <span className="text-primary-600 dark:text-primary-400 font-medium">
                                                    Đọc thêm →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-8 text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl">
                                <CalendarDaysIcon className="size-16 mx-auto text-neutral-300 dark:text-neutral-600" />
                                <p className="mt-4 text-neutral-500 dark:text-neutral-400">
                                    Chưa có bài viết nào trong danh mục này
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <Link
                                        key={pageNum}
                                        href={`/news?type=${type || 'ALL'}&page=${pageNum}`}
                                        className={`size-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${pageNum === currentPage
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <FooterNerd />
        </>
    )
}
