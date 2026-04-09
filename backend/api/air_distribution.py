from fastapi import APIRouter
from backend.simulator.base_simulator import SHARED_STATE
from backend.config import settings

router = APIRouter()

@router.get("/")
def get_air_distribution():
    ahus = list(SHARED_STATE.get("ahus", {}).values())
    vavs = list(SHARED_STATE.get("vavs", {}).values())
    iaq = list(SHARED_STATE.get("iaq", {}).values())
    
    floors_data = {}
    
    for floor in range(1, settings.BUILDING_FLOORS + 1):
        floor_ahu = next((a for a in ahus if a.get("floor") == floor), None)
        floor_vavs = [v for v in vavs if v.get("floor") == floor]
        floor_iaq = [i for i in iaq if i.get("floor") == floor]
        
        zone_env = {}
        for sensor in floor_iaq:
            zone = sensor.get("zone", "Unknown")
            zone_env[zone] = {
                "temperature": sensor.get("temperature", 0),
                "humidity": sensor.get("humidity", 0)
            }
            
        floors_data[f"Floor {floor}"] = {
            "ahu": floor_ahu,
            "vavs": floor_vavs,
            "zone_environment": zone_env
        }
        
    return floors_data
