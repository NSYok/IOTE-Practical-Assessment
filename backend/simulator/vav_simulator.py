"""
VAV Simulator — 16 Variable Air Volume units (4 per floor), BACnet/IP

Points per VAV:
  damper_position (%), air_flow_rate (CFM), damper_control (%)
"""

import random
import logging
from .base_simulator import SHARED_STATE, now_iso, drift
from ..config.device_registry import VAVS

logger = logging.getLogger(__name__)


def _init_vav(device: dict) -> dict:
    damper = random.uniform(40.0, 90.0)
    return {
        "id":              device["id"],
        "protocol":        device["protocol"],
        "ip":              device["ip"],
        "port":            device["port"],
        "device_id":       device["device_id"],
        "floor":           device["floor"],
        "zone":            device["zone"],
        "damper_position": round(damper, 1),
        "damper_control":  round(damper, 1),
        "air_flow_rate":   round(damper * 8.5, 0),  # Rough map: 100% ~ 850 CFM
        "timestamp":       now_iso(),
    }


def initialize() -> None:
    for dev in VAVS:
        SHARED_STATE["vavs"][dev["id"]] = _init_vav(dev)
    logger.info("VAV simulator initialized (%d units)", len(VAVS))


def tick() -> None:
    for dev in VAVS:
        vid = dev["id"]
        s   = SHARED_STATE["vavs"][vid]

        # Damper occasionally drifts slightly based on zone thermal load change
        s["damper_position"] = drift(s["damper_position"], 15.0, 100.0, 2.5)
        s["damper_control"]  = s["damper_position"]
        s["air_flow_rate"]   = round(s["damper_position"] * 8.5 * random.uniform(0.95, 1.05), 0)

        s["timestamp"] = now_iso()
