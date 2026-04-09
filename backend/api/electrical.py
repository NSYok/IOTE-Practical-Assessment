from fastapi import APIRouter
from backend.simulator.base_simulator import SHARED_STATE

router = APIRouter()

@router.get("/")
def get_electrical_distribution():
    meters = SHARED_STATE.get("power_meters", {})
    main_meter = meters.get("PM-MAIN", {})
    
    floor_breakdown = {}
    equipment_breakdown = {}
    
    for mid, m_data in meters.items():
        if mid == "PM-MAIN":
            continue
            
        if mid.startswith("PM-F"):
            floor_breakdown[mid] = m_data
        else:
            equipment_breakdown[mid] = m_data
            
    return {
        "main_building_power": main_meter,
        "floor_breakdown": floor_breakdown,
        "equipment_breakdown": equipment_breakdown
    }
