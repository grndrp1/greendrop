/**
 * Public Booking Widget
 *
 * Self-contained React component for unauthenticated appointment booking.
 * Designed to be embedded on public websites (marketing site, landing pages).
 *
 * Features:
 * - 6-step wizard flow: email → customer → shop → time → review → confirmation
 * - Returns vs new customer detection
 * - Session persistence (survives page refresh)
 * - Rate limiting feedback
 * - Honeypot spam protection
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Mail,
    User,
    MapPin,
    Clock,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    Loader2,
    AlertCircle,
    Car,
    Phone,
    UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SHOP_NAMES } from '@/types/vehicle';
import { ShopSelector } from '@/components/entities/appointments/ShopSelector';
import { DateSlotPicker } from '@/components/entities/appointments/DateSlotPicker';
import type { TimeSlot } from '@/types/appointment';
import type {
    PublicBookingWidgetProps,
    BookingStep,
    StepInfo,
    VehicleInfo,
    CustomerVehicle,
} from './types';
import { useBookingSession, createDraft } from './useBookingSession';
import {
    checkEmail,
    verifyPhone,
    getAvailableSlots,
    createAppointment,
} from './api';

// ============================================================================
// Constants
// ============================================================================

const STEPS: StepInfo[] = [
    { id: 'email', title: 'Email' },
    { id: 'customer', title: 'Info' },
    { id: 'shop', title: 'Location' },
    { id: 'time', title: 'Time' },
    { id: 'review', title: 'Review' },
    { id: 'confirmation', title: 'Done' },
];

const STEP_ICONS: Record<BookingStep, React.ComponentType<{ className?: string }>> = {
    email: Mail,
    customer: User,
    shop: MapPin,
    time: Clock,
    review: CheckCircle,
    confirmation: CheckCircle,
};

// ============================================================================
// Main Component
// ============================================================================

export function PublicBookingWidget({
    shopId: preselectedShopId,
    serviceType: preselectedServiceType = 'oil_change',
    accentColor,
    onComplete,
    onError,
    showSignupPrompt = true,
}: PublicBookingWidgetProps) {
    // ========================================
    // Step State
    // ========================================
    const [step, setStep] = useState<BookingStep>('email');

    // ========================================
    // Form State
    // ========================================
    const [email, setEmail] = useState('');
    const [honeypot, setHoneypot] = useState(''); // Must stay empty
    const [isReturningCustomer, setIsReturningCustomer] = useState<boolean | null>(null);
    const [phoneLastFour, setPhoneLastFour] = useState('');
    const [customerVehicles, setCustomerVehicles] = useState<CustomerVehicle[]>([]);

    // New customer fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);

    // Vehicle selection (returning customer)
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(false);

    // Appointment details
    const [selectedShopId, setSelectedShopId] = useState<number | null>(
        preselectedShopId ?? null
    );
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [serviceType, setServiceType] = useState<'oil_change' | 'other'>(
        preselectedServiceType
    );
    const [notes, setNotes] = useState('');

    // ========================================
    // API State
    // ========================================
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [slotsByDate, setSlotsByDate] = useState<
        Record<string, TimeSlot[]> | undefined
    >(undefined);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // ========================================
    // Result State
    // ========================================
    const [result, setResult] = useState<{
        appointmentId: string;
        scheduledStart: string;
        shopName: string;
        signupToken?: string;
    } | null>(null);

    // ========================================
    // Session Persistence
    // ========================================
    const session = useBookingSession();

    // Load draft on mount
    useEffect(() => {
        const draft = session.load();
        if (draft && draft.email) {
            setEmail(draft.email);
            setIsReturningCustomer(draft.isReturningCustomer);
            setPhoneLastFour(draft.phoneLastFour);
            setFirstName(draft.firstName);
            setLastName(draft.lastName);
            setPhone(draft.phone);
            setVehicle(draft.vehicle);
            setSelectedVehicleId(draft.selectedVehicleId);
            setSelectedShopId(draft.selectedShopId ?? preselectedShopId ?? null);
            setSelectedSlot(draft.selectedSlot);
            setServiceType(draft.serviceType);
            setNotes(draft.notes);
            // Don't restore step - let user start from current step
            // They may need to re-verify or slots may have changed
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Save draft on changes (debounced via step changes)
    useEffect(() => {
        if (step !== 'confirmation' && email) {
            session.save(
                createDraft({
                    email,
                    isReturningCustomer,
                    phoneLastFour,
                    firstName,
                    lastName,
                    phone,
                    vehicle,
                    selectedVehicleId,
                    selectedShopId,
                    selectedSlot,
                    serviceType,
                    notes,
                    step,
                })
            );
        }
    }, [step, email, selectedShopId, selectedSlot]); // eslint-disable-line react-hooks/exhaustive-deps

    // ========================================
    // Slot Loading
    // ========================================
    useEffect(() => {
        if (!selectedShopId || step !== 'time') return;

        const loadSlots = async () => {
            setSlotsLoading(true);
            setError(null);

            const today = new Date();
            const sixWeeksLater = new Date(today);
            sixWeeksLater.setDate(today.getDate() + 42);

            const { slotsByDate: slots, error: slotsError } = await getAvailableSlots(
                selectedShopId,
                today.toISOString().split('T')[0],
                sixWeeksLater.toISOString().split('T')[0],
                serviceType
            );

            if (slotsError) {
                setError(slotsError);
            } else {
                setSlotsByDate(slots as Record<string, TimeSlot[]>);
            }

            setSlotsLoading(false);
        };

        loadSlots();
    }, [selectedShopId, step, serviceType]);

    // ========================================
    // Theming
    // ========================================
    const widgetStyle = useMemo(() => {
        if (!accentColor) return {};
        return {
            '--booking-accent': accentColor,
            '--booking-accent-light': `${accentColor}20`,
        } as React.CSSProperties;
    }, [accentColor]);

    // ========================================
    // Validation
    // ========================================
    const isEmailValid = useMemo(() => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }, [email]);

    const isPhoneValid = useMemo(() => {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 10;
    }, [phone]);

    const isVehicleValid = useMemo(() => {
        if (selectedVehicleId) return true;
        if (!vehicle) return false;
        return (
            vehicle.year >= 1900 &&
            vehicle.year <= new Date().getFullYear() + 1 &&
            vehicle.make.trim().length > 0 &&
            vehicle.model.trim().length > 0
        );
    }, [selectedVehicleId, vehicle]);

    const canProceed = useCallback((): boolean => {
        switch (step) {
            case 'email':
                return isEmailValid && honeypot === '';
            case 'customer':
                if (isReturningCustomer) {
                    // Returning customer: need phone verified + vehicle selected
                    return phoneLastFour.length === 4 && (selectedVehicleId !== null || isVehicleValid);
                }
                // New customer: need all fields
                return (
                    firstName.trim().length > 0 &&
                    lastName.trim().length > 0 &&
                    isPhoneValid &&
                    isVehicleValid
                );
            case 'shop':
                return selectedShopId !== null;
            case 'time':
                return selectedSlot !== null;
            case 'review':
                return true; // Review is always valid
            case 'confirmation':
                return false; // No "next" from confirmation
            default:
                return false;
        }
    }, [
        step,
        isEmailValid,
        honeypot,
        isReturningCustomer,
        phoneLastFour,
        selectedVehicleId,
        isVehicleValid,
        firstName,
        lastName,
        isPhoneValid,
        selectedShopId,
        selectedSlot,
    ]);

    // ========================================
    // Navigation
    // ========================================
    const handleNext = async () => {
        setError(null);
        setIsLoading(true);

        try {
            switch (step) {
                case 'email': {
                    const result = await checkEmail(email, honeypot);
                    if (result.error) {
                        setError(result.error);
                        if (result.errorCode === 'RATE_LIMITED') {
                            onError?.({
                                success: false,
                                error: result.error,
                                errorCode: result.errorCode,
                            });
                        }
                        break;
                    }
                    setIsReturningCustomer(result.isReturningCustomer);
                    setCustomerVehicles(result.vehicles);
                    setStep('customer');
                    break;
                }

                case 'customer': {
                    if (isReturningCustomer && phoneLastFour.length === 4) {
                        // Verify phone for returning customer
                        const verifyResult = await verifyPhone(email, phoneLastFour);
                        if (verifyResult.error) {
                            setError(verifyResult.error);
                            break;
                        }
                        if (verifyResult.vehicles.length > 0) {
                            setCustomerVehicles(verifyResult.vehicles);
                        }
                    }
                    // Skip shop step if pre-selected
                    if (preselectedShopId) {
                        setStep('time');
                    } else {
                        setStep('shop');
                    }
                    break;
                }

                case 'shop':
                    setStep('time');
                    break;

                case 'time':
                    setStep('review');
                    break;

                case 'review': {
                    // Submit the appointment
                    const submitResult = await createAppointment({
                        email,
                        phoneLastFour: isReturningCustomer ? phoneLastFour : undefined,
                        vehicleId: selectedVehicleId || undefined,
                        firstName: !isReturningCustomer ? firstName : undefined,
                        lastName: !isReturningCustomer ? lastName : undefined,
                        phone: !isReturningCustomer ? phone : undefined,
                        vehicle: !selectedVehicleId && vehicle ? vehicle : undefined,
                        shopId: selectedShopId!,
                        scheduledStart: selectedSlot!.start,
                        serviceBucket: serviceType,
                        notes: notes || undefined,
                    });

                    if (!submitResult.success) {
                        setError(submitResult.error || 'Failed to book appointment');
                        onError?.({
                            success: false,
                            error: submitResult.error || 'Failed to book appointment',
                            errorCode: submitResult.errorCode || 'INTERNAL_ERROR',
                        });
                        break;
                    }

                    setResult({
                        appointmentId: submitResult.appointmentId!,
                        scheduledStart: submitResult.scheduledStart!,
                        shopName: submitResult.shopName!,
                        signupToken: submitResult.signupToken,
                    });

                    session.clear();
                    setStep('confirmation');

                    onComplete?.({
                        success: true,
                        appointmentId: submitResult.appointmentId!,
                        scheduledStart: submitResult.scheduledStart!,
                        shopName: submitResult.shopName!,
                        signupToken: submitResult.signupToken,
                    });
                    break;
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setError(null);
        const stepIndex = STEPS.findIndex((s) => s.id === step);

        if (step === 'time' && preselectedShopId) {
            // Skip shop step when going back if it was pre-selected
            setStep('customer');
        } else if (stepIndex > 0) {
            setStep(STEPS[stepIndex - 1].id);
        }
    };

    // ========================================
    // Vehicle Form Handlers
    // ========================================
    const handleVehicleChange = (field: keyof VehicleInfo, value: string | number) => {
        setVehicle((prev) => ({
            year: prev?.year ?? new Date().getFullYear(),
            make: prev?.make ?? '',
            model: prev?.model ?? '',
            ...prev,
            [field]: value,
        }));
    };

    // ========================================
    // Step Rendering
    // ========================================
    const renderEmailStep = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Book Your Appointment
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                    Enter your email to get started. If you've visited before, we'll find your account.
                </p>
            </div>

            <div>
                <label
                    htmlFor="booking-email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Email Address
                </label>
                <input
                    id="booking-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    autoComplete="email"
                    autoFocus
                />
            </div>

            {/* Honeypot field - hidden from users */}
            <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
            />
        </div>
    );

    const renderCustomerStep = () => (
        <div className="space-y-4">
            {isReturningCustomer ? (
                // Returning Customer Flow
                <>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Welcome Back!
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Please verify your phone number to continue.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="phone-verify"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Last 4 digits of your phone number
                        </label>
                        <input
                            id="phone-verify"
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={phoneLastFour}
                            onChange={(e) =>
                                setPhoneLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))
                            }
                            placeholder="1234"
                            className="w-32 rounded-lg border border-gray-300 px-4 py-3 text-center text-lg font-mono tracking-widest focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {phoneLastFour.length === 4 && customerVehicles.length > 0 && (
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Select a Vehicle
                            </label>
                            <div className="space-y-2">
                                {customerVehicles.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedVehicleId(v.id);
                                            setIsAddingNewVehicle(false);
                                        }}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                                            selectedVehicleId === v.id
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        )}
                                    >
                                        <Car className="h-5 w-5 text-gray-400" />
                                        <span className="font-medium text-gray-900">
                                            {v.year} {v.make} {v.model}
                                        </span>
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedVehicleId(null);
                                        setIsAddingNewVehicle(true);
                                    }}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg border-2 border-dashed p-3 text-left transition-all',
                                        isAddingNewVehicle
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    )}
                                >
                                    <Car className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-600">Add a different vehicle</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {isAddingNewVehicle && renderVehicleForm()}
                </>
            ) : (
                // New Customer Flow
                <>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Tell Us About Yourself
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            We'll use this to create your account and keep you updated.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="first-name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                First Name
                            </label>
                            <input
                                id="first-name"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                autoComplete="given-name"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="last-name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Last Name
                            </label>
                            <input
                                id="last-name"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(503) 555-1234"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            autoComplete="tel"
                        />
                    </div>

                    {renderVehicleForm()}
                </>
            )}
        </div>
    );

    const renderVehicleForm = () => (
        <div className="space-y-4">
            <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900">Vehicle Information</h4>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <label
                        htmlFor="vehicle-year"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Year
                    </label>
                    <input
                        id="vehicle-year"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={vehicle?.year || ''}
                        onChange={(e) =>
                            handleVehicleChange('year', parseInt(e.target.value) || 0)
                        }
                        placeholder="2020"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label
                        htmlFor="vehicle-make"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Make
                    </label>
                    <input
                        id="vehicle-make"
                        type="text"
                        value={vehicle?.make || ''}
                        onChange={(e) => handleVehicleChange('make', e.target.value)}
                        placeholder="Toyota"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label
                        htmlFor="vehicle-model"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Model
                    </label>
                    <input
                        id="vehicle-model"
                        type="text"
                        value={vehicle?.model || ''}
                        onChange={(e) => handleVehicleChange('model', e.target.value)}
                        placeholder="Camry"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );

    const renderShopStep = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Choose a Location</h3>
                <p className="mt-1 text-sm text-gray-600">
                    Select the Green Drop Garage that works best for you.
                </p>
            </div>
            <ShopSelector
                selectedShopId={selectedShopId}
                onSelect={setSelectedShopId}
                homeShopId={undefined}
            />
        </div>
    );

    const renderTimeStep = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Pick a Time</h3>
                <p className="mt-1 text-sm text-gray-600">
                    Select a date and time for your appointment at{' '}
                    {selectedShopId ? SHOP_NAMES[selectedShopId] : 'the shop'}.
                </p>
            </div>
            <DateSlotPicker
                slotsByDate={slotsByDate}
                isLoading={slotsLoading}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
            />
        </div>
    );

    const renderReviewStep = () => {
        const vehicleDisplay =
            selectedVehicleId && customerVehicles.length > 0
                ? customerVehicles.find((v) => v.id === selectedVehicleId)
                : vehicle;

        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Review Your Appointment
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        Make sure everything looks good before confirming.
                    </p>
                </div>

                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{email}</p>
                        </div>
                    </div>

                    {!isReturningCustomer && (
                        <>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">
                                        {firstName} {lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{phone}</p>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Vehicle</p>
                            <p className="font-medium text-gray-900">
                                {vehicleDisplay
                                    ? `${vehicleDisplay.year} ${vehicleDisplay.make} ${vehicleDisplay.model}`
                                    : 'Not selected'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium text-gray-900">
                                {selectedShopId ? SHOP_NAMES[selectedShopId] : 'Not selected'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Date & Time</p>
                            <p className="font-medium text-gray-900">
                                {selectedSlot ? (
                                    <>
                                        {new Date(selectedSlot.start).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                        {' at '}
                                        {new Date(selectedSlot.start).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true,
                                        })}
                                    </>
                                ) : (
                                    'Not selected'
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="notes"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Notes (optional)
                    </label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requests or notes for the service team..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        rows={3}
                    />
                </div>
            </div>
        );
    };

    const renderConfirmationStep = () => (
        <div className="space-y-6 text-center">
            <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-900">
                    Appointment Confirmed!
                </h3>
                <p className="mt-2 text-gray-600">
                    We'll see you at{' '}
                    <span className="font-medium">{result?.shopName}</span> on{' '}
                    <span className="font-medium">
                        {result?.scheduledStart &&
                            new Date(result.scheduledStart).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}
                    </span>{' '}
                    at{' '}
                    <span className="font-medium">
                        {result?.scheduledStart &&
                            new Date(result.scheduledStart).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })}
                    </span>
                    .
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
                <p className="text-sm text-gray-600">
                    A confirmation email has been sent to{' '}
                    <span className="font-medium text-gray-900">{email}</span>.
                </p>
            </div>

            {showSignupPrompt && result?.signupToken && (
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                        <UserPlus className="h-6 w-6 flex-shrink-0 text-green-600" />
                        <div className="text-left">
                            <h4 className="font-medium text-green-900">
                                Create Your Account
                            </h4>
                            <p className="mt-1 text-sm text-green-700">
                                Set up your Green Drop Garage account to view service history,
                                manage appointments, and access exclusive member benefits.
                            </p>
                            <a
                                href={`/signup?token=${result.signupToken}`}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                            >
                                Create Account
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 'email':
                return renderEmailStep();
            case 'customer':
                return renderCustomerStep();
            case 'shop':
                return renderShopStep();
            case 'time':
                return renderTimeStep();
            case 'review':
                return renderReviewStep();
            case 'confirmation':
                return renderConfirmationStep();
            default:
                return null;
        }
    };

    // ========================================
    // Render
    // ========================================
    const currentStepIndex = STEPS.findIndex((s) => s.id === step);
    const showNavigation = step !== 'confirmation';
    const showBackButton = currentStepIndex > 0 && step !== 'confirmation';

    return (
        <div
            className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white shadow-sm"
            style={widgetStyle}
        >
            {/* Progress Steps */}
            {step !== 'confirmation' && (
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-center">
                        {STEPS.slice(0, -1).map((stepInfo, index) => {
                            const isActive = stepInfo.id === step;
                            const isPast = currentStepIndex > index;
                            const Icon = STEP_ICONS[stepInfo.id];

                            return (
                                <div key={stepInfo.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                                                isPast
                                                    ? 'border-green-600 bg-green-600 text-white'
                                                    : isActive
                                                      ? 'border-green-600 bg-green-50 text-green-600'
                                                      : 'border-gray-300 text-gray-400'
                                            )}
                                            style={
                                                (isPast || isActive) && accentColor
                                                    ? {
                                                          borderColor: accentColor,
                                                          backgroundColor: isPast
                                                              ? accentColor
                                                              : `${accentColor}10`,
                                                          color: isPast ? 'white' : accentColor,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span
                                            className={cn(
                                                'mt-1 hidden text-xs font-medium sm:block',
                                                isActive ? 'text-green-600' : 'text-gray-500'
                                            )}
                                            style={
                                                isActive && accentColor
                                                    ? { color: accentColor }
                                                    : undefined
                                            }
                                        >
                                            {stepInfo.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 2 && (
                                        <div
                                            className={cn(
                                                'mx-1 h-0.5 w-4 transition-colors sm:mx-2 sm:w-6',
                                                isPast ? 'bg-green-600' : 'bg-gray-300'
                                            )}
                                            style={
                                                isPast && accentColor
                                                    ? { backgroundColor: accentColor }
                                                    : undefined
                                            }
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Step Content */}
            <div className="px-6 py-6">
                <div className="min-h-[300px]">{renderStepContent()}</div>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            {showNavigation && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={!showBackButton || isLoading}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                            showBackButton && !isLoading
                                ? 'text-gray-600 hover:bg-gray-100'
                                : 'invisible'
                        )}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceed() || isLoading}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-colors',
                            canProceed() && !isLoading
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'cursor-not-allowed bg-gray-200 text-gray-400'
                        )}
                        style={
                            canProceed() && !isLoading && accentColor
                                ? { backgroundColor: accentColor }
                                : undefined
                        }
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {step === 'review' ? 'Booking...' : 'Loading...'}
                            </>
                        ) : step === 'review' ? (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Confirm Appointment
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
