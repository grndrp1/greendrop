/**
 * Booking Session Storage Hook
 *
 * Persists booking draft to sessionStorage so users can resume
 * if they accidentally refresh or navigate away.
 */

import { useCallback } from 'react';
import type { BookingDraft, BookingStep } from './types';
import type { TimeSlot } from '@/types/appointment';

const STORAGE_KEY = 'gdg_booking_draft';

// Default empty draft
const DEFAULT_DRAFT: BookingDraft = {
    email: '',
    isReturningCustomer: null,
    phoneLastFour: '',
    firstName: '',
    lastName: '',
    phone: '',
    vehicle: null,
    selectedVehicleId: null,
    selectedShopId: null,
    selectedSlot: null,
    serviceType: 'oil_change',
    notes: '',
    step: 'email',
};

export interface UseBookingSessionReturn {
    /** Load saved draft from sessionStorage */
    load: () => BookingDraft | null;
    /** Save current draft to sessionStorage */
    save: (data: Partial<BookingDraft>) => void;
    /** Clear saved draft */
    clear: () => void;
    /** Check if a draft exists */
    hasDraft: () => boolean;
}

export function useBookingSession(): UseBookingSessionReturn {
    const load = useCallback((): BookingDraft | null => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const parsed = JSON.parse(stored);

            // Validate it has the expected shape
            if (typeof parsed !== 'object' || parsed === null) {
                return null;
            }

            // Merge with defaults to handle any missing fields from schema changes
            return {
                ...DEFAULT_DRAFT,
                ...parsed,
            };
        } catch (err) {
            console.warn('Failed to load booking draft:', err);
            return null;
        }
    }, []);

    const save = useCallback((data: Partial<BookingDraft>) => {
        try {
            // Load existing draft and merge
            const existing = load() || DEFAULT_DRAFT;
            const updated = { ...existing, ...data };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
            console.warn('Failed to save booking draft:', err);
        }
    }, [load]);

    const clear = useCallback(() => {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.warn('Failed to clear booking draft:', err);
        }
    }, []);

    const hasDraft = useCallback((): boolean => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (!stored) return false;

            const parsed = JSON.parse(stored);
            // Consider it a draft if email is filled
            return typeof parsed?.email === 'string' && parsed.email.length > 0;
        } catch {
            return false;
        }
    }, []);

    return { load, save, clear, hasDraft };
}

/**
 * Helper to create a saveable draft from component state
 */
export function createDraft(state: {
    email: string;
    isReturningCustomer: boolean | null;
    phoneLastFour: string;
    firstName: string;
    lastName: string;
    phone: string;
    vehicle: { year: number; make: string; model: string; vin?: string } | null;
    selectedVehicleId: string | null;
    selectedShopId: number | null;
    selectedSlot: TimeSlot | null;
    serviceType: 'oil_change' | 'other';
    notes: string;
    step: BookingStep;
}): BookingDraft {
    return {
        email: state.email,
        isReturningCustomer: state.isReturningCustomer,
        phoneLastFour: state.phoneLastFour,
        firstName: state.firstName,
        lastName: state.lastName,
        phone: state.phone,
        vehicle: state.vehicle,
        selectedVehicleId: state.selectedVehicleId,
        selectedShopId: state.selectedShopId,
        selectedSlot: state.selectedSlot,
        serviceType: state.serviceType,
        notes: state.notes,
        step: state.step,
    };
}
