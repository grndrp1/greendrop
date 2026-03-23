#!/usr/bin/env python3
"""
Post-processes the enriched NDJSON files:
- Cleans up messy titles (removes JS-injected footer text)
- Hardcodes known location addresses (JS-rendered on live site)
- Re-exports clean versions ready for Sanity import
"""

import json, re

BASE = "/Users/nikmanning/Projects/greendrop"

# Known location data (sourced from live site + Google Maps)
LOCATION_DATA = {
    "central": {
        "title": "Green Drop Garage – Central Portland",
        "phone": "(503) 233-6500",
        "address": {"street": "4260 SE Belmont St", "city": "Portland", "state": "OR", "zip": "97215"},
        "hours": [
            {"day": "Monday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Tuesday",   "open": "7:30am", "close": "6:00pm"},
            {"day": "Wednesday", "open": "7:30am", "close": "6:00pm"},
            {"day": "Thursday",  "open": "7:30am", "close": "6:00pm"},
            {"day": "Friday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Saturday",  "open": "8:00am", "close": "5:00pm"},
            {"day": "Sunday",    "open": "closed", "close": "closed", "closed": True},
        ],
        "seoTitle": "Green Drop Garage Central Portland | Eco-Friendly Auto Repair",
        "seoDescription": "Eco-friendly auto repair on SE Belmont in Portland, OR. Oil changes, brakes, tires & more. ASE-certified technicians.",
    },
    "mlk": {
        "title": "Green Drop Garage – MLK Portland",
        "phone": "(503) 841-6309",
        "address": {"street": "4235 NE Martin Luther King Jr Blvd", "city": "Portland", "state": "OR", "zip": "97212"},
        "hours": [
            {"day": "Monday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Tuesday",   "open": "7:30am", "close": "6:00pm"},
            {"day": "Wednesday", "open": "7:30am", "close": "6:00pm"},
            {"day": "Thursday",  "open": "7:30am", "close": "6:00pm"},
            {"day": "Friday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Saturday",  "open": "8:00am", "close": "5:00pm"},
            {"day": "Sunday",    "open": "closed", "close": "closed", "closed": True},
        ],
        "seoTitle": "Green Drop Garage MLK Portland | Auto Repair NE Portland",
        "seoDescription": "ASE-certified auto repair on NE MLK Blvd in Portland, OR. Oil changes, brakes, tires, diagnostics & more.",
    },
    "moreland": {
        "title": "Green Drop Garage – Moreland Portland",
        "phone": "(503) 954-2795",
        "address": {"street": "7229 SE Milwaukie Ave", "city": "Portland", "state": "OR", "zip": "97202"},
        "hours": [
            {"day": "Monday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Tuesday",   "open": "7:30am", "close": "6:00pm"},
            {"day": "Wednesday", "open": "7:30am", "close": "6:00pm"},
            {"day": "Thursday",  "open": "7:30am", "close": "6:00pm"},
            {"day": "Friday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Saturday",  "open": "8:00am", "close": "5:00pm"},
            {"day": "Sunday",    "open": "closed", "close": "closed", "closed": True},
        ],
        "seoTitle": "Green Drop Garage Moreland | SE Portland Auto Repair",
        "seoDescription": "Eco-friendly auto repair in SE Portland's Moreland neighborhood. Oil changes, brakes, tires & more at SE Milwaukie Ave.",
    },
    "st-johns": {
        "title": "Green Drop Garage – St. Johns Portland",
        "phone": "(503) 719-6546",
        "address": {"street": "8732 N Lombard St", "city": "Portland", "state": "OR", "zip": "97203"},
        "hours": [
            {"day": "Monday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Tuesday",   "open": "7:30am", "close": "6:00pm"},
            {"day": "Wednesday", "open": "7:30am", "close": "6:00pm"},
            {"day": "Thursday",  "open": "7:30am", "close": "6:00pm"},
            {"day": "Friday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Saturday",  "open": "8:00am", "close": "5:00pm"},
            {"day": "Sunday",    "open": "closed", "close": "closed", "closed": True},
        ],
        "seoTitle": "Green Drop Garage St. Johns Portland | N Portland Auto Repair",
        "seoDescription": "Trusted auto repair in the St. Johns neighborhood of North Portland. Oil changes, brakes, tires & more on N Lombard St.",
    },
    "uptown": {
        "title": "Green Drop Garage – Uptown Portland",
        "phone": "(503) 227-2753",
        "address": {"street": "2038 W Burnside St", "city": "Portland", "state": "OR", "zip": "97209"},
        "hours": [
            {"day": "Monday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Tuesday",   "open": "7:30am", "close": "6:00pm"},
            {"day": "Wednesday", "open": "7:30am", "close": "6:00pm"},
            {"day": "Thursday",  "open": "7:30am", "close": "6:00pm"},
            {"day": "Friday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Saturday",  "open": "8:00am", "close": "5:00pm"},
            {"day": "Sunday",    "open": "closed", "close": "closed", "closed": True},
        ],
        "seoTitle": "Green Drop Garage Uptown Portland | NW Portland Auto Repair",
        "seoDescription": "Eco-friendly auto repair in Uptown/NW Portland on W Burnside. Oil changes, brakes, tires, and more from ASE-certified techs.",
    },
    "vancouver": {
        "title": "Green Drop Garage – Vancouver WA",
        "phone": "(360) 546-3686",
        "address": {"street": "7800 NE Hwy 99", "city": "Vancouver", "state": "WA", "zip": "98665"},
        "hours": [
            {"day": "Monday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Tuesday",   "open": "7:30am", "close": "6:00pm"},
            {"day": "Wednesday", "open": "7:30am", "close": "6:00pm"},
            {"day": "Thursday",  "open": "7:30am", "close": "6:00pm"},
            {"day": "Friday",    "open": "7:30am", "close": "6:00pm"},
            {"day": "Saturday",  "open": "8:00am", "close": "5:00pm"},
            {"day": "Sunday",    "open": "closed", "close": "closed", "closed": True},
        ],
        "seoTitle": "Green Drop Garage Vancouver WA | Eco-Friendly Auto Repair",
        "seoDescription": "Eco-friendly auto repair in Vancouver, WA on NE Hwy 99. Oil changes, brakes, tires & more. ASE-certified technicians.",
    },
}


def clean_title(raw):
    """Remove JS-injected footer text that got appended to titles."""
    if not raw:
        return raw
    # Strip everything from first newline or " | ... Oil Change Service" noise
    t = raw.split("\n")[0].strip()
    # Remove trailing pipe sections with "Oil Change Service"
    t = re.sub(r'\s*\|\s*.*Oil Change Service.*', '', t, flags=re.IGNORECASE)
    return t.strip()


def clean_seo_title(raw):
    """Keep full title tag but remove the JS-injected newline noise at end."""
    if not raw:
        return raw
    return raw.split("\n")[0].strip()


def load_ndjson(path):
    docs = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                docs.append(json.loads(line))
    return docs


def save_ndjson(docs, path):
    with open(path, "w") as f:
        for doc in docs:
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")
    print(f"  ✓ Saved {len(docs)} docs → {path}")


# ── Locations ─────────────────────────────────────────────────────────────────
print("🟢 Cleaning LOCATIONS …")
locs = load_ndjson(f"{BASE}/sanity_locations_enriched.ndjson")
for doc in locs:
    slug = doc["slug"]["current"]
    known = LOCATION_DATA.get(slug, {})
    if known:
        doc.update(known)
    else:
        doc["title"] = clean_title(doc.get("title", ""))
        if "seoTitle" in doc:
            doc["seoTitle"] = clean_seo_title(doc["seoTitle"])
    print(f"  {slug}: {doc['title']} | {doc.get('phone','—')} | {doc.get('address',{}).get('street','—')}")
save_ndjson(locs, f"{BASE}/sanity_locations_enriched.ndjson")

# ── Services ──────────────────────────────────────────────────────────────────
print("\n🟢 Cleaning SERVICES …")
svcs = load_ndjson(f"{BASE}/sanity_services_enriched.ndjson")
for doc in svcs:
    doc["title"] = clean_title(doc.get("title", ""))
    if "seoTitle" in doc:
        doc["seoTitle"] = clean_seo_title(doc["seoTitle"])
    print(f"  {doc['_id']}: {doc['title']}")
save_ndjson(svcs, f"{BASE}/sanity_services_enriched.ndjson")

# ── Service×Locations ─────────────────────────────────────────────────────────
print("\n🟢 Cleaning SERVICE×LOCATIONS …")
sls = load_ndjson(f"{BASE}/sanity_service_locations_enriched.ndjson")
for doc in sls:
    if "seoTitle" in doc:
        doc["seoTitle"] = clean_seo_title(doc["seoTitle"])
    if "headline" in doc:
        doc["headline"] = clean_title(doc["headline"])
save_ndjson(sls, f"{BASE}/sanity_service_locations_enriched.ndjson")

# ── Pages ─────────────────────────────────────────────────────────────────────
print("\n🟢 Cleaning PAGES …")
pages = load_ndjson(f"{BASE}/sanity_pages_enriched.ndjson")
for doc in pages:
    doc["title"] = clean_title(doc.get("title", ""))
    if "seoTitle" in doc:
        doc["seoTitle"] = clean_seo_title(doc["seoTitle"])
save_ndjson(pages, f"{BASE}/sanity_pages_enriched.ndjson")

print("\n✅ All files cleaned and ready to import!")
