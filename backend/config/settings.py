"""
Application Settings — loaded from environment variables with sensible defaults.
"""
import os

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./iotdb.sqlite3")

# ─── MQTT Broker ──────────────────────────────────────────────────────────────
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))

# ─── Simulator ────────────────────────────────────────────────────────────────
# Interval in seconds between each simulation tick
SIMULATOR_INTERVAL = float(os.getenv("SIMULATOR_INTERVAL", "5.0"))

# ─── API ──────────────────────────────────────────────────────────────────────
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# ─── Building ─────────────────────────────────────────────────────────────────
BUILDING_NAME = "AltoTech Demo Building"
BUILDING_FLOORS = 4
TOTAL_COOLING_CAPACITY_RT = 1500  # Bangkok commercial building
