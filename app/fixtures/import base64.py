import base64
import hashlib
import hmac
import json
import os
import socket
import ssl
import time
from typing import Any, Dict, List, Optional
import urllib.request
import urllib.parse
import urllib.error


# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------

STRIPE_SECRET_KEY = "sk_test_51SvMS9F1i06hmKAVYpWqBEWlyqvOIryLxjFemOIUHIwIjKq0ZnOuLvTuIHf2hEHypsn8XdUQ1z1lv0vRcFMAzQgK009ITVZrKu"
WEBHOOK_SIGNING_SECRET = "whsec_3e5e3b70c88f03d0d5a64e164ed253154b8ec1676233013a8569e1496abad51b"
WEBHOOK_ENDPOINT_URL = "https://store.iiadevaz.local/plugin/stripe/webhook"

# Example: "payment_intent.succeeded"
EVENT_TYPE_FILTER: Optional[str] = None

# Specific Event ID to resend (if set, ignores DAYS_FROM/DAYS_TO and EVENT_TYPE_FILTER)
EVENT_ID: Optional[str] = "evt_3TPniwF1i06hmKAV1sZjHF9l"

DAYS_FROM = 180
DAYS_TO = 16

STRIPE_API_BASE = "https://api.stripe.com/v1"


# -----------------------------------------------------------------------------
# HELPERS
# -----------------------------------------------------------------------------

def compute_hmac_sha256(secret: str, message: str) -> str:
    digest = hmac.new(
        secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return digest


def build_stripe_signature(secret: str, payload: str, timestamp: int) -> str:
    signed_payload = f"{timestamp}.{payload}"
    signature = compute_hmac_sha256(secret, signed_payload)
    return f"t={timestamp},v1={signature}"


def fetch_specific_event(event_id: str) -> Optional[Dict[str, Any]]:
    print(f"Fetching specific event: {event_id}\n")

    url = f"{STRIPE_API_BASE}/events/{event_id}"

    auth_str = f"{STRIPE_SECRET_KEY}:"
    auth_bytes = auth_str.encode("utf-8")
    auth_b64 = base64.b64encode(auth_bytes).decode("utf-8")

    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Basic {auth_b64}")

    default_context = ssl.create_default_context()

    try:
        with urllib.request.urlopen(req, timeout=10, context=default_context) as response:
            status_code = response.status
            text = response.read().decode("utf-8")
            return json.loads(text)
    except urllib.error.HTTPError as e:
        status_code = e.code
        text = e.read().decode("utf-8")
        print(f"Stripe API error(fetch specific event): {status_code}")
        print(text)
        return None
    except Exception as e:
        print(f"Network error: {e}")
        return None


def fetch_events_16_to_30_days_old() -> List[Dict[str, Any]]:
    now = int(time.time())
    thirty_days_ago = now - (DAYS_FROM * 24 * 60 * 60)
    sixteen_days_ago = now - (DAYS_TO * 24 * 60 * 60)

    print("Fetching events created between:")
    print(f"  From : {time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(thirty_days_ago))} UTC")
    print(f"  To   : {time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(sixteen_days_ago))} UTC")
    print()

    all_events: List[Dict[str, Any]] = []
    starting_after: Optional[str] = None
    has_more = True

    # Use default SSL context for stripe API
    default_context = ssl.create_default_context()

    while has_more:
        params = {
            "created[gte]": thirty_days_ago,
            "created[lte]": sixteen_days_ago,
            "limit": 1,  # Only fetch 1 event
        }

        if EVENT_TYPE_FILTER:
            params["type"] = EVENT_TYPE_FILTER

        if starting_after:
            params["starting_after"] = starting_after

        # Build url and headers
        encoded_params = urllib.parse.urlencode(params)
        url = f"{STRIPE_API_BASE}/events?{encoded_params}"

        auth_str = f"{STRIPE_SECRET_KEY}:"
        auth_bytes = auth_str.encode("utf-8")
        auth_b64 = base64.b64encode(auth_bytes).decode("utf-8")

        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Basic {auth_b64}")

        try:
            with urllib.request.urlopen(req, timeout=10, context=default_context) as response:
                status_code = response.status
                text = response.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            status_code = e.code
            text = e.read().decode("utf-8")
            print(f"Stripe API error: {status_code}")
            print(text)
            break
        except Exception as e:
            print(f"Network error: {e}")
            break

        data = json.loads(text)
        events = data.get("data", [])

        all_events.extend(events)
        
        # Stop immediately since we only want to fetch and resend 1 event
        has_more = False

    return all_events


def resend_event(raw_payload: str) -> bool:
    try:
        timestamp = int(time.time())
        stripe_signature = build_stripe_signature(
            WEBHOOK_SIGNING_SECRET,
            raw_payload,
            timestamp
        )

        headers = {
            "Stripe-Signature": stripe_signature,
            "Content-Type": "application/json",
        }

        req = urllib.request.Request(
            WEBHOOK_ENDPOINT_URL,
            data=raw_payload.encode("utf-8"),
            headers=headers,
            method="POST"
        )

        # Bypass SSL verification for local domains (e.g. .local or localhost)
        context = None
        if any(local_domain in WEBHOOK_ENDPOINT_URL for local_domain in [".local", "localhost", "127.0.0.1"]):
            context = ssl._create_unverified_context()

        with urllib.request.urlopen(req, timeout=10, context=context) as response:
            return 200 <= response.status < 300
    except urllib.error.HTTPError as e:
        print(f"\n    HTTP Error: {e.code} - {e.reason}")
        try:
            err_body = e.read().decode("utf-8")
            print(f"    Body: {err_body}")
        except Exception:
            pass
        return False
    except Exception as ex:
        print(f"\n    Exception: {ex}")
        return False


# -----------------------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------------------

def main() -> None:
    # Set default socket timeout globally to prevent hung connections
    socket.setdefaulttimeout(10)

    print("=== Stripe Event Resender ===\n")

    events = []
    if EVENT_ID:
        event = fetch_specific_event(EVENT_ID)
        if event:
            events.append(event)
    else:
        events = fetch_events_16_to_30_days_old()
        if events:
            events = events[:1]

    if not events:
        print("No events found to resend.")
        return

    print(f"Found {len(events)} event(s). Starting resend...\n")

    success = 0
    failed = 0

    for ev in events:
        event_id = ev.get("id", "unknown")
        event_type = ev.get("type", "unknown")

        # Re-serialize the event payload before sending.
        # This is the exact body your webhook endpoint will receive.
        raw_payload = json.dumps(ev, separators=(",", ":"), ensure_ascii=False)

        print(f"  [{event_type}] {event_id} ... ", end="")

        sent = resend_event(raw_payload)

        if sent:
            print("OK")
            success += 1
        else:
            print("FAILED")
            failed += 1

        time.sleep(0.2)

    print(f"\nDone. Success: {success} | Failed: {failed}")


if __name__ == "__main__":
    main()