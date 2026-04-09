"""
SQLite Connection & Init
Creates the local SQLite DB and constructs tables if they don't exist.
"""
import sqlite3
import logging
from ..config import settings

logger = logging.getLogger(__name__)

# Extract file path from sqlite:///./iotdb.sqlite3
DB_PATH = settings.DATABASE_URL.replace("sqlite:///", "")

def get_connection() -> sqlite3.Connection:
    """Returns a new SQLite connection with row factories enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database with schemata for time-series data."""
    logger.info(f"Initializing SQLite DB at {DB_PATH}")
    
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Chiller
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ts_chillers (
            timestamp DATETIME,
            device_id TEXT,
            status_read BOOLEAN,
            evap_leaving_water_temperature REAL,
            evap_entering_water_temperature REAL,
            evap_water_flow_rate REAL,
            power REAL,
            efficiency REAL,
            cooling_rate REAL
        )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_chiller_time ON ts_chillers(timestamp, device_id)')

        # 2. Pump
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ts_pumps (
            timestamp DATETIME,
            device_id TEXT,
            pump_type TEXT,
            status_read BOOLEAN,
            frequency_read REAL,
            power REAL,
            efficiency REAL
        )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_pump_time ON ts_pumps(timestamp, device_id)')

        # 3. Cooling Tower
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ts_cooling_towers (
            timestamp DATETIME,
            device_id TEXT,
            status_read BOOLEAN,
            frequency_read REAL,
            power REAL,
            efficiency REAL
        )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_ct_time ON ts_cooling_towers(timestamp, device_id)')

        # 4. AHU
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ts_ahus (
            timestamp DATETIME,
            device_id TEXT,
            status_read BOOLEAN,
            room_temperature REAL,
            setpoint REAL,
            humidity REAL,
            power REAL
        )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_ahu_time ON ts_ahus(timestamp, device_id)')

        # 5. VAV
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ts_vavs (
            timestamp DATETIME,
            device_id TEXT,
            damper_position REAL,
            air_flow_rate REAL
        )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_vav_time ON ts_vavs(timestamp, device_id)')

        # 6. IAQ
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ts_iaq (
            timestamp DATETIME,
            device_id TEXT,
            temperature REAL,
            humidity REAL,
            co2 REAL,
            pm25 REAL
        )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_iaq_time ON ts_iaq(timestamp, device_id)')

        # 7. Weather
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ts_weather (
            timestamp DATETIME,
            device_id TEXT,
            drybulb_temperature REAL,
            humidity REAL,
            wetbulb_temperature REAL
        )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_weather_time ON ts_weather(timestamp, device_id)')

        # 8. Power Meter
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ts_power_meters (
            timestamp DATETIME,
            device_id TEXT,
            voltage_LL_average REAL,
            current REAL,
            power REAL,
            energy REAL,
            power_factor REAL
        )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_power_time ON ts_power_meters(timestamp, device_id)')

        conn.commit()
    logger.info("Database schemas initialized.")
