# Green Drop Garage - Public Booking Widget

A self-contained React component for unauthenticated appointment booking.

## Files Overview

```
booking-widget/
├── PublicBookingWidget.tsx   # Main component
├── types.ts                  # TypeScript types
├── useBookingSession.ts      # Session storage hook
├── api.ts                    # Public API helpers
└── index.ts                  # Barrel export

# Dependencies (also included)
ShopSelector.tsx              # Shop selection grid
DateSlotPicker.tsx            # Calendar/time picker
appointment.ts                # Appointment types
vehicle.ts                    # Vehicle types + SHOP_NAMES
utils.ts                      # cn() utility (tailwind-merge)
```

## Installation

### 1. Copy files into your project

```
src/
├── components/
│   ├── booking-widget/       # Copy booking-widget folder here
│   ├── ShopSelector.tsx      # Copy this
│   └── DateSlotPicker.tsx    # Copy this
├── lib/
│   └── utils.ts              # Copy or merge with existing
└── types/
    ├── appointment.ts        # Copy this
    └── vehicle.ts            # Copy this
```

### 2. Install dependencies

```bash
npm install lucide-react clsx tailwind-merge
```

### 3. Update import paths

The files use `@/` path aliases. Update these to match your project:

```tsx
// In booking-widget files, update:
import { cn } from '@/lib/utils';
import { SHOP_NAMES } from '@/types/vehicle';
import { ShopSelector } from '@/components/ShopSelector';
import { DateSlotPicker } from '@/components/DateSlotPicker';
import type { TimeSlot } from '@/types/appointment';
```

### 4. Configure environment variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dglrzbvrqczhzvqyprok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Then update `api.ts` to use Next.js env vars:

```tsx
// Change from:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// To:
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

## Usage

```tsx
import { PublicBookingWidget } from '@/components/booking-widget';

export default function BookingPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <PublicBookingWidget />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `shopId` | `number` | - | Pre-select shop (skips shop step) |
| `serviceType` | `'oil_change' \| 'other'` | `'oil_change'` | Default service type |
| `accentColor` | `string` | `green-600` | Brand color (CSS value) |
| `onComplete` | `(result) => void` | - | Callback on successful booking |
| `onError` | `(error) => void` | - | Callback on error |
| `showSignupPrompt` | `boolean` | `true` | Show account creation CTA |

### Examples

```tsx
// Pre-select a shop location
<PublicBookingWidget shopId={1} />

// Custom branding + callbacks
<PublicBookingWidget
  accentColor="#4F46E5"
  onComplete={(result) => {
    // result.appointmentId, result.scheduledStart, result.shopName
    router.push(`/confirmation?id=${result.appointmentId}`);
  }}
  onError={(error) => {
    toast.error(error.error);
  }}
/>

// Embed on a specific shop's page
<PublicBookingWidget
  shopId={3}
  showSignupPrompt={false}
/>
```

## API Endpoints Used

The widget calls these Supabase Edge Functions:

| Function | Purpose |
|----------|---------|
| `create-appointment-public` | Email check, phone verify, create booking |
| `get-available-slots` | Fetch available time slots |

Both endpoints are public (no auth required) but rate-limited.

## Styling

The component uses Tailwind CSS. Ensure your Tailwind config includes the component files:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/components/booking-widget/**/*.{ts,tsx}',
    // ... other paths
  ],
}
```

## Shop IDs Reference

```
1: Moreland
2: Central
3: Uptown
4: MLK
5: Vancouver
6: St Johns
```
