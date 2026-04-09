"""
Device Registry — Mock IP addresses, Ports, Device IDs, and Protocol labels
for all IoT devices in the 4-floor commercial building.
"""

# ─── BACnet/IP Devices ────────────────────────────────────────────────────────
BACNET_PORT = 47808  # UDP

CHILLERS = [
    {"id": "CH-1", "ip": "192.168.1.10", "port": BACNET_PORT, "device_id": 1001, "protocol": "BACnet/IP", "capacity_rt": 500, "power_kw": 273},
    {"id": "CH-2", "ip": "192.168.1.11", "port": BACNET_PORT, "device_id": 1002, "protocol": "BACnet/IP", "capacity_rt": 500, "power_kw": 273},
    {"id": "CH-3", "ip": "192.168.1.12", "port": BACNET_PORT, "device_id": 1003, "protocol": "BACnet/IP", "capacity_rt": 500, "power_kw": 273},
]

AHUS = [
    {"id": "AHU-F1", "ip": "192.168.1.50", "port": BACNET_PORT, "device_id": 2001, "protocol": "BACnet/IP", "floor": 1},
    {"id": "AHU-F2", "ip": "192.168.1.51", "port": BACNET_PORT, "device_id": 2002, "protocol": "BACnet/IP", "floor": 2},
    {"id": "AHU-F3", "ip": "192.168.1.52", "port": BACNET_PORT, "device_id": 2003, "protocol": "BACnet/IP", "floor": 3},
    {"id": "AHU-F4", "ip": "192.168.1.53", "port": BACNET_PORT, "device_id": 2004, "protocol": "BACnet/IP", "floor": 4},
]

VAVS = [
    # Floor 1 — VAV-F1-1 to VAV-F1-4
    {"id": "VAV-F1-1", "ip": "192.168.2.1",  "port": BACNET_PORT, "device_id": 3001, "protocol": "BACnet/IP", "floor": 1, "zone": "1A"},
    {"id": "VAV-F1-2", "ip": "192.168.2.2",  "port": BACNET_PORT, "device_id": 3002, "protocol": "BACnet/IP", "floor": 1, "zone": "1B"},
    {"id": "VAV-F1-3", "ip": "192.168.2.3",  "port": BACNET_PORT, "device_id": 3003, "protocol": "BACnet/IP", "floor": 1, "zone": "1C"},
    {"id": "VAV-F1-4", "ip": "192.168.2.4",  "port": BACNET_PORT, "device_id": 3004, "protocol": "BACnet/IP", "floor": 1, "zone": "1D"},
    # Floor 2
    {"id": "VAV-F2-1", "ip": "192.168.2.5",  "port": BACNET_PORT, "device_id": 3005, "protocol": "BACnet/IP", "floor": 2, "zone": "2A"},
    {"id": "VAV-F2-2", "ip": "192.168.2.6",  "port": BACNET_PORT, "device_id": 3006, "protocol": "BACnet/IP", "floor": 2, "zone": "2B"},
    {"id": "VAV-F2-3", "ip": "192.168.2.7",  "port": BACNET_PORT, "device_id": 3007, "protocol": "BACnet/IP", "floor": 2, "zone": "2C"},
    {"id": "VAV-F2-4", "ip": "192.168.2.8",  "port": BACNET_PORT, "device_id": 3008, "protocol": "BACnet/IP", "floor": 2, "zone": "2D"},
    # Floor 3
    {"id": "VAV-F3-1", "ip": "192.168.2.9",  "port": BACNET_PORT, "device_id": 3009, "protocol": "BACnet/IP", "floor": 3, "zone": "3A"},
    {"id": "VAV-F3-2", "ip": "192.168.2.10", "port": BACNET_PORT, "device_id": 3010, "protocol": "BACnet/IP", "floor": 3, "zone": "3B"},
    {"id": "VAV-F3-3", "ip": "192.168.2.11", "port": BACNET_PORT, "device_id": 3011, "protocol": "BACnet/IP", "floor": 3, "zone": "3C"},
    {"id": "VAV-F3-4", "ip": "192.168.2.12", "port": BACNET_PORT, "device_id": 3012, "protocol": "BACnet/IP", "floor": 3, "zone": "3D"},
    # Floor 4
    {"id": "VAV-F4-1", "ip": "192.168.2.13", "port": BACNET_PORT, "device_id": 3013, "protocol": "BACnet/IP", "floor": 4, "zone": "4A"},
    {"id": "VAV-F4-2", "ip": "192.168.2.14", "port": BACNET_PORT, "device_id": 3014, "protocol": "BACnet/IP", "floor": 4, "zone": "4B"},
    {"id": "VAV-F4-3", "ip": "192.168.2.15", "port": BACNET_PORT, "device_id": 3015, "protocol": "BACnet/IP", "floor": 4, "zone": "4C"},
    {"id": "VAV-F4-4", "ip": "192.168.2.16", "port": BACNET_PORT, "device_id": 3016, "protocol": "BACnet/IP", "floor": 4, "zone": "4D"},
]

# ─── Modbus TCP Devices ───────────────────────────────────────────────────────
MODBUS_TCP_PORT = 502

CHILLED_WATER_PUMPS = [
    {"id": "CHP-1", "ip": "192.168.1.20", "port": MODBUS_TCP_PORT, "unit_id": 1, "protocol": "Modbus TCP", "power_kw": 37, "flow_gpm": 1200},
    {"id": "CHP-2", "ip": "192.168.1.21", "port": MODBUS_TCP_PORT, "unit_id": 2, "protocol": "Modbus TCP", "power_kw": 37, "flow_gpm": 1200},
    {"id": "CHP-3", "ip": "192.168.1.22", "port": MODBUS_TCP_PORT, "unit_id": 3, "protocol": "Modbus TCP", "power_kw": 37, "flow_gpm": 1200},
]

CONDENSER_WATER_PUMPS = [
    {"id": "CDP-1", "ip": "192.168.1.30", "port": MODBUS_TCP_PORT, "unit_id": 1, "protocol": "Modbus TCP", "power_kw": 55, "flow_gpm": 1500},
    {"id": "CDP-2", "ip": "192.168.1.31", "port": MODBUS_TCP_PORT, "unit_id": 2, "protocol": "Modbus TCP", "power_kw": 55, "flow_gpm": 1500},
    {"id": "CDP-3", "ip": "192.168.1.32", "port": MODBUS_TCP_PORT, "unit_id": 3, "protocol": "Modbus TCP", "power_kw": 55, "flow_gpm": 1500},
]

COOLING_TOWERS = [
    {"id": "CT-1", "ip": "192.168.1.40", "port": MODBUS_TCP_PORT, "unit_id": 1, "protocol": "Modbus TCP", "cells": 2, "cell_power_kw": 5.5},
    {"id": "CT-2", "ip": "192.168.1.41", "port": MODBUS_TCP_PORT, "unit_id": 2, "protocol": "Modbus TCP", "cells": 2, "cell_power_kw": 5.5},
    {"id": "CT-3", "ip": "192.168.1.42", "port": MODBUS_TCP_PORT, "unit_id": 3, "protocol": "Modbus TCP", "cells": 2, "cell_power_kw": 5.5},
]

# ─── Power Meters (Modbus TCP) ────────────────────────────────────────────────
POWER_METERS = [
    # Main Building Meter
    {"id": "PM-MAIN",  "ip": "192.168.4.1",  "port": MODBUS_TCP_PORT, "unit_id": 1, "protocol": "Modbus TCP", "coverage": "Total Building"},
    # Floor Sub-Meters
    {"id": "PM-F1",    "ip": "192.168.4.2",  "port": MODBUS_TCP_PORT, "unit_id": 2, "protocol": "Modbus TCP", "coverage": "Floor 1"},
    {"id": "PM-F2",    "ip": "192.168.4.3",  "port": MODBUS_TCP_PORT, "unit_id": 3, "protocol": "Modbus TCP", "coverage": "Floor 2"},
    {"id": "PM-F3",    "ip": "192.168.4.4",  "port": MODBUS_TCP_PORT, "unit_id": 4, "protocol": "Modbus TCP", "coverage": "Floor 3"},
    {"id": "PM-F4",    "ip": "192.168.4.5",  "port": MODBUS_TCP_PORT, "unit_id": 5, "protocol": "Modbus TCP", "coverage": "Floor 4"},
    # Chiller Sub-Meters
    {"id": "PM-CH1",   "ip": "192.168.4.6",  "port": MODBUS_TCP_PORT, "unit_id": 6, "protocol": "Modbus TCP", "coverage": "Chiller CH-1"},
    {"id": "PM-CH2",   "ip": "192.168.4.7",  "port": MODBUS_TCP_PORT, "unit_id": 7, "protocol": "Modbus TCP", "coverage": "Chiller CH-2"},
    {"id": "PM-CH3",   "ip": "192.168.4.8",  "port": MODBUS_TCP_PORT, "unit_id": 8, "protocol": "Modbus TCP", "coverage": "Chiller CH-3"},
    # CHP Sub-Meters
    {"id": "PM-CHP1",  "ip": "192.168.4.9",  "port": MODBUS_TCP_PORT, "unit_id": 9, "protocol": "Modbus TCP", "coverage": "CHP-1"},
    {"id": "PM-CHP2",  "ip": "192.168.4.10", "port": MODBUS_TCP_PORT, "unit_id": 10, "protocol": "Modbus TCP", "coverage": "CHP-2"},
    {"id": "PM-CHP3",  "ip": "192.168.4.11", "port": MODBUS_TCP_PORT, "unit_id": 11, "protocol": "Modbus TCP", "coverage": "CHP-3"},
    # CDP Sub-Meters
    {"id": "PM-CDP1",  "ip": "192.168.4.12", "port": MODBUS_TCP_PORT, "unit_id": 12, "protocol": "Modbus TCP", "coverage": "CDP-1"},
    {"id": "PM-CDP2",  "ip": "192.168.4.13", "port": MODBUS_TCP_PORT, "unit_id": 13, "protocol": "Modbus TCP", "coverage": "CDP-2"},
    {"id": "PM-CDP3",  "ip": "192.168.4.14", "port": MODBUS_TCP_PORT, "unit_id": 14, "protocol": "Modbus TCP", "coverage": "CDP-3"},
    # CT Sub-Meters
    {"id": "PM-CT1",   "ip": "192.168.4.15", "port": MODBUS_TCP_PORT, "unit_id": 15, "protocol": "Modbus TCP", "coverage": "CT-1"},
    {"id": "PM-CT2",   "ip": "192.168.4.16", "port": MODBUS_TCP_PORT, "unit_id": 16, "protocol": "Modbus TCP", "coverage": "CT-2"},
    {"id": "PM-CT3",   "ip": "192.168.4.17", "port": MODBUS_TCP_PORT, "unit_id": 17, "protocol": "Modbus TCP", "coverage": "CT-3"},
    # AHU Sub-Meters
    {"id": "PM-AHU1",  "ip": "192.168.4.18", "port": MODBUS_TCP_PORT, "unit_id": 18, "protocol": "Modbus TCP", "coverage": "AHU-F1"},
    {"id": "PM-AHU2",  "ip": "192.168.4.19", "port": MODBUS_TCP_PORT, "unit_id": 19, "protocol": "Modbus TCP", "coverage": "AHU-F2"},
    {"id": "PM-AHU3",  "ip": "192.168.4.20", "port": MODBUS_TCP_PORT, "unit_id": 20, "protocol": "Modbus TCP", "coverage": "AHU-F3"},
    {"id": "PM-AHU4",  "ip": "192.168.4.21", "port": MODBUS_TCP_PORT, "unit_id": 21, "protocol": "Modbus TCP", "coverage": "AHU-F4"},
]

# ─── MQTT Devices ─────────────────────────────────────────────────────────────
MQTT_BROKER = "mosquitto"
MQTT_PORT = 1883
MQTT_BASE_TOPIC = "building/alto"

IAQ_SENSORS = [
    {"id": "IAQ-F1A", "ip": "192.168.3.1", "protocol": "MQTT", "floor": 1, "zone": "A", "topic": f"{MQTT_BASE_TOPIC}/floor1/iaq/A"},
    {"id": "IAQ-F1B", "ip": "192.168.3.2", "protocol": "MQTT", "floor": 1, "zone": "B", "topic": f"{MQTT_BASE_TOPIC}/floor1/iaq/B"},
    {"id": "IAQ-F2A", "ip": "192.168.3.3", "protocol": "MQTT", "floor": 2, "zone": "A", "topic": f"{MQTT_BASE_TOPIC}/floor2/iaq/A"},
    {"id": "IAQ-F2B", "ip": "192.168.3.4", "protocol": "MQTT", "floor": 2, "zone": "B", "topic": f"{MQTT_BASE_TOPIC}/floor2/iaq/B"},
    {"id": "IAQ-F3A", "ip": "192.168.3.5", "protocol": "MQTT", "floor": 3, "zone": "A", "topic": f"{MQTT_BASE_TOPIC}/floor3/iaq/A"},
    {"id": "IAQ-F3B", "ip": "192.168.3.6", "protocol": "MQTT", "floor": 3, "zone": "B", "topic": f"{MQTT_BASE_TOPIC}/floor3/iaq/B"},
    {"id": "IAQ-F4A", "ip": "192.168.3.7", "protocol": "MQTT", "floor": 4, "zone": "A", "topic": f"{MQTT_BASE_TOPIC}/floor4/iaq/A"},
    {"id": "IAQ-F4B", "ip": "192.168.3.8", "protocol": "MQTT", "floor": 4, "zone": "B", "topic": f"{MQTT_BASE_TOPIC}/floor4/iaq/B"},
]

WEATHER_STATION = {
    "id": "WS-ROOF",
    "ip": "192.168.3.9",
    "protocol": "MQTT",
    "location": "Rooftop",
    "topic": f"{MQTT_BASE_TOPIC}/outdoor/weather",
}
