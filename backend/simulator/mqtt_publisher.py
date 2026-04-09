import paho.mqtt.client as mqtt
import json
import os

MQTT_BROKER = os.getenv("MQTT_BROKER", "127.0.0.1")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "simulator_publisher")

def connect_mqtt():
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
    except Exception as e:
        print(f"Failed to connect to MQTT broker: {e}")

def publish_state(shared_state):
    try:
        # Chillers
        for cid, state in shared_state.get("chillers", {}).items():
            client.publish(f"building/bacnet/chiller/{cid}", json.dumps(state))
        
        # Pumps
        for pid, state in shared_state.get("chilled_water_pumps", {}).items():
            client.publish(f"building/modbus/pump/chwp/{pid}", json.dumps(state))
        for pid, state in shared_state.get("condenser_water_pumps", {}).items():
            client.publish(f"building/modbus/pump/cdwp/{pid}", json.dumps(state))
            
        # Cooling Towers
        for ctid, state in shared_state.get("cooling_towers", {}).items():
            client.publish(f"building/modbus/cooling_tower/{ctid}", json.dumps(state))
            
        # AHU & VAV
        for aid, state in shared_state.get("ahus", {}).items():
            client.publish(f"building/bacnet/ahu/{aid}", json.dumps(state))
        for vid, state in shared_state.get("vavs", {}).items():
            client.publish(f"building/bacnet/vav/{vid}", json.dumps(state))
            
        # IAQ & Weather
        for iid, state in shared_state.get("iaq", {}).items():
            client.publish(f"building/mqtt/iaq/{iid}", json.dumps(state))
        for wid, state in shared_state.get("weather", {}).items():
            client.publish(f"building/mqtt/weather/{wid}", json.dumps(state))
            
        # Power Meters
        for mid, state in shared_state.get("power_meters", {}).items():
            client.publish(f"building/modbus/meter/{mid}", json.dumps(state))
            
    except Exception as e:
        print(f"Error publishing to MQTT: {e}")

def disconnect_mqtt():
    client.loop_stop()
    client.disconnect()
