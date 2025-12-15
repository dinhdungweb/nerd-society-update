'use client'

import { useState, useEffect } from 'react'
import {
    PlusIcon,
    BuildingOffice2Icon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/shared/Button'
import NcModal from '@/shared/NcModal'

interface Room {
    id: string
    name: string
    type: 'MEETING_LONG' | 'MEETING_ROUND' | 'POD_MONO' | 'POD_MULTI'
    description: string | null
    capacity: number
    amenities: string[]
    image: string | null
    isActive: boolean
    location: { id: string; name: string }
    _count: { bookings: number }
}

interface Location {
    id: string
    name: string
}

const roomTypeLabels: Record<string, string> = {
    MEETING_LONG: 'Meeting - Bàn dài',
    MEETING_ROUND: 'Meeting - Bàn tròn',
    POD_MONO: 'Mono Pod',
    POD_MULTI: 'Multi Pod',
}

const roomTypeColors: Record<string, string> = {
    MEETING_LONG: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    MEETING_ROUND: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    POD_MONO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    POD_MULTI: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

const roomTypeIcons: Record<string, string> = {
    MEETING_LONG: '🏢',
    MEETING_ROUND: '🔵',
    POD_MONO: '👤',
    POD_MULTI: '👥',
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'MEETING_LONG',
        description: '',
        capacity: 1,
        amenities: '',
        locationId: '',
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchRooms()
        fetchLocations()
    }, [])

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/admin/rooms')
            if (res.ok) {
                const data = await res.json()
                setRooms(data)
            }
        } catch (error) {
            console.error('Error fetching rooms:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/admin/locations')
            if (res.ok) {
                const data = await res.json()
                setLocations(data)
            }
        } catch (error) {
            console.error('Error fetching locations:', error)
        }
    }

    const openCreateModal = () => {
        setEditingRoom(null)
        setFormData({
            name: '',
            type: 'MEETING_LONG',
            description: '',
            capacity: 1,
            amenities: '',
            locationId: locations[0]?.id || '',
        })
        setIsModalOpen(true)
    }

    const openEditModal = (room: Room) => {
        setEditingRoom(room)
        setFormData({
            name: room.name,
            type: room.type,
            description: room.description || '',
            capacity: room.capacity,
            amenities: room.amenities.join(', '),
            locationId: room.location.id,
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                ...formData,
                amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
            }

            const url = editingRoom
                ? `/api/admin/rooms/${editingRoom.id}`
                : '/api/admin/rooms'
            const method = editingRoom ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                fetchRooms()
                setIsModalOpen(false)
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to save room')
            }
        } catch (error) {
            console.error('Error saving room:', error)
        } finally {
            setSaving(false)
        }
    }

    const toggleRoomStatus = async (room: Room) => {
        try {
            await fetch(`/api/admin/rooms/${room.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !room.isActive }),
            })
            fetchRooms()
        } catch (error) {
            console.error('Error toggling room status:', error)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Quản lý Phòng
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        {rooms.length} phòng
                    </p>
                </div>
                <Button onClick={openCreateModal}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Thêm phòng
                </Button>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        className={`bg-white dark:bg-neutral-800 rounded-xl border ${room.isActive
                                ? 'border-neutral-200 dark:border-neutral-700'
                                : 'border-red-200 dark:border-red-800 opacity-60'
                            } p-5 hover:shadow-lg transition-shadow`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{roomTypeIcons[room.type]}</span>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                                        {room.name}
                                    </h3>
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${roomTypeColors[room.type]}`}>
                                        {roomTypeLabels[room.type]}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleRoomStatus(room)}
                                className={`p-1.5 rounded-full transition-colors ${room.isActive
                                        ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                        : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                                title={room.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                            >
                                {room.isActive ? (
                                    <CheckCircleIcon className="w-5 h-5" />
                                ) : (
                                    <XCircleIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-2">
                                <UserGroupIcon className="w-4 h-4" />
                                <span>Sức chứa: {room.capacity} người</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BuildingOffice2Icon className="w-4 h-4" />
                                <span>{room.location.name}</span>
                            </div>
                            {room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {room.amenities.slice(0, 3).map((amenity, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 rounded"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                    {room.amenities.length > 3 && (
                                        <span className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 rounded">
                                            +{room.amenities.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                            <span className="text-xs text-neutral-500">
                                {room._count.bookings} lượt đặt
                            </span>
                            <button
                                onClick={() => openEditModal(room)}
                                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                                Sửa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <NcModal
                isOpenProp={isModalOpen}
                onCloseModal={() => setIsModalOpen(false)}
                modalTitle={editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
                renderContent={() => (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Tên phòng
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Loại phòng
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                >
                                    <option value="MEETING_LONG">Meeting - Bàn dài</option>
                                    <option value="MEETING_ROUND">Meeting - Bàn tròn</option>
                                    <option value="POD_MONO">Mono Pod</option>
                                    <option value="POD_MULTI">Multi Pod</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Sức chứa
                                </label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                                    min="1"
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Cơ sở
                            </label>
                            <select
                                value={formData.locationId}
                                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                required
                            >
                                <option value="">Chọn cơ sở</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Tiện ích (cách nhau bằng dấu phẩy)
                            </label>
                            <input
                                type="text"
                                value={formData.amenities}
                                onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                                placeholder="Máy chiếu, Điều hòa, Bảng trắng"
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" loading={saving}>
                                {editingRoom ? 'Cập nhật' : 'Tạo phòng'}
                            </Button>
                            <Button type="button" outline onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </Button>
                        </div>
                    </form>
                )}
            />
        </div>
    )
}
