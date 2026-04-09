"""
AHU Simulator — 4 Air Handling Units (1 per floor), BACnet/IP

Points per AHU:
  room_temperature (°C), setpoint (°C), humidity (%RH),
  status_read, status_write, alarm, power (kW)
"""

import random
import logging
from .base_simulator import SHARED_STATE, now_iso, drift, random_bool
from ..config.device_registry import AHUS

logger = logging.getLogger(__name__)

# Bangkok office: setpoint 23–25 °C, actual 22–27 °C
_SETPOINT_DEFAULT = 24.0


def _init_ahu(device: dict) -> dict:
    setpoint = random.uniform(23.0, 25.0)
    return {
        "id":            device["id"],
        "protocol":      device["protocol"],
        "ip":            device["ip"],
        "port":          device["port"],
        "device_id":     device["device_id"],
        "floor":         device["floor"],
        "status_read":   random_bool(0.95),
        "status_write":  True,
        "alarm":         False,
        "room_temperature": round(setpoint + random.uniform(-1.5, 2.5), 2),  # °C
        "setpoint":         round(setpoint, 2),
        "humidity":         round(random.uniform(52, 68), 2),   # %RH
        "power":            round(random.uniform(2.5, 5.5), 2), # kW
        "timestamp":     now_iso(),
    }


def initialize() -> None:
    for dev in AHUS:
        SHARED_STATE["ahus"][dev["id"]] = _init_ahu(dev)
    logger.info("AHU simulator initialized (%d units)", len(AHUS))


def tick() -> None:
    for dev in AHUS:
        aid = dev["id"]
        s   = SHARED_STATE["ahus"][aid]
        running = s["status_read"]

        if running:
            # Temperature slowly drifts towards setpoint (PI controller behaviour)
            error = s["setpoint"] - s["room_temperature"]
            correction = error * 0.08 + random.uniform(-0.1, 0.1)
            s["room_temperature"] = round(
                max(20.0, min(30.0, s["room_temperature"] + correction)), 2
            )
            s["humidity"] = drift(s["humidity"], 48.0, 72.0, 0.5)
            s["power"]    = drift(s["power"],     1.5,  6.0,  0.15)
        else:
            s["power"] = 0.0

        s["alarm"]     = running and random.random() < 0.01
        s["timestamp"] = now_iso()
