export interface Vehicle {
    id: string;
    year: number | null;
    make: string | null;
    model: string | null;
    plate: string | null;
    created_at: string | null;
    vin: string | null;
    updated_at: string | null;
    shopware_vehicle_id: number | null;
    detail: string | null;
    fleet_number: string | null;
    engine: string | null;
    color: string | null;
    shopware_customer_id: number | null;
    tekmetric_vehicle_id: number | null;
    active_source?: 'shopware' | 'tekmetric' | null;
    archived: boolean | null;
    archived_at: string | null;
}

// Aggregated vehicle type for multi-shop vehicle support
export interface AggregatedVehicle extends Vehicle {
    // Additional fields from get_user_vehicles_aggregated()
    mileage: number | null;
    relationship: string;
    is_primary: boolean;

    // Aggregation metadata
    vehicle_record_ids: string[];    // All vehicle UUIDs for this VIN
    shop_ids: number[];              // Which shops have serviced this vehicle
    shop_count: number;              // Number of shops (for badge)
    total_repair_orders: number;     // Combined RO count from all shops
    has_active_subscription: boolean;
    subscription_vehicle_id: string | null;

    // Subscription details (from get_user_vehicles_aggregated_v2)
    subscription_status: string | null;
    subscription_current_period_end: string | null;
    stripe_product_id: string | null;
    stripe_product_name: string | null;
}

// Helper constant for shop names
export const SHOP_NAMES: Record<number, string> = {
    1: 'Moreland',
    2: 'Central',
    3: 'Uptown',
    4: 'MLK',
    5: 'Vancouver',
    6: 'St Johns'
};
