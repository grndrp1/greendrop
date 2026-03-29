/**
 * Public Booking API Helpers
 *
 * Provides unauthenticated access to booking-related edge functions.
 * Uses the anon key for public access with rate limiting on the backend.
 */

import type { AvailableSlotsResponse, VehicleInfo, CustomerVehicle } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ============================================================================
// Generic API Helper
// ============================================================================

interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    errorCode?: string;
}

export async function callPublicApi<T>(
    functionName: string,
    body: Record<string, unknown>
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // Handle non-200 responses or unsuccessful results
        if (!response.ok || data.success === false) {
            return {
                data: null,
                error: data.error || 'Request failed',
                errorCode: data.error_code,
            };
        }

        return { data, error: null };
    } catch (err) {
        console.error(`Public API error (${functionName}):`, err);
        return {
            data: null,
            error: 'Network error. Please check your connection and try again.',
            errorCode: 'NETWORK_ERROR',
        };
    }
}

// ============================================================================
// Booking API Functions
// ============================================================================

interface CheckEmailResponse {
    success: boolean;
    error?: string;
    error_code?: string;
    customer_found?: boolean;
    vehicles?: CustomerVehicle[];
}

/**
 * Check if email belongs to an existing customer.
 * Returns customer_found status and error_code indicating next step.
 */
export async function checkEmail(
    email: string,
    honeypot: string = ''
): Promise<{
    isReturningCustomer: boolean;
    requiresPhoneVerification: boolean;
    vehicles: CustomerVehicle[];
    error: string | null;
    errorCode: string | null;
}> {
    const result = await callPublicApi<CheckEmailResponse>('create-appointment-public', {
        email,
        _hp_field: honeypot,
    });

    // Rate limited
    if (result.errorCode === 'RATE_LIMITED') {
        return {
            isReturningCustomer: false,
            requiresPhoneVerification: false,
            vehicles: [],
            error: result.error,
            errorCode: result.errorCode,
        };
    }

    // Returning customer - needs phone verification
    if (result.errorCode === 'PHONE_VERIFICATION_REQUIRED') {
        return {
            isReturningCustomer: true,
            requiresPhoneVerification: true,
            vehicles: result.data?.vehicles || [],
            error: null,
            errorCode: null,
        };
    }

    // New customer - needs full form
    if (result.errorCode === 'NEW_CUSTOMER_FIELDS_REQUIRED') {
        return {
            isReturningCustomer: false,
            requiresPhoneVerification: false,
            vehicles: [],
            error: null,
            errorCode: null,
        };
    }

    // Some other error (invalid email, etc.)
    if (result.error) {
        return {
            isReturningCustomer: false,
            requiresPhoneVerification: false,
            vehicles: [],
            error: result.error,
            errorCode: result.errorCode || null,
        };
    }

    // Shouldn't reach here normally, but handle gracefully
    return {
        isReturningCustomer: false,
        requiresPhoneVerification: false,
        vehicles: [],
        error: null,
        errorCode: null,
    };
}

interface VerifyPhoneResponse {
    success: boolean;
    error?: string;
    error_code?: string;
    vehicles?: CustomerVehicle[];
}

/**
 * Verify returning customer with phone last 4 digits.
 * Returns customer's vehicles on success.
 */
export async function verifyPhone(
    email: string,
    phoneLastFour: string
): Promise<{
    verified: boolean;
    vehicles: CustomerVehicle[];
    error: string | null;
}> {
    const result = await callPublicApi<VerifyPhoneResponse>('create-appointment-public', {
        email,
        phone_last_4: phoneLastFour,
    });

    if (result.errorCode === 'PHONE_VERIFICATION_FAILED') {
        return {
            verified: false,
            vehicles: [],
            error: "Phone number doesn't match. Please check the last 4 digits.",
        };
    }

    // Other validation errors mean verification passed but we need more data
    // (e.g., VEHICLE_REQUIRED, MISSING_FIELDS)
    if (result.errorCode === 'VEHICLE_REQUIRED' || result.errorCode === 'MISSING_FIELDS') {
        return {
            verified: true,
            vehicles: result.data?.vehicles || [],
            error: null,
        };
    }

    if (result.error) {
        return {
            verified: false,
            vehicles: [],
            error: result.error,
        };
    }

    return {
        verified: true,
        vehicles: result.data?.vehicles || [],
        error: null,
    };
}

/**
 * Get available appointment slots for a shop.
 */
export async function getAvailableSlots(
    shopId: number,
    dateFrom: string,
    dateTo: string,
    serviceBucket: 'oil_change' | 'other'
): Promise<{
    slotsByDate: Record<string, Array<{ start: string; end: string; available: boolean }>>;
    error: string | null;
}> {
    const result = await callPublicApi<AvailableSlotsResponse>('get-available-slots', {
        shop_id: shopId,
        date_from: dateFrom,
        date_to: dateTo,
        service_bucket: serviceBucket,
    });

    if (result.error) {
        return {
            slotsByDate: {},
            error: result.error,
        };
    }

    return {
        slotsByDate: result.data?.slots_by_date || {},
        error: null,
    };
}

interface CreateAppointmentResponse {
    success: boolean;
    appointment_id?: string;
    scheduled_start?: string;
    shop_name?: string;
    signup_token?: string;
    error?: string;
    error_code?: string;
}

export interface CreateAppointmentParams {
    email: string;
    // Returning customer
    phoneLastFour?: string;
    vehicleId?: string;
    // New customer
    firstName?: string;
    lastName?: string;
    phone?: string;
    vehicle?: VehicleInfo;
    // Appointment details
    shopId: number;
    scheduledStart: string;
    serviceBucket: 'oil_change' | 'other';
    notes?: string;
}

/**
 * Create an appointment (final submission).
 */
export async function createAppointment(
    params: CreateAppointmentParams
): Promise<{
    success: boolean;
    appointmentId?: string;
    scheduledStart?: string;
    shopName?: string;
    signupToken?: string;
    error: string | null;
    errorCode: string | null;
}> {
    const body: Record<string, unknown> = {
        email: params.email,
        shop_id: params.shopId,
        scheduled_start: params.scheduledStart,
        service_bucket: params.serviceBucket,
        notes: params.notes,
        _hp_field: '', // Honeypot always empty
    };

    // Returning customer fields
    if (params.phoneLastFour) {
        body.phone_last_4 = params.phoneLastFour;
    }
    if (params.vehicleId) {
        body.vehicle_id = params.vehicleId;
    }

    // New customer fields
    if (params.firstName) {
        body.first_name = params.firstName;
    }
    if (params.lastName) {
        body.last_name = params.lastName;
    }
    if (params.phone) {
        body.phone = params.phone;
    }
    if (params.vehicle) {
        body.vehicle = params.vehicle;
    }

    const result = await callPublicApi<CreateAppointmentResponse>(
        'create-appointment-public',
        body
    );

    if (result.error) {
        return {
            success: false,
            error: result.error,
            errorCode: result.errorCode || null,
        };
    }

    return {
        success: true,
        appointmentId: result.data?.appointment_id,
        scheduledStart: result.data?.scheduled_start,
        shopName: result.data?.shop_name,
        signupToken: result.data?.signup_token,
        error: null,
        errorCode: null,
    };
}
