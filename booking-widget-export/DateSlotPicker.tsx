import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/types/appointment';

interface DateSlotPickerProps {
    slotsByDate: Record<string, TimeSlot[]> | undefined;
    isLoading: boolean;
    selectedSlot: TimeSlot | null;
    onSelectSlot: (slot: TimeSlot) => void;
}

// Generate week days starting from a given date
function getWeekDays(startDate: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        days.push(day);
    }
    return days;
}

// Format date to YYYY-MM-DD for slot lookup
function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

// Format time for display
function formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function DateSlotPicker({
    slotsByDate,
    isLoading,
    selectedSlot,
    onSelectSlot,
}: DateSlotPickerProps) {
    const today = useMemo(() => new Date(), []);
    const [weekStart, setWeekStart] = useState(() => {
        // Start from today
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        return start;
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

    const handlePrevWeek = () => {
        const newStart = new Date(weekStart);
        newStart.setDate(weekStart.getDate() - 7);
        // Don't go before today
        if (newStart >= today) {
            setWeekStart(newStart);
        }
    };

    const handleNextWeek = () => {
        const newStart = new Date(weekStart);
        newStart.setDate(weekStart.getDate() + 7);
        setWeekStart(newStart);
    };

    const canGoPrev = weekStart > today;

    // Get slots for selected date
    const slotsForSelectedDate = useMemo(() => {
        if (!selectedDate || !slotsByDate) return [];
        const dateKey = formatDateKey(selectedDate);
        const daySlots = slotsByDate[dateKey] || [];
        return daySlots.filter(slot => slot.available);
    }, [selectedDate, slotsByDate]);

    // Check if a date has available slots
    const hasAvailableSlots = (date: Date): boolean => {
        if (!slotsByDate) return false;
        const dateKey = formatDateKey(date);
        const daySlots = slotsByDate[dateKey] || [];
        return daySlots.some(slot => slot.available);
    };

    // Check if date is a weekend (Sat or Sun - we're closed)
    const isWeekend = (date: Date): boolean => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    // Get month/year display
    const monthYearDisplay = useMemo(() => {
        const firstDay = weekDays[0];
        const lastDay = weekDays[6];

        if (firstDay.getMonth() === lastDay.getMonth()) {
            return `${MONTH_NAMES[firstDay.getMonth()]} ${firstDay.getFullYear()}`;
        }
        return `${MONTH_NAMES[firstDay.getMonth()]} - ${MONTH_NAMES[lastDay.getMonth()]} ${lastDay.getFullYear()}`;
    }, [weekDays]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading available times...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{monthYearDisplay}</h4>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrevWeek}
                            disabled={!canGoPrev}
                            className={cn(
                                'rounded-lg p-2 transition-colors',
                                canGoPrev
                                    ? 'hover:bg-gray-100 text-gray-600'
                                    : 'text-gray-300 cursor-not-allowed'
                            )}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleNextWeek}
                            className="rounded-lg p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                        const isToday = isSameDay(day, today);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isPast = day < today && !isToday;
                        const isClosed = isWeekend(day);
                        const hasSlots = hasAvailableSlots(day);
                        const isDisabled = isPast || isClosed || !hasSlots;

                        return (
                            <button
                                key={day.toISOString()}
                                type="button"
                                onClick={() => !isDisabled && setSelectedDate(day)}
                                disabled={isDisabled}
                                className={cn(
                                    'flex flex-col items-center rounded-lg p-2 transition-all',
                                    isSelected
                                        ? 'bg-green-600 text-white'
                                        : isDisabled
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'hover:bg-gray-100 text-gray-700'
                                )}
                            >
                                <span className={cn(
                                    'text-xs font-medium',
                                    isSelected ? 'text-green-100' : 'text-gray-500'
                                )}>
                                    {DAY_NAMES[day.getDay()]}
                                </span>
                                <span className={cn(
                                    'text-lg font-semibold mt-1',
                                    isToday && !isSelected && 'text-green-600'
                                )}>
                                    {day.getDate()}
                                </span>
                                {isClosed && (
                                    <span className="text-xs text-gray-400">Closed</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                        Available times for {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </h4>

                    {slotsForSelectedDate.length === 0 ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm text-amber-800">
                                No available times for this date. Please select another day.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {slotsForSelectedDate.map((slot) => {
                                const isSlotSelected = selectedSlot?.start === slot.start;

                                return (
                                    <button
                                        key={slot.start}
                                        type="button"
                                        onClick={() => onSelectSlot(slot)}
                                        className={cn(
                                            'rounded-lg border-2 px-4 py-3 text-center font-medium transition-all',
                                            isSlotSelected
                                                ? 'border-green-600 bg-green-50 text-green-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        )}
                                    >
                                        {formatTime(slot.start)}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {!selectedDate && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">
                        Select a date above to see available appointment times.
                    </p>
                </div>
            )}
        </div>
    );
}
