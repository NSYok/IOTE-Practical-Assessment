"""
Power Meter Simulator — Main + 20 Sub-Meters, Modbus TCP

Points per meter:
  voltage_LL_average (V), current (A), power (kW), energy (kWh), power_factor (0-1)

Simulate realistic summation:
  Main Meter ≈ sum(Floor) + sum(Chillers) + sum(CHP) + sum(CDP) + sum(CT) + Base Load
"""

import random
import logging
from .base_simulator import SHARED_STATE, now_iso, drift
from ..config.device_registry import POWER_METERS

logger = logging.getLogger(__name__)


def _init_meter(device: dict) -> dict:
    return {
        "id":                 device["id"],
        "protocol":           device["protocol"],
        "ip":                 device["ip"],
        "port":               device["port"],
        "unit_id":            device["unit_id"],
        "coverage":           device["coverage"],
        "voltage_LL_average": round(random.uniform(395, 405), 1),
        "current":            0.0,
        "power":              0.0,
        "energy":             round(random.uniform(10000, 50000), 1), # initial kWh
        "power_factor":       round(random.uniform(0.85, 0.95), 2),
        "timestamp":          now_iso(),
    }


def initialize() -> None:
    for dev in POWER_METERS:
        SHARED_STATE["power_meters"][dev["id"]] = _init_meter(dev)
    logger.info("Power meter simulator initialized (%d meters)", len(POWER_METERS))


def _get_device_power(device_type: str, mapped_id: str) -> float:
    """Helper to fetch current power from equipment states."""
    try:
        return SHARED_STATE[device_type][mapped_id]["power"]
    except KeyError:
        return 0.0

def tick() -> None:
    # 1. Update Equipment & Floor Sub-Meters First
    total_building_power = 0.0
    
    for dev in POWER_METERS:
        mid = dev["id"]
        s   = SHARED_STATE["power_meters"][mid]
        
        # Drift voltage and PF slightly
        s["voltage_LL_average"] = drift(s["voltage_LL_average"], 390.0, 410.0, 0.5)
        s["power_factor"]       = drift(s["power_factor"], 0.82, 0.98, 0.01)

        pwr = 0.0
        # Map device powers
        if mid.startswith("PM-CH") and not mid.startswith("PM-CHP"): # PM-CH1,2,3
            chiller_id = mid.replace("PM-", "") # CH1 -> CH-1 format needs fixing
            chiller_id = chiller_id[:2] + "-" + chiller_id[2:] # CH-1
            pwr = _get_device_power("chillers", chiller_id)
        elif mid.startswith("PM-CHP"):
            chp_id = mid.replace("PM-", "")
            chp_id = chp_id[:3] + "-" + chp_id[3:]
            pwr = _get_device_power("chilled_water_pumps", chp_id)
        elif mid.startswith("PM-CDP"):
            cdp_id = mid.replace("PM-", "")
            cdp_id = cdp_id[:3] + "-" + cdp_id[3:]
            pwr = _get_device_power("condenser_water_pumps", cdp_id)
        elif mid.startswith("PM-CT"):
            ct_id = mid.replace("PM-", "")
            ct_id = ct_id[:2] + "-" + ct_id[2:]
            pwr = _get_device_power("cooling_towers", ct_id)
        elif mid.startswith("PM-AHU"):
            ahu_id = mid.replace("PM-", "")
            ahu_id = ahu_id[:3] + "-F" + ahu_id[3:] # AHU1 -> AHU-F1
            pwr = _get_device_power("ahus", ahu_id)
        elif mid.startswith("PM-F"): 
            floor_num = mid[-1]
            # Floor power = Lighting (estimated) + Plug Loads + AHU
            base_floor_load = drift(s.get("base_load", 15.0), 10.0, 25.0, 0.2)
            s["base_load"] = base_floor_load
            ahu_pwr = _get_device_power("ahus", f"AHU-F{floor_num}")
            pwr = base_floor_load + ahu_pwr
            
        elif mid == "PM-MAIN":
            pass # calculated at the end
            
        if mid != "PM-MAIN":
            s["power"] = round(pwr, 2)
            # P = sqrt(3) * V * I * PF  =>  I = P * 1000 / (sqrt(3) * V * PF)
            v_phase = s["voltage_LL_average"]
            pf = s["power_factor"]
            s["current"] = round((pwr * 1000) / (1.732 * v_phase * pf), 1) if pwr > 0 else 0.0
            
            # Integrate energy roughly (tick is usually 5s, so P * 5 / 3600 kWh)
            s["energy"] = round(s["energy"] + (pwr * (5.0 / 3600.0)), 2)
            
            # accumulate structure for main
            if not mid.startswith("PM-AHU"): # don't double count AHU (its in Floor)
                total_building_power += s["power"]
            
        s["timestamp"] = now_iso()

    # 2. Update Main Meter
    main_s = SHARED_STATE["power_meters"]["PM-MAIN"]
    main_s["power"]   = round(total_building_power, 2)
    main_s["current"] = round((total_building_power * 1000) / (1.732 * main_s["voltage_LL_average"] * main_s["power_factor"]), 1) if total_building_power > 0 else 0.0
    main_s["energy"]  = round(main_s["energy"] + (total_building_power * (5.0 / 3600.0)), 2)
    main_s["timestamp"] = now_iso()
