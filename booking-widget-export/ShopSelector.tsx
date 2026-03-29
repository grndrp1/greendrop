import { MapPin, Check, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SHOP_NAMES } from '@/types/vehicle';

interface Shop {
    id: number;
    name: string;
    address: string;
    city: string;
    phone: string;
}

interface ShopSelectorProps {
    selectedShopId: number | null;
    onSelect: (shopId: number) => void;
    homeShopId?: number | null;
}

// Shop addresses - matches SHOP_NAMES from vehicle.ts
const SHOP_ADDRESSES: Record<number, { address: string; city: string; phone: string }> = {
    1: { address: '5321 SE 28th Ave', city: 'Portland, OR 97202', phone: '(503) 567-8344' },       // Moreland
    2: { address: '1417 SE 9th Ave', city: 'Portland, OR 97214', phone: '(503) 236-7767' },        // Central
    3: { address: '50 NW 20th Ave, Suite A', city: 'Portland, OR 97209', phone: '(503) 867-8087' }, // Uptown
    4: { address: '3007 NE MLK Jr Blvd', city: 'Portland, OR 97212', phone: '(503) 867-8119' },     // MLK
    5: { address: '3800 Main St', city: 'Vancouver, WA 98663', phone: '(360) 360-3007' },          // Vancouver
    6: { address: '8950 N Lombard St', city: 'Portland, OR 97203', phone: '(503) 487-8487' },      // St Johns
};

// Static shop data - all 6 shops with addresses
const SHOPS: Shop[] = Object.entries(SHOP_NAMES).map(([id, name]) => ({
    id: Number(id),
    name,
    address: SHOP_ADDRESSES[Number(id)]?.address || '',
    city: SHOP_ADDRESSES[Number(id)]?.city || 'Portland, OR',
    phone: SHOP_ADDRESSES[Number(id)]?.phone || '',
}));

export function ShopSelector({
    selectedShopId,
    onSelect,
    homeShopId,
}: ShopSelectorProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SHOPS.map((shop) => {
                const isSelected = selectedShopId === shop.id;
                const isHomeShop = homeShopId === shop.id;

                return (
                    <button
                        key={shop.id}
                        type="button"
                        onClick={() => onSelect(shop.id)}
                        className={cn(
                            'relative flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
                            isSelected
                                ? 'border-green-600 bg-green-50 ring-2 ring-green-600 ring-offset-2'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full',
                                isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                            )}
                        >
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{shop.name}</p>
                                {isHomeShop && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                        <Home className="h-3 w-3" />
                                        Home
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{shop.address}</p>
                            <p className="text-xs text-gray-400">{shop.city}</p>
                        </div>
                        {isSelected && (
                            <div className="absolute right-3 top-3">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
