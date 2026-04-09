"""
Simulator Runner — Orchestrates the background simulation tick loop.
"""

import time
import threading
import logging
from ..config import settings
from . import (
    chiller_simulator,
    pump_simulator,
    cooling_tower_simulator,
    ahu_simulator,
    vav_simulator,
    iaq_simulator,
    weather_simulator,
    power_meter_simulator,
)

logger = logging.getLogger(__name__)

# Track thread status
_stop_event = threading.Event()
_runner_thread = None


def _initialize_all():
    """Call initialize() on all simulators."""
    chiller_simulator.initialize()
    pump_simulator.initialize()
    cooling_tower_simulator.initialize()
    ahu_simulator.initialize()
    vav_simulator.initialize()
    iaq_simulator.initialize()
    weather_simulator.initialize()
    power_meter_simulator.initialize()
    logger.info("All simulators initialized with base states.")


def _tick_all():
    """Call tick() on all simulators to drift data."""
    try:
        chiller_simulator.tick()
        pump_simulator.tick()
        cooling_tower_simulator.tick()
        ahu_simulator.tick()
        vav_simulator.tick()
        iaq_simulator.tick()
        weather_simulator.tick()
        power_meter_simulator.tick() # Must run last to sum up powers correctly
    except Exception as e:
        logger.error(f"Error during simulation tick: {e}")


from .mqtt_publisher import connect_mqtt, publish_state, disconnect_mqtt
from .base_simulator import SHARED_STATE

def _simulation_loop():
    """Main loop executing ticks."""
    logger.info(f"Starting simulation loop (Interval: {settings.SIMULATOR_INTERVAL}s)")
    connect_mqtt()
    while not _stop_event.is_set():
        _tick_all()
        publish_state(SHARED_STATE) # Publish new data to MQTT Broker
        # Sleep for SIMULATOR_INTERVAL, checking stop event periodically
        _stop_event.wait(settings.SIMULATOR_INTERVAL)
    disconnect_mqtt()
    logger.info("Simulation loop stopped.")


def start_simulation() -> None:
    """Initialize state and start the background ticker thread."""
    global _runner_thread
    if _runner_thread is not None and _runner_thread.is_alive():
        logger.warning("Simulation is already running.")
        return

    _initialize_all()
    _stop_event.clear()
    
    _runner_thread = threading.Thread(target=_simulation_loop, daemon=True, name="SimLoopThread")
    _runner_thread.start()


def stop_simulation() -> None:
    """Stop the background ticker thread."""
    global _runner_thread
    if _runner_thread is not None:
        _stop_event.set()
        _runner_thread.join(timeout=2.0)
        _runner_thread = None
