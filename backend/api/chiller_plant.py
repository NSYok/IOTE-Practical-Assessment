from fastapi import APIRouter
from backend.simulator.base_simulator import SHARED_STATE

router = APIRouter()

@router.get("/")
def get_chiller_plant_status():
    chillers = SHARED_STATE.get("chillers", {})
    chwp = SHARED_STATE.get("chilled_water_pumps", {})
    cdwp = SHARED_STATE.get("condenser_water_pumps", {})
    ct = SHARED_STATE.get("cooling_towers", {})

    total_cooling_rt = sum(c.get("cooling_rate", 0) for c in chillers.values())
    total_chiller_kw = sum(c.get("power", 0) for c in chillers.values())
    total_chwp_kw = sum(p.get("power", 0) for p in chwp.values())
    total_cdwp_kw = sum(p.get("power", 0) for p in cdwp.values())
    total_ct_kw = sum(c.get("power", 0) for c in ct.values())

    total_plant_kw = total_chiller_kw + total_chwp_kw + total_cdwp_kw + total_ct_kw
    plant_efficiency = round((total_plant_kw / total_cooling_rt), 3) if total_cooling_rt > 0 else 0

    return {
        "plant_summary": {
            "total_cooling_rt": round(total_cooling_rt, 1),
            "total_power_kw": round(total_plant_kw, 1),
            "plant_efficiency_kw_rt": plant_efficiency
        },
        "equipments": {
            "chillers": chillers,
            "chilled_water_pumps": chwp,
            "condenser_water_pumps": cdwp,
            "cooling_towers": ct
        }
    }
