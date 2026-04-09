"""
IAQ Simulator — 8 Indoor Air Quality Sensors (2 per floor), MQTT

Points per sensor:
  temperature (°C), humidity (%RH), co2 (ppm), pm25 (µg/m³)
"""

import random
import logging
from .base_simulator import SHARED_STATE, now_iso, drift
from ..config.device_registry import IAQ_SENSORS

logger = logging.getLogger(__name__)


def _init_iaq(device: dict) -> dict:
    return {
        "id":          device["id"],
        "protocol":    device["protocol"],
        "ip":          device["ip"],
        "floor":       device["floor"],
        "zone":        device["zone"],
        "topic":       device["topic"],
        "temperature": round(random.uniform(22.5, 25.5), 1),
        "humidity":    round(random.uniform(45.0, 65.0), 1),
        "co2":         round(random.uniform(400.0, 800.0), 1),
        "pm25":        round(random.uniform(5.0, 25.0), 1),
        "timestamp":   now_iso(),
    }


def initialize() -> None:
    for dev in IAQ_SENSORS:
        SHARED_STATE["iaq"][dev["id"]] = _init_iaq(dev)
    logger.info("IAQ simulator initialized (%d units)", len(IAQ_SENSORS))


def tick() -> None:
    for dev in IAQ_SENSORS:
        iid = dev["id"]
        s   = SHARED_STATE["iaq"][iid]

        s["temperature"] = drift(s["temperature"], 21.0,  28.0, 0.2)
        s["humidity"]    = drift(s["humidity"],    40.0,  70.0, 0.5)
        s["co2"]         = drift(s["co2"],        380.0, 1200.0, 15.0)
        s["pm25"]        = drift(s["pm25"],         2.0,  80.0, 2.0)

        s["timestamp"] = now_iso()
