"""
Base Simulator — shared state store and helper utilities for all device simulators.

All simulators write their current device state into `SHARED_STATE`, a simple
in-memory dict.  The API layer reads from this dict directly (no DB round-trip
needed for real-time values).

Structure:
  SHARED_STATE = {
      "chillers":          { "CH-1": {...}, "CH-2": {...}, ... },
      "chilled_water_pumps": { "CHP-1": {...}, ... },
      "condenser_water_pumps": { ... },
      "cooling_towers":    { ... },
      "ahus":              { ... },
      "vavs":              { ... },
      "iaq":               { ... },
      "weather":           { ... },
      "power_meters":      { ... },
  }
"""

import random
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Any

logger = logging.getLogger(__name__)

# ─── Shared in-memory state (thread-safe reads; writes are single-threaded) ───
SHARED_STATE: dict[str, dict[str, Any]] = {
    "chillers": {},
    "chilled_water_pumps": {},
    "condenser_water_pumps": {},
    "cooling_towers": {},
    "ahus": {},
    "vavs": {},
    "iaq": {},
    "weather": {},
    "power_meters": {},
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def now_iso() -> str:
    """Current Bangkok (+07:00) timestamp in ISO 8601 format."""
    bkk_tz = timezone(timedelta(hours=7))
    return datetime.now(bkk_tz).isoformat()


def clamp(value: float, lo: float, hi: float) -> float:
    """Keep a value within [lo, hi]."""
    return max(lo, min(hi, value))


def drift(current: float, lo: float, hi: float, max_delta: float) -> float:
    """
    Small random walk from the current value, staying within [lo, hi].
    Produces realistic time-series data (smooth drift, not sudden jumps).
    """
    delta = random.uniform(-max_delta, max_delta)
    return round(clamp(current + delta, lo, hi), 3)


def random_bool(true_probability: float = 0.95) -> bool:
    """Returns True with the given probability (default: 95% running)."""
    return random.random() < true_probability


def fahrenheit_to_celsius(f: float) -> float:
    return round((f - 32) * 5 / 9, 2)


def celsius_to_fahrenheit(c: float) -> float:
    return round(c * 9 / 5 + 32, 2)
