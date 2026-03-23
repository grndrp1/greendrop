#!/usr/bin/env python3
"""
GreenDrop Garage — Antigravity Content Extraction Script
Crawls greendropgarage.com and enriches Sanity NDJSON files with:
  - title, meta description, H1, main content
  - For locations: address, phone, hours
  - For services: short description, body
  - For serviceLocations: seoTitle, seoDescription, legacyPath
"""

import json
import re
import time
import sys
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from html.parser import HTMLParser

BASE_URL = "https://www.greendropgarage.com"
DELAY = 1.0  # seconds between requests

# ── Location slugs → their "garage" page on the old site ──────────────────────
LOCATION_PAGES = {
    "central":   "/central-garage/",
    "mlk":       "/mlk-garage/",
    "moreland":  "/moreland-garage/",
    "st-johns":  "/st-johns-garage/",
    "uptown":    "/uptown-garage/",
    "vancouver": "/vancouver-garage/",
}

# ── Service slugs → their /services/{slug}/ page ──────────────────────────────
SERVICE_PAGES = {
    "ac-service":          "/services/ac-service/",
    "auto-repair":         "/services/engine-repairs/",   # closest match
    "brakes":              "/services/brakes/",
    "diagnostics":         "/services/engine-repairs/",
    "exhaust-systems":     "/services/exhaust-systems/",
    "oil-changes":         "/services/oil-changes/",
    "service-maintenance": "/services/service-maintenance/",
    "tires":               "/services/tires/",
    "transmissions":       "/services/transmissions/",
}

# ── Service×Location URL pattern on the old site ─────────────────────────────
# /location/{location}/{service-legacy}/
LEGACY_SERVICE_SLUGS = {
    "ac-service":          "maintenance",
    "auto-repair":         "auto-repair",
    "brakes":              "brakes",
    "diagnostics":         "diagnostics",
    "oil-changes":         "oil-change",
    "service-maintenance": "maintenance",
    "tires":               "maintenance",
    "transmissions":       "maintenance",
}


# ── Simple HTML scraper ───────────────────────────────────────────────────────

class PageData:
    def __init__(self):
        self.title = ""
        self.meta_description = ""
        self.h1 = ""
        self.paragraphs = []
        self.phone = ""
        self.address_lines = []
        self.hours = []
        self._in_h1 = False
        self._in_p = False
        self._current_p = []

class GreenDropParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.data = PageData()
        self._in_title = False
        self._in_h1 = False
        self._in_p = False
        self._current_text = []
        self._h1_done = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")
            if name == "description" or prop == "og:description":
                if not self.data.meta_description:
                    self.data.meta_description = content.strip()
        elif tag == "h1" and not self._h1_done:
            self._in_h1 = True
            self._current_text = []
        elif tag == "p":
            self._in_p = True
            self._current_text = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1" and self._in_h1:
            self._in_h1 = False
            self._h1_done = True
            self.data.h1 = " ".join(self._current_text).strip()
        elif tag == "p" and self._in_p:
            self._in_p = False
            text = " ".join(self._current_text).strip()
            if text:
                self.data.paragraphs.append(text)
            self._current_text = []

    def handle_data(self, data):
        if self._in_title:
            self.data.title += data
        elif self._in_h1:
            self._current_text.append(data.strip())
        elif self._in_p:
            self._current_text.append(data.strip())


def fetch(path, retries=3):
    url = BASE_URL + path
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": "Antigravity/1.0 (GreenDrop migration)"})
            with urlopen(req, timeout=15) as resp:
                raw = resp.read()
                # Try utf-8 first, fall back to latin-1
                try:
                    return raw.decode("utf-8")
                except UnicodeDecodeError:
                    return raw.decode("latin-1")
        except HTTPError as e:
            print(f"  HTTP {e.code} for {url}", file=sys.stderr)
            return None
        except URLError as e:
            print(f"  URLError for {url}: {e.reason}", file=sys.stderr)
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    return None


def parse(html):
    parser = GreenDropParser()
    parser.feed(html)
    d = parser.data
    d.title = d.title.strip()
    return d


def extract_phone(html):
    """Extract first phone-like pattern from raw HTML."""
    m = re.search(r'\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}', html)
    return m.group(0).strip() if m else ""


def extract_address(html):
    """
    Look for a street address near common address patterns.
    Returns a dict with street, city, state, zip when found.
    """
    # Pattern: number + street name + optional suite/unit
    street_m = re.search(
        r'(\d{3,5}\s+[A-Za-z0-9\s\.]+(?:St|Ave|Blvd|Dr|Rd|Way|NE|NW|SE|SW|N|S|E|W)[A-Za-z\s\.]*)',
        html
    )
    # Portland/Vancouver zip pattern
    city_m = re.search(r'(Portland|Vancouver),?\s*(OR|WA)\s*(\d{5})', html)
    result = {}
    if street_m:
        result["street"] = street_m.group(1).strip()
    if city_m:
        result["city"] = city_m.group(1)
        result["state"] = city_m.group(2)
        result["zip"] = city_m.group(3)
    return result


def extract_hours(html):
    """
    Pull day+time pairs from the page text.
    Returns a list of {day, open, close} dicts.
    """
    hours = []
    # Match patterns like "Monday: 7:30am – 6:00pm" or "Mon–Fri 7:30–6:00"
    pattern = re.compile(
        r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)'
        r'[\s\-–:]+(\d{1,2}(?::\d{2})?(?:am|pm)?)\s*[\-–to]+\s*(\d{1,2}(?::\d{2})?(?:am|pm)?)',
        re.IGNORECASE
    )
    seen = set()
    for m in pattern.finditer(html):
        day = m.group(1)
        if day not in seen:
            seen.add(day)
            hours.append({
                "day": day,
                "open": m.group(2),
                "close": m.group(3),
            })
    return hours


# ── NDJSON helpers ────────────────────────────────────────────────────────────

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


# ── Enrichment functions ──────────────────────────────────────────────────────

def enrich_location(doc):
    slug = doc["slug"]["current"]
    path = LOCATION_PAGES.get(slug)
    if not path:
        print(f"  ⚠ No page mapping for location '{slug}', skipping.")
        return doc

    print(f"  Fetching location '{slug}' from {path} …")
    html = fetch(path)
    if not html:
        return doc
    time.sleep(DELAY)

    page = parse(html)
    addr = extract_address(html)
    phone = extract_phone(html)
    hours = extract_hours(html)

    # Clean up title: strip trailing " | Green Drop Garage" etc.
    clean_title = re.sub(r'\s*[\|–-].*$', '', page.title).strip()

    doc["title"] = clean_title or doc["title"]
    if page.h1:
        doc["headline"] = page.h1
    if page.meta_description:
        doc["seoDescription"] = page.meta_description
        doc["seoTitle"] = page.title.strip()
    if page.paragraphs:
        doc["description"] = page.paragraphs[0]
    if phone:
        doc["phone"] = phone
    if addr:
        doc["address"] = addr
    if hours:
        doc["hours"] = hours

    return doc


def enrich_service(doc):
    slug = doc["slug"]["current"]
    path = SERVICE_PAGES.get(slug)
    if not path:
        print(f"  ⚠ No page mapping for service '{slug}', using /services/{slug}/")
        path = f"/services/{slug}/"

    print(f"  Fetching service '{slug}' from {path} …")
    html = fetch(path)
    if not html:
        return doc
    time.sleep(DELAY)

    page = parse(html)
    clean_title = re.sub(r'\s*[\|–-].*$', '', page.title).strip()

    doc["title"] = clean_title or doc["title"]
    if page.meta_description:
        doc["shortDescription"] = page.meta_description
        doc["seoDescription"] = page.meta_description
        doc["seoTitle"] = page.title.strip()
    if page.h1:
        doc["headline"] = page.h1
    if len(page.paragraphs) >= 2:
        doc["intro"] = page.paragraphs[0]

    return doc


def enrich_service_location(doc):
    # Determine service + location slugs from the _id
    # Format: serviceLocation--{service}--{location}
    parts = doc["_id"].replace("serviceLocation--", "").split("--")
    if len(parts) < 2:
        return doc
    service_slug = parts[0]
    location_slug = "--".join(parts[1:])

    # Build the legacy URL to fetch real content
    legacy_service = LEGACY_SERVICE_SLUGS.get(service_slug, service_slug)
    legacy_path = f"/location/{location_slug}/{legacy_service}/"

    print(f"  Fetching serviceLocation '{service_slug}×{location_slug}' from {legacy_path} …")
    html = fetch(legacy_path)
    if not html:
        # Try the canonical new path as fallback
        canonical = doc.get("canonicalPath", f"/services/{service_slug}/{location_slug}/")
        print(f"    → Trying canonical {canonical} …")
        html = fetch(canonical)
        if not html:
            return doc
    time.sleep(DELAY)

    page = parse(html)
    if page.meta_description:
        doc["seoDescription"] = page.meta_description
        doc["seoTitle"] = page.title.strip()
    if page.h1:
        doc["headline"] = page.h1
    if page.paragraphs:
        doc["intro"] = page.paragraphs[0]

    return doc


def enrich_page(doc):
    slug = doc["slug"]["current"]
    path = f"/{slug}/"

    print(f"  Fetching page '{slug}' from {path} …")
    html = fetch(path)
    if not html:
        return doc
    time.sleep(DELAY)

    page = parse(html)
    clean_title = re.sub(r'\s*[\|–-].*$', '', page.title).strip()

    doc["title"] = clean_title or doc["title"]
    if page.meta_description:
        doc["seoDescription"] = page.meta_description
        doc["seoTitle"] = page.title.strip()
    if page.h1:
        doc["headline"] = page.h1
    if page.paragraphs:
        doc["intro"] = page.paragraphs[0]

    return doc


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    base = "/Users/nikmanning/Projects/greendrop"

    print("\n🟢 Enriching LOCATIONS …")
    locations = load_ndjson(f"{base}/sanity_locations_fresh.ndjson")
    locations = [enrich_location(d) for d in locations]
    save_ndjson(locations, f"{base}/sanity_locations_enriched.ndjson")

    print("\n🟢 Enriching SERVICES …")
    services = load_ndjson(f"{base}/sanity_services_fresh.ndjson")
    services = [enrich_service(d) for d in services]
    save_ndjson(services, f"{base}/sanity_services_enriched.ndjson")

    print("\n🟢 Enriching SERVICE×LOCATIONS …")
    sls = load_ndjson(f"{base}/sanity_service_locations_fresh.ndjson")
    sls = [enrich_service_location(d) for d in sls]
    save_ndjson(sls, f"{base}/sanity_service_locations_enriched.ndjson")

    print("\n🟢 Enriching PAGES …")
    pages = load_ndjson(f"{base}/sanity_pages_fresh.ndjson")
    pages = [enrich_page(d) for d in pages]
    save_ndjson(pages, f"{base}/sanity_pages_enriched.ndjson")

    print("\n✅ Done! Re-import with:")
    print("  sanity dataset import sanity_locations_enriched.ndjson production")
    print("  sanity dataset import sanity_services_enriched.ndjson production")
    print("  sanity dataset import sanity_service_locations_enriched.ndjson production")
    print("  sanity dataset import sanity_pages_enriched.ndjson production")


if __name__ == "__main__":
    main()
