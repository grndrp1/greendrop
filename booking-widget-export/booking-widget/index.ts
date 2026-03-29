/**
 * Public Booking Widget
 *
 * Self-contained appointment booking component for unauthenticated users.
 *
 * Usage:
 * ```tsx
 * import { PublicBookingWidget } from '@/components/public/booking-widget';
 *
 * // Basic usage
 * <PublicBookingWidget />
 *
 * // With pre-selected shop
 * <PublicBookingWidget shopId={1} />
 *
 * // With custom accent color and callbacks
 * <PublicBookingWidget
 *   accentColor="#4F46E5"
 *   onComplete={(result) => console.log('Booked:', result)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 * ```
 */

export { PublicBookingWidget } from './PublicBookingWidget';
export type {
    PublicBookingWidgetProps,
    BookingResult,
    BookingError,
    BookingStep,
} from './types';
