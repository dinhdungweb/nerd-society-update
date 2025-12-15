'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarDaysIcon,
    ClockIcon,
    UserIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline'

interface CalendarEvent {
    id: string
    title: string
    start: string
    end: string
    resourceId: string
    extendedProps: {
        bookingCode: string
        customerName: string
        customerPhone: string
        roomName: string
        roomType: string
        status: string
        guests: number
        estimatedAmount: number
        depositStatus: string
    }
    backgroundColor: string
}

interface Room {
    id: string
    title: string
    type: string
}

interface Location {
    id: string
    name: string
}

const statusLabels: Record<string, string> = {
    PENDING: 'Chờ cọc',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang sử dụng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
}

const roomTypeColors: Record<string, string> = {
    MEETING_LONG: 'bg-blue-500',
    MEETING_ROUND: 'bg-indigo-500',
    POD_MONO: 'bg-emerald-500',
    POD_MULTI: 'bg-teal-500',
}

// Time slots from 7:00 to 23:00
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 7
    return `${hour.toString().padStart(2, '0')}:00`
})

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [selectedLocation, setSelectedLocation] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

    useEffect(() => {
        fetchLocations()
    }, [])

    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/admin/locations')
            if (res.ok) {
                const data = await res.json()
                setLocations(data)
                if (data.length > 0) {
                    setSelectedLocation(data[0].id)
                }
            }
        } catch (error) {
            console.error('Error fetching locations:', error)
        }
    }

    const fetchCalendarData = useCallback(async () => {
        if (!selectedLocation) return

        setLoading(true)
        try {
            const dateStr = currentDate.toISOString().split('T')[0]
            const res = await fetch(
                `/api/admin/calendar?startDate=${dateStr}&endDate=${dateStr}&locationId=${selectedLocation}`
            )
            if (res.ok) {
                const data = await res.json()
                setEvents(data.events)
                setRooms(data.resources)
            }
        } catch (error) {
            console.error('Error fetching calendar:', error)
        } finally {
            setLoading(false)
        }
    }, [currentDate, selectedLocation])

    useEffect(() => {
        fetchCalendarData()
    }, [fetchCalendarData])

    const goToPrevDay = () => {
        setCurrentDate(prev => {
            const d = new Date(prev)
            d.setDate(d.getDate() - 1)
            return d
        })
    }

    const goToNextDay = () => {
        setCurrentDate(prev => {
            const d = new Date(prev)
            d.setDate(d.getDate() + 1)
            return d
        })
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }

    // Get events for a specific room and time slot
    const getEventsForSlot = (roomId: string, timeSlot: string) => {
        return events.filter(event => {
            if (event.resourceId !== roomId) return false
            const eventStart = event.start.split('T')[1]?.substring(0, 5) || ''
            const eventEnd = event.end.split('T')[1]?.substring(0, 5) || ''
            // Check if the time slot falls within the event time range
            return timeSlot >= eventStart && timeSlot < eventEnd
        })
    }

    // Check if this is the start of an event
    const isEventStart = (event: CalendarEvent, timeSlot: string) => {
        const eventStart = event.start.split('T')[1]?.substring(0, 5) || ''
        return eventStart === timeSlot
    }

    // Calculate event duration in slots
    const getEventDuration = (event: CalendarEvent) => {
        const startTime = event.start.split('T')[1]?.substring(0, 5) || ''
        const endTime = event.end.split('T')[1]?.substring(0, 5) || ''
        const startHour = parseInt(startTime.split(':')[0])
        const endHour = parseInt(endTime.split(':')[0])
        return endHour - startHour
    }

    if (loading && rooms.length === 0) {
        return (
            <div className="space-y-6">
                <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-[600px] bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <CalendarDaysIcon className="w-8 h-8 text-primary-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Lịch đặt phòng
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Xem và quản lý lịch đặt
                        </p>
                    </div>
                </div>

                {/* Location Filter */}
                <select
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                >
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                </select>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                <button
                    onClick={goToPrevDay}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                        Hôm nay
                    </button>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {formatDate(currentDate)}
                    </h2>
                </div>
                <button
                    onClick={goToNextDay}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Timeline Grid */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <th className="w-32 px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400 sticky left-0 bg-white dark:bg-neutral-800 z-10">
                                    Phòng
                                </th>
                                {TIME_SLOTS.map(slot => (
                                    <th
                                        key={slot}
                                        className="px-2 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 min-w-[60px]"
                                    >
                                        {slot}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id} className="border-b border-neutral-100 dark:border-neutral-700/50">
                                    <td className="px-4 py-3 sticky left-0 bg-white dark:bg-neutral-800 z-10">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${roomTypeColors[room.type] || 'bg-neutral-400'}`} />
                                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {room.title}
                                            </span>
                                        </div>
                                    </td>
                                    {TIME_SLOTS.map(slot => {
                                        const slotEvents = getEventsForSlot(room.id, slot)
                                        const eventHere = slotEvents[0]

                                        if (eventHere && isEventStart(eventHere, slot)) {
                                            const duration = getEventDuration(eventHere)
                                            return (
                                                <td
                                                    key={slot}
                                                    colSpan={duration}
                                                    className="p-1"
                                                >
                                                    <button
                                                        onClick={() => setSelectedEvent(eventHere)}
                                                        className="w-full h-full min-h-[48px] rounded-lg text-white text-xs font-medium px-2 py-1 text-left transition-transform hover:scale-[1.02] hover:z-10"
                                                        style={{ backgroundColor: eventHere.backgroundColor }}
                                                    >
                                                        <div className="truncate">{eventHere.extendedProps.customerName}</div>
                                                        <div className="text-[10px] opacity-80 truncate">
                                                            {eventHere.start.split('T')[1]?.substring(0, 5)} - {eventHere.end.split('T')[1]?.substring(0, 5)}
                                                        </div>
                                                    </button>
                                                </td>
                                            )
                                        } else if (eventHere) {
                                            // Part of spanning event, skip rendering
                                            return null
                                        }

                                        return (
                                            <td
                                                key={slot}
                                                className="p-1"
                                            >
                                                <div className="w-full h-12 bg-neutral-50 dark:bg-neutral-700/30 rounded border border-dashed border-neutral-200 dark:border-neutral-600" />
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedEvent(null)}>
                    <div
                        className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Chi tiết Booking
                            </h3>
                            <span
                                className="px-3 py-1 text-xs font-medium text-white rounded-full"
                                style={{ backgroundColor: selectedEvent.backgroundColor }}
                            >
                                {statusLabels[selectedEvent.extendedProps.status]}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-neutral-500">Mã:</span>
                                <span className="font-mono font-medium text-neutral-900 dark:text-white">
                                    {selectedEvent.extendedProps.bookingCode}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <UserIcon className="w-4 h-4 text-neutral-400" />
                                <span className="text-neutral-900 dark:text-white">
                                    {selectedEvent.extendedProps.customerName}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <PhoneIcon className="w-4 h-4 text-neutral-400" />
                                <span className="text-neutral-900 dark:text-white">
                                    {selectedEvent.extendedProps.customerPhone}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <ClockIcon className="w-4 h-4 text-neutral-400" />
                                <span className="text-neutral-900 dark:text-white">
                                    {selectedEvent.start.split('T')[1]?.substring(0, 5)} - {selectedEvent.end.split('T')[1]?.substring(0, 5)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-neutral-500">Phòng:</span>
                                <span className="text-neutral-900 dark:text-white">
                                    {selectedEvent.extendedProps.roomName}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-neutral-500">Số người:</span>
                                <span className="text-neutral-900 dark:text-white">
                                    {selectedEvent.extendedProps.guests}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-neutral-500">Tổng tiền:</span>
                                <span className="font-medium text-neutral-900 dark:text-white">
                                    {new Intl.NumberFormat('vi-VN').format(selectedEvent.extendedProps.estimatedAmount)}đ
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="w-full mt-6 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
