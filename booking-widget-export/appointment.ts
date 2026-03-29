/**
 * Appointment type definition
 * Matches the database schema for appointments table
 */
export interface Appointment {
    id: string;
    tekmetric_appointment_id: number | null;
    customer_id: string;
    vehicle_id: string;
    shop_id: number | null;
    scheduled_start: string | null;
    scheduled_end: string | null;
    status: AppointmentStatus;
    notes: string | null;
    customer_notes: string | null;
    title: string | null;
    appointment_type: AppointmentType[] | null;
    portal_created: boolean;
    recurring_preference_id: string | null;
    estimated_duration_minutes: number | null;
    sync_source: 'tekmetric' | 'shopware' | 'portal' | 'portal_merged' | null;
    created_at: string;
    updated_at: string;
}

/**
 * Appointment type (routine visit vs service with recommendations)
 */
export type AppointmentType =
    | 'routine_visit'
    | 'service'
    | 'follow_up'
    | 'oil_change'
    | 'declined_service'
    | 'brakes'
    | 'heat_ac'
    | 'tires_repair'
    | 'tires_rotation'
    | 'alignment'
    | 'other';

/**
 * Appointment status types
 */
export type AppointmentStatus =
    | 'draft'
    | 'scheduled'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'pending'; // For pending appointment_recommendations not yet linked to an appointment

/**
 * Sync source types for appointments
 */
export type AppointmentSyncSource = 'tekmetric' | 'shopware' | 'portal';

/**
 * Appointment with related vehicle and customer data
 */
export interface AppointmentWithDetails extends Appointment {
    vehicle?: {
        id: string;
        year: number | null;
        make: string | null;
        model: string | null;
        vin: string | null;
    };
    customer?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string;
    };
    shop?: {
        id: number;
        shop_name: string | null;
        shop_location: string | null;
    };
}

/**
 * Appointment Recommendation junction table type
 * Links appointments to selected recommendations
 */
export interface AppointmentRecommendation {
    id: string;
    appointment_id: string;
    recommendation_id: string;
    selected_at: string;
    notes: string | null;
}

/**
 * Appointment with linked recommendations
 */
export interface AppointmentWithRecommendations extends Appointment {
    appointment_recommendations?: Array<{
        id: string;
        selected_at: string;
        notes: string | null;
        recommendation: {
            id: string;
            service_name: string | null;
            description: string | null;
            price: number | null;
            priority: string | null;
            approved: boolean | null;
        };
    }>;
}

// ============================================================================
// Scheduling Types
// ============================================================================

/**
 * Time slot for appointment scheduling
 */
export interface TimeSlot {
    start: string;           // ISO datetime
    end: string;             // ISO datetime
    available: boolean;
    capacity_used: number;
    max_capacity: number;
}

/**
 * Response from get-available-slots edge function
 */
export interface AvailableSlotsResponse {
    success: boolean;
    shop_id: number;
    slots_by_date: Record<string, TimeSlot[]>;
    error?: string;
}

/**
 * Recurring appointment preference types
 */
export type RecurringPreferenceType = 'auto_schedule' | 'reminder_only' | 'none';

/**
 * Recurring interval options (in months)
 */
export type RecurringInterval = 1 | 2 | 3 | 4 | 6 | 12;

/**
 * Preferred time slot for recurring appointments
 */
export type PreferredTimeSlot = 'morning' | 'afternoon' | 'any';

/**
 * Customer recurring appointment preferences
 */
export interface RecurringPreference {
    id: string;
    customer_id: string;
    vehicle_id: string;
    shop_id: number;
    recurrence_type: RecurringPreferenceType;
    interval_months: RecurringInterval;
    preferred_day_of_week: number | null; // 0-6, null = any
    preferred_time_slot: PreferredTimeSlot;
    is_active: boolean;
    next_due_date: string | null;
    last_reminder_sent_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Input for creating an appointment via edge function
 */
export interface CreateAppointmentInput {
    customer_id: string;
    vehicle_id: string;
    shop_id: number;
    scheduled_start: string;
    scheduled_end?: string;
    appointment_type: AppointmentType[];
    customer_notes?: string;
    title?: string;
    /** Phone number for Tekmetric sync - will update customer profile if different */
    customer_phone?: string;
    /** First name for Tekmetric sync - will update customer profile if currently empty */
    customer_first_name?: string;
    /** Last name for Tekmetric sync - will update customer profile if currently empty */
    customer_last_name?: string;
    recurring_preference?: {
        type: RecurringPreferenceType;
        interval_months?: RecurringInterval;
        preferred_day_of_week?: number;
        preferred_time_slot?: PreferredTimeSlot;
    };
}

/**
 * Response from create-appointment edge function
 */
export interface CreateAppointmentResponse {
    success: boolean;
    appointment_id?: string;
    tekmetric_appointment_id?: number;
    /** True if a new Tekmetric customer was created during this appointment */
    tekmetric_customer_created?: boolean;
    /** True if a new Tekmetric vehicle was created during this appointment */
    tekmetric_vehicle_created?: boolean;
    error?: string;
    message?: string;
    /** True if this was a duplicate request and existing appointment was returned */
    duplicate?: boolean;
    /**
     * True when Tekmetric sync failed but appointment was saved locally.
     * The appointment will be retried automatically.
     */
    tekmetric_sync_pending?: boolean;
}

/**
 * Input for updating appointment (reschedule, notes, or location change)
 */
export interface UpdateAppointmentInput {
    appointment_id: string;
    scheduled_start?: string;
    scheduled_end?: string;
    customer_notes?: string;
    shop_id?: number;  // For cross-shop reschedule
}

/**
 * Response from update-appointment edge function
 */
export interface UpdateAppointmentResponse {
    success: boolean;
    appointment_id?: string;
    updated_fields?: string[];
    error?: string;
    message?: string;
}

/**
 * Input for canceling an appointment
 */
export interface CancelAppointmentInput {
    appointment_id: string;
    reason?: string;
}

/**
 * Response from cancel-appointment edge function
 */
export interface CancelAppointmentResponse {
    success: boolean;
    appointment_id?: string;
    cancelled_in_tekmetric?: boolean;
    error?: string;
    message?: string;
}
