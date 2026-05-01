"""
History API — Query time-series data from SQLite for trend visualization.
Supports time range filtering via `minutes` query parameter.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Query
from backend.database.connection import get_connection

router = APIRouter()


def _query_history(table: str, columns: list[str], minutes: int, device_id: str | None = None):
    """Generic helper to query a ts_* table with time-range filtering."""
    conn = get_connection()
    try:
        cutoff = (datetime.now() - timedelta(minutes=minutes)).isoformat()
        col_str = ", ".join(columns)

        if device_id:
            sql = f"SELECT {col_str} FROM {table} WHERE timestamp >= ? AND device_id = ? ORDER BY timestamp ASC"
            rows = conn.execute(sql, (cutoff, device_id)).fetchall()
        else:
            sql = f"SELECT {col_str} FROM {table} WHERE timestamp >= ? ORDER BY timestamp ASC"
            rows = conn.execute(sql, (cutoff,)).fetchall()

        return [dict(r) for r in rows]
    finally:
        conn.close()


# ─── Chillers ──────────────────────────────────────────────────────────────────
@router.get("/chillers")
def get_chiller_history(minutes: int = Query(default=30, ge=1, le=120)):
    """Returns chiller time-series data for all chillers within the time range."""
    cols = ["timestamp", "device_id", "status_read", "evap_leaving_water_temperature",
            "evap_entering_water_temperature", "power", "efficiency", "cooling_rate"]
    return {"data": _query_history("ts_chillers", cols, minutes), "minutes": minutes}


# ─── Pumps ─────────────────────────────────────────────────────────────────────
@router.get("/pumps")
def get_pump_history(minutes: int = Query(default=30, ge=1, le=120)):
    """Returns pump time-series data for all pumps within the time range."""
    cols = ["timestamp", "device_id", "pump_type", "status_read", "frequency_read", "power"]
    return {"data": _query_history("ts_pumps", cols, minutes), "minutes": minutes}


# ─── Cooling Towers ───────────────────────────────────────────────────────────
@router.get("/cooling-towers")
def get_cooling_tower_history(minutes: int = Query(default=30, ge=1, le=120)):
    """Returns cooling tower time-series data within the time range."""
    cols = ["timestamp", "device_id", "status_read", "frequency_read", "power"]
    return {"data": _query_history("ts_cooling_towers", cols, minutes), "minutes": minutes}


# ─── AHUs ──────────────────────────────────────────────────────────────────────
@router.get("/ahus")
def get_ahu_history(minutes: int = Query(default=30, ge=1, le=120)):
    """Returns AHU time-series data within the time range."""
    cols = ["timestamp", "device_id", "status_read", "room_temperature", "setpoint", "humidity", "power"]
    return {"data": _query_history("ts_ahus", cols, minutes), "minutes": minutes}


# ─── VAVs ──────────────────────────────────────────────────────────────────────
@router.get("/vavs")
def get_vav_history(minutes: int = Query(default=30, ge=1, le=120)):
    """Returns VAV time-series data within the time range."""
    cols = ["timestamp", "device_id", "damper_position", "air_flow_rate"]
    return {"data": _query_history("ts_vavs", cols, minutes), "minutes": minutes}


# ─── IAQ ───────────────────────────────────────────────────────────────────────
@router.get("/iaq")
def get_iaq_history(minutes: int = Query(default=30, ge=1, le=120)):
    """Returns IAQ sensor time-series data within the time range."""
    cols = ["timestamp", "device_id", "temperature", "humidity", "co2", "pm25"]
    return {"data": _query_history("ts_iaq", cols, minutes), "minutes": minutes}


# ─── Weather ───────────────────────────────────────────────────────────────────
@router.get("/weather")
def get_weather_history(minutes: int = Query(default=30, ge=1, le=120)):
    """Returns weather station time-series data within the time range."""
    cols = ["timestamp", "device_id", "drybulb_temperature", "humidity", "wetbulb_temperature"]
    return {"data": _query_history("ts_weather", cols, minutes), "minutes": minutes}


# ─── Power Meters ──────────────────────────────────────────────────────────────
@router.get("/power-meters")
def get_power_meter_history(minutes: int = Query(default=30, ge=1, le=120)):
    """Returns power meter time-series data within the time range."""
    cols = ["timestamp", "device_id", "voltage_LL_average", "current", "power", "energy", "power_factor"]
    return {"data": _query_history("ts_power_meters", cols, minutes), "minutes": minutes}
