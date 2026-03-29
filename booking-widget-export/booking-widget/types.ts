/**
 * Public Booking Widget Types
 *
 * Types for the unauthenticated booking widget used on public websites.
 */

import type { TimeSlot } from '@/types/appointment';

// ============================================================================
// Component Props
// ============================================================================

export interface PublicBookingWidgetProps {
    /** Pre-select shop (skip shop selection step) */
    shopId?: number;
    /** Pre-select service type */
    serviceType?: 'oil_change' | 'other';
    /** Brand accent color (CSS color value, default: green-600) */
    accentColor?: string;
    /** Callback when booking completes successfully */
    onComplete?: (result: BookingResult) => void;
    /** Callback when an error occurs */
    onError?: (error: BookingError) => void;
    /** Show "Create Account" CTA after booking (default: true) */
    showSignupPrompt?: boolean;
}

// ============================================================================
// Booking Steps
// ============================================================================

export type BookingStep = 'email' | 'customer' | 'shop' | 'time' | 'review' | 'confirmation';

export interface StepInfo {
    id: BookingStep;
    title: string;
}

// ============================================================================
// Form State
// ============================================================================

export interface VehicleInfo {
    year: number;
    make: string;
    model: string;
    vin?: string;
}

export interface CustomerVehicle {
    id: string;
    year: number | null;
    make: string | null;
    model: string | null;
}

export interface BookingDraft {
    email: string;
    isReturningCustomer: boolean | null;
    phoneLastFour: string;
    firstName: string;
    lastName: string;
    phone: string;
    vehicle: VehicleInfo | null;
    selectedVehicleId: string | null;
    selectedShopId: number | null;
    selectedSlot: TimeSlot | null;
    serviceType: 'oil_change' | 'other';
    notes: string;
    step: BookingStep;
}

// ============================================================================
// API Types
// ============================================================================

export interface BookingResult {
    success: true;
    appointmentId: string;
    scheduledStart: string;
    shopName: string;
    signupToken?: string;
}

export interface BookingError {
    success: false;
    error: string;
    errorCode: string;
}

export type BookingApiResponse = BookingResult | BookingError;

// Customer lookup result (from initial email check)
export interface CustomerLookupResult {
    customerFound: boolean;
    requiresPhoneVerification: boolean;
    vehicles?: CustomerVehicle[];
}

// Available slots response
export interface AvailableSlotsResponse {
    success: boolean;
    shop_id: number;
    slots_by_date: Record<string, TimeSlot[]>;
    error?: string;
}

// ============================================================================
// Error Codes
// ============================================================================

export type BookingErrorCode =
    | 'RATE_LIMITED'
    | 'PHONE_VERIFICATION_REQUIRED'
    | 'PHONE_VERIFICATION_FAILED'
    | 'NEW_CUSTOMER_FIELDS_REQUIRED'
    | 'INVALID_EMAIL'
    | 'INVALID_VEHICLE'
    | 'VEHICLE_REQUIRED'
    | 'MISSING_FIELDS'
    | 'INVALID_SHOP'
    | 'INTERNAL_ERROR';
