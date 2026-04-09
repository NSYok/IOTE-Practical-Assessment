"""
Weather Station Simulator — 1 Outdoor Weather Station, MQTT

Points:
  drybulb_temperature (°C), humidity (%RH), wetbulb_temperature (°C)
"""

import random
import logging
from .base_simulator import SHARED_STATE, now_iso, drift
from ..config.device_registry import WEATHER_STATION

logger = logging.getLogger(__name__)


def _init_weather(device: dict) -> dict:
    drybulb  = random.uniform(28.0, 36.0)
    humidity = random.uniform(50.0, 85.0)
    # Simple approx for wetbulb
    wetbulb  = drybulb - ((100 - humidity) / 5.0)
    return {
        "id":                  device["id"],
        "protocol":            device["protocol"],
        "ip":                  device["ip"],
        "location":            device["location"],
        "topic":               device["topic"],
        "drybulb_temperature": round(drybulb, 1),
        "humidity":            round(humidity, 1),
        "wetbulb_temperature": round(wetbulb, 1),
        "timestamp":           now_iso(),
    }


def initialize() -> None:
    SHARED_STATE["weather"][WEATHER_STATION["id"]] = _init_weather(WEATHER_STATION)
    logger.info("Weather simulator initialized")


def tick() -> None:
    wid = WEATHER_STATION["id"]
    s   = SHARED_STATE["weather"][wid]

    s["drybulb_temperature"] = drift(s["drybulb_temperature"], 24.0, 40.0, 0.4)
    s["humidity"]            = drift(s["humidity"],            40.0, 95.0, 1.0)
    
    # Update wetbulb approximation
    s["wetbulb_temperature"] = round(s["drybulb_temperature"] - ((100 - s["humidity"]) / 5.0), 1)

    s["timestamp"] = now_iso()
