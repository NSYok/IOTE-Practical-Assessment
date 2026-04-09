"""
Database Writer — Background thread to pull data from SHARED_STATE and flush to SQLite.
"""
import time
import threading
import logging
from .connection import get_connection, init_db
from ..config import settings
from ..simulator.base_simulator import SHARED_STATE

logger = logging.getLogger(__name__)

_stop_event = threading.Event()
_writer_thread = None

def _write_tick(conn):
    """Takes a snapshot of SHARED_STATE and writes to SQLite"""
    try:
        cursor = conn.cursor()
        
        # 1. Chillers
        for cid, state in SHARED_STATE.get("chillers", {}).items():
            cursor.execute('''
            INSERT INTO ts_chillers (timestamp, device_id, status_read, evap_leaving_water_temperature, evap_entering_water_temperature, evap_water_flow_rate, power, efficiency, cooling_rate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['status_read'], state['evap_leaving_water_temperature'], state['evap_entering_water_temperature'], state['evap_water_flow_rate'], state['power'], state['efficiency'], state['cooling_rate']))

        # 2. Pumps - CHW
        for pid, state in SHARED_STATE.get("chilled_water_pumps", {}).items():
            cursor.execute('''
            INSERT INTO ts_pumps (timestamp, device_id, pump_type, status_read, frequency_read, power, efficiency)
            VALUES (?, ?, 'CHWP', ?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['status_read'], state['frequency_read'], state['power'], state['efficiency']))
            
        # 3. Pumps - CDW
        for pid, state in SHARED_STATE.get("condenser_water_pumps", {}).items():
            cursor.execute('''
            INSERT INTO ts_pumps (timestamp, device_id, pump_type, status_read, frequency_read, power, efficiency)
            VALUES (?, ?, 'CDWP', ?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['status_read'], state['frequency_read'], state['power'], state['efficiency']))

        # 4. Cooling Towers
        for ctid, state in SHARED_STATE.get("cooling_towers", {}).items():
            cursor.execute('''
            INSERT INTO ts_cooling_towers (timestamp, device_id, status_read, frequency_read, power, efficiency)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['status_read'], state['frequency_read'], state['power'], state['efficiency']))

        # 5. AHU
        for aid, state in SHARED_STATE.get("ahus", {}).items():
            cursor.execute('''
            INSERT INTO ts_ahus (timestamp, device_id, status_read, room_temperature, setpoint, humidity, power)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['status_read'], state['room_temperature'], state['setpoint'], state['humidity'], state['power']))

        # 6. VAV
        for vid, state in SHARED_STATE.get("vavs", {}).items():
            cursor.execute('''
            INSERT INTO ts_vavs (timestamp, device_id, damper_position, air_flow_rate)
            VALUES (?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['damper_position'], state['air_flow_rate']))

        # 7. IAQ
        for iid, state in SHARED_STATE.get("iaq", {}).items():
            cursor.execute('''
            INSERT INTO ts_iaq (timestamp, device_id, temperature, humidity, co2, pm25)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['temperature'], state['humidity'], state['co2'], state['pm25']))

        # 8. Weather
        for wid, state in SHARED_STATE.get("weather", {}).items():
            cursor.execute('''
            INSERT INTO ts_weather (timestamp, device_id, drybulb_temperature, humidity, wetbulb_temperature)
            VALUES (?, ?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['drybulb_temperature'], state['humidity'], state['wetbulb_temperature']))

        # 9. Power Meters
        for mid, state in SHARED_STATE.get("power_meters", {}).items():
            cursor.execute('''
            INSERT INTO ts_power_meters (timestamp, device_id, voltage_LL_average, current, power, energy, power_factor)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (state['timestamp'], state['id'], state['voltage_LL_average'], state['current'], state['power'], state['energy'], state['power_factor']))

        conn.commit()
    except Exception as e:
        logger.error(f"Failed to write DB tick: {e}")


def _db_loop():
    logger.info("Starting Data Writer Loop...")
    conn = get_connection()
    try:
        while not _stop_event.is_set():
            _write_tick(conn)
            # Write every 10 seconds to not spam the disk too much or match intervals
            _stop_event.wait(10.0) 
    finally:
        conn.close()
    logger.info("Data Writer Loop stopped.")


def start_db_writer():
    global _writer_thread
    if _writer_thread is not None and _writer_thread.is_alive():
        logger.warning("DB Writer is already running.")
        return

    init_db() # ensure db structures
    _stop_event.clear()
    
    _writer_thread = threading.Thread(target=_db_loop, daemon=True, name="DBWriterThread")
    _writer_thread.start()

def stop_db_writer():
    global _writer_thread
    if _writer_thread is not None:
        _stop_event.set()
        _writer_thread.join()
        _writer_thread = None
