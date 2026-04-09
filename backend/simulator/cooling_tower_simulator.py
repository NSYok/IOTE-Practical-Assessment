"""
Cooling Tower Simulator — 3 towers × 2 cells = 6 cells total
Protocol: Modbus TCP

Each tower has:
  - 2 cells, each with a 5.5 kW fan → 11 kW max per tower
  - VSD fan control (frequency_read / frequency_write)
  - status_read, status_write, alarm, power, efficiency
"""

import random
import logging
from .base_simulator import SHARED_STATE, now_iso, drift, random_bool
from ..config.device_registry import COOLING_TOWERS

logger = logging.getLogger(__name__)

_MAX_CELL_POWER_KW = 5.5
_CELLS_PER_TOWER   = 2


def _init_ct(device: dict) -> dict:
    freq = random.uniform(30, 50)
    return {
        "id":            device["id"],
        "protocol":      device["protocol"],
        "ip":            device["ip"],
        "port":          device["port"],
        "unit_id":       device["unit_id"],
        "cells":         device["cells"],
        "status_read":   random_bool(0.95),
        "status_write":  True,
        "alarm":         False,
        "frequency_read":  round(freq, 2),
        "frequency_write": round(freq, 2),
        "power":           round((_MAX_CELL_POWER_KW * _CELLS_PER_TOWER) * (freq / 60) ** 3, 2),
        "efficiency":      round(freq / 60, 4),
        "timestamp":     now_iso(),
    }


def initialize() -> None:
    for dev in COOLING_TOWERS:
        SHARED_STATE["cooling_towers"][dev["id"]] = _init_ct(dev)
    logger.info("Cooling tower simulator initialized (%d towers)", len(COOLING_TOWERS))


def tick() -> None:
    max_pwr = _MAX_CELL_POWER_KW * _CELLS_PER_TOWER  # 11 kW
    for dev in COOLING_TOWERS:
        cid = dev["id"]
        s   = SHARED_STATE["cooling_towers"][cid]
        running = s["status_read"]

        if running:
            s["frequency_read"]  = drift(s["frequency_read"], 25.0, 50.0, 0.5)
            s["frequency_write"] = s["frequency_read"]
            ratio      = s["frequency_read"] / 60.0
            s["power"] = round(max_pwr * (ratio ** 3) * random.uniform(0.95, 1.05), 2)
            s["efficiency"] = round(s["power"] / max_pwr, 4)
        else:
            s["frequency_read"] = s["frequency_write"] = 0.0
            s["power"] = s["efficiency"] = 0.0

        s["alarm"]     = running and random.random() < 0.01
        s["timestamp"] = now_iso()
