"""
Pump Simulator — Chilled Water Pumps (3×) and Condenser Water Pumps (3×)
Protocol: Modbus TCP

Points per pump:
  status_read, status_write, alarm,
  frequency_read (Hz), frequency_write (Hz),
  power (kW), efficiency (dimensionless)
"""

import random
import logging
from .base_simulator import SHARED_STATE, now_iso, drift, random_bool
from ..config.device_registry import CHILLED_WATER_PUMPS, CONDENSER_WATER_PUMPS

logger = logging.getLogger(__name__)


def _init_pump(device: dict, freq_lo: float, freq_hi: float, pwr_lo: float, pwr_hi: float) -> dict:
    freq = random.uniform(45, freq_hi)
    pwr  = random.uniform(pwr_lo * 0.8, pwr_hi)
    return {
        "id":            device["id"],
        "protocol":      device["protocol"],
        "ip":            device["ip"],
        "port":          device["port"],
        "unit_id":       device["unit_id"],
        "status_read":   random_bool(0.90),
        "status_write":  True,
        "alarm":         False,
        "frequency_read":  round(freq, 2),
        "frequency_write": round(freq, 2),
        "power":           round(pwr, 2),
        "efficiency":      round(pwr / device["power_kw"], 4),
        "timestamp":     now_iso(),
    }


def initialize() -> None:
    # Chilled Water Pumps — 37 kW rated, 1200 GPM, 30–60 Hz
    for dev in CHILLED_WATER_PUMPS:
        SHARED_STATE["chilled_water_pumps"][dev["id"]] = _init_pump(dev, 30, 60, 25, 37)
    # Condenser Water Pumps — 55 kW rated, 1500 GPM, 30–60 Hz
    for dev in CONDENSER_WATER_PUMPS:
        SHARED_STATE["condenser_water_pumps"][dev["id"]] = _init_pump(dev, 30, 60, 38, 55)
    logger.info(
        "Pump simulator initialized (CHP: %d, CDP: %d)",
        len(CHILLED_WATER_PUMPS), len(CONDENSER_WATER_PUMPS),
    )


def _tick_pump(pumps: list, key: str, pwr_rated: float, freq_lo=30.0, freq_hi=60.0):
    for dev in pumps:
        pid = dev["id"]
        s = SHARED_STATE[key][pid]
        running = s["status_read"]
        if running:
            s["frequency_read"]  = drift(s["frequency_read"], freq_lo, freq_hi, 0.5)
            s["frequency_write"] = s["frequency_read"]

            # Power scales roughly with cube of frequency ratio (affinity law)
            ratio = s["frequency_read"] / 60.0
            s["power"]      = round(pwr_rated * (ratio ** 3) * random.uniform(0.95, 1.05), 2)
            s["efficiency"] = round(s["power"] / pwr_rated, 4)
        else:
            s["frequency_read"], s["frequency_write"] = 0.0, 0.0
            s["power"], s["efficiency"] = 0.0, 0.0

        s["alarm"]     = running and random.random() < 0.01
        s["timestamp"] = now_iso()


def tick() -> None:
    _tick_pump(CHILLED_WATER_PUMPS,   "chilled_water_pumps",   37.0)
    _tick_pump(CONDENSER_WATER_PUMPS, "condenser_water_pumps", 55.0)
