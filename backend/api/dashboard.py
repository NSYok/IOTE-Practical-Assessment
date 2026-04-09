from fastapi import APIRouter
from backend.simulator.base_simulator import SHARED_STATE
from backend.config import settings

router = APIRouter()

@router.get("/")
def get_dashboard_summary():
    main_meter = SHARED_STATE.get("power_meters", {}).get("PM-MAIN", {})
    total_power = main_meter.get("power", 0)
    
    total_cooling_rt = sum(c.get("cooling_rate", 0) for c in SHARED_STATE.get("chillers", {}).values())
    building_efficiency = round((total_power / total_cooling_rt) if total_cooling_rt > 0 else 0, 3)

    iaq_data = SHARED_STATE.get("iaq", {}).values()
    floors_iaq = {}
    for floor in range(1, settings.BUILDING_FLOORS + 1):
        floor_sensors = [s for s in iaq_data if s["floor"] == floor]
        if not floor_sensors:
            continue
            
        floors_iaq[f"Floor {floor}"] = {
            "temperature": {
                "avg": round(sum(s["temperature"] for s in floor_sensors) / len(floor_sensors), 1) if floor_sensors else 0,
                "min": min((s["temperature"] for s in floor_sensors), default=0),
                "max": max((s["temperature"] for s in floor_sensors), default=0)
            },
            "humidity": {
                "avg": round(sum(s["humidity"] for s in floor_sensors) / len(floor_sensors), 1) if floor_sensors else 0,
                "min": min((s["humidity"] for s in floor_sensors), default=0),
                "max": max((s["humidity"] for s in floor_sensors), default=0)
            },
            "co2": {
                "avg": round(sum(s["co2"] for s in floor_sensors) / len(floor_sensors), 0) if floor_sensors else 0,
                "min": min((s["co2"] for s in floor_sensors), default=0),
                "max": max((s["co2"] for s in floor_sensors), default=0)
            },
            "pm25": {
                "avg": round(sum(s["pm25"] for s in floor_sensors) / len(floor_sensors), 1) if floor_sensors else 0,
                "min": min((s["pm25"] for s in floor_sensors), default=0),
                "max": max((s["pm25"] for s in floor_sensors), default=0)
            }
        }

    return {
        "building_kpis": {
            "total_power_kw": total_power,
            "total_energy_kwh": main_meter.get("energy", 0),
            "total_cooling_rt": round(total_cooling_rt, 1),
            "overall_efficiency_kw_rt": building_efficiency
        },
        "iaq_analytics": floors_iaq,
        "weather": SHARED_STATE.get("weather", {}).get("WS-ROOF", {})
    }
