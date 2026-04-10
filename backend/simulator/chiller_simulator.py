"""
Chiller Simulator — 3 × 500 RT chillers (BACnet/IP)
 
Data ranges are calibrated for Bangkok climate:
  - Chilled water supply (evap leaving) : 44–46 °F  (~7–8 °C)
  - Chilled water return (evap entering): 53–57 °F  (~12–14 °C)
  - Refrigerant (R-134a): evap sat temp : 38–42 °F
  - Full-load power: 273 kW  →  efficiency ~0.55 kW/RT
  - Part-load efficiency degrades to ~0.70 kW/RT
"""

import random
import logging
from .base_simulator import SHARED_STATE, now_iso, drift, clamp, random_bool
from ..config.device_registry import CHILLERS

logger = logging.getLogger(__name__)

# Initial state per chiller  (values will drift each tick)
_INITIAL = {
    "evap_leaving_water_temperature":  45.0,   # °F — chilled water supply
    "evap_entering_water_temperature": 55.0,   # °F — chilled water return
    "evap_water_flow_rate":            1150.0,  # GPM
    "evap_sat_refrig_temperature":     40.0,   # °F
    "evap_water_delta_temperature":    10.0,   # °F  (entering – leaving)
    "evap_approach_temperature":        2.0,   # °F  (leaving – sat refrig)
    "power":                          245.0,   # kW
    "percentage_rla":                  85.0,   # %
    "efficiency":                       0.60,  # kW/RT
    "cooling_rate":                   408.0,   # RT
}


def _init_chiller(device: dict) -> dict:
    """Create the initial state dict for one chiller."""
    # Start with metadata keys for better visibility in MQTT tools
    state = {
        "id":         device["id"],
        "protocol":   device["protocol"],
        "ip":         device["ip"],
        "port":       device["port"],
        "device_id":  device["device_id"],
        "status_read":  random_bool(0.9),
        "status_write": True,
        "alarm":        False,
    }
    
    # Add simulation initial values
    for k, v in _INITIAL.items():
        state[k] = round(v + random.uniform(-2, 2), 3)
        
    state["timestamp"] = now_iso()
    return state


def initialize() -> None:
    """Populate SHARED_STATE["chillers"] with starting values."""
    for device in CHILLERS:
        SHARED_STATE["chillers"][device["id"]] = _init_chiller(device)
    logger.info("Chiller simulator initialized (%d units)", len(CHILLERS))


def tick() -> None:
    """
    Update every chiller's data with a small random drift.
    Called periodically by the main runner.
    """
    for device in CHILLERS:
        cid = device["id"]
        s = SHARED_STATE["chillers"][cid]
        running = s["status_read"]

        if running:
            # Drift all analog values within realistic bounds
            s["evap_leaving_water_temperature"]  = drift(s["evap_leaving_water_temperature"],  44.0, 46.5, 0.15)
            s["evap_entering_water_temperature"] = drift(s["evap_entering_water_temperature"], 53.0, 57.0, 0.20)
            s["evap_water_flow_rate"]            = drift(s["evap_water_flow_rate"],            900.0, 1200.0, 15.0)
            s["evap_sat_refrig_temperature"]     = drift(s["evap_sat_refrig_temperature"],      38.0, 42.0, 0.10)
            s["power"]                           = drift(s["power"],                           180.0, 273.0, 4.0)
            s["percentage_rla"]                  = drift(s["percentage_rla"],                   60.0, 100.0, 1.5)

            # Derived values — computed from other points
            s["evap_water_delta_temperature"]    = round(
                s["evap_entering_water_temperature"] - s["evap_leaving_water_temperature"], 3
            )
            s["evap_approach_temperature"]       = round(
                s["evap_leaving_water_temperature"] - s["evap_sat_refrig_temperature"], 3
            )
            # Cooling rate  Q(RT) = GPM × ΔT / 24  (approximate for water)
            s["cooling_rate"]  = round(
                s["evap_water_flow_rate"] * s["evap_water_delta_temperature"] / 24.0, 2
            )
            # Efficiency  kW/RT
            s["efficiency"]    = round(s["power"] / s["cooling_rate"], 4) if s["cooling_rate"] > 0 else 0.0
        else:
            # Chiller off — set all analog values to 0
            for analog in [
                "evap_leaving_water_temperature", "evap_entering_water_temperature",
                "evap_water_flow_rate", "evap_sat_refrig_temperature",
                "evap_water_delta_temperature", "evap_approach_temperature",
                "power", "percentage_rla", "efficiency", "cooling_rate",
            ]:
                s[analog] = 0.0

        # Random alarm (1% chance when running, 0% when off)
        s["alarm"]    = running and random.random() < 0.01
        s["timestamp"] = now_iso()
