# IoT Building Automation System — Practical Assessment

A fully containerized **Building Automation System (BAS)** simulation for a 4-floor commercial building in Bangkok. The system simulates 50+ IoT field devices using **BACnet/IP**, **Modbus TCP**, and **MQTT** protocols, ingests telemetry through a central MQTT broker, persists data into a time-series SQLite database, and visualizes everything on a real-time web dashboard.

> **AltoTech Global — IoT Engineer Practical Assessment**

---

## Table of Contents

- [Quick Start](#quick-start)
- [System Architecture](#system-architecture)
- [Network Diagram](#network-diagram)
- [Technology Choices](#technology-choices)
- [Building & Equipment Specification](#building--equipment-specification)
- [Data Point Configuration](#data-point-configuration)
- [Web Dashboard](#web-dashboard)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [MQTT Topics](#mqtt-topics)

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Run

```bash
git clone <repository-url>
cd IOTE-Practical-Assessment
docker-compose up -d --build
```

This starts **3 containers**:

| Container        | Service         | Port  | Description                        |
|------------------|-----------------|-------|------------------------------------|
| `iot_mosquitto`  | MQTT Broker     | 1883  | Eclipse Mosquitto 2.0              |
| `iot_backend`    | Backend API     | 8000  | FastAPI + Simulators + DB Writer   |
| `iot_frontend`   | Web Dashboard   | 3000  | Next.js Real-time Dashboard        |

### Access

| Application                | URL                                  |
|----------------------------|--------------------------------------|
| **Web Dashboard**          | http://localhost:3000                 |
| **API Documentation (Swagger)** | http://localhost:8000/docs       |
| **MQTT Broker**            | `localhost:1883` (use [MQTT Explorer](http://mqtt-explorer.com/)) |

### Stop

```bash
docker-compose down
```

---

## System Architecture

The data flows from simulated field devices through the IoT platform to the web dashboard:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Field Devices (Simulated)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐     │
│  │  BACnet/IP   │  │  Modbus TCP  │  │        MQTT            │     │
│  │  Chillers    │  │  Pumps       │  │  IAQ Sensors           │     │
│  │  VAVs        │  │  Power Meters│  │                        │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘     │
│         │                 │                      │                  │
└─────────┼─────────────────┼──────────────────────┼──────────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
    ┌─────────────────────────────────────────────────────┐
    │              MQTT Broker (Mosquitto)                │
    │                   Port 1883                         │
    └─────────────────────┬───────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────┐
    │              Backend (FastAPI)                      │
    │  ┌──────────────┐  ┌────────────┐  ┌────────────┐   │
    │  │  Simulator   │  │  MQTT Pub  │  │  DB Writer │   │
    │  │  Engine      │→ │  (Paho)    │  │  (SQLite)  │   │
    │  │  (Threads)   │  │            │  │            │   │
    │  └──────────────┘  └────────────┘  └────────────┘   │
    │  ┌──────────────────────────────────────────────┐   │
    │  │           REST API  (Port 8000)              │   │
    │  └──────────────────────────────────────────────┘   │
    └─────────────────────┬───────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────┐
    │           Frontend (Next.js — Port 3000)            │
    │  ┌────────────┐ ┌──────────┐ ┌────────────────┐     │
    │  │ Dashboard  │ │ Chiller  │ │ Air Distrib.   │     │
    │  │ (KPIs+IAQ) │ │ Plant    │ │ (AHU+VAV)      │     │
    │  └────────────┘ └──────────┘ └────────────────┘     │
    │  ┌────────────────────────────────────────────┐     │
    │  │         Electrical Distribution            │     │
    │  └────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
```

> See `docs/system_stack_diagram.png` for the detailed architecture diagram.

---

## Network Diagram

All simulated devices are assigned mock IP addresses, ports, and protocol labels, replicating a realistic building IoT network.

| Subnet           | Protocol     | Devices                                         |
|------------------|--------------|-------------------------------------------------|
| `192.168.1.x`    | BACnet/IP    | Chillers (`.10-.12`), AHUs (`.50-.53`)          |
| `192.168.1.x`    | Modbus TCP   | CHP (`.20-.22`), CDP (`.30-.32`), CT (`.40-.42`)|
| `192.168.2.x`    | BACnet/IP    | VAVs — 16 units (`.1-.16`)                      |
| `192.168.3.x`    | MQTT         | IAQ Sensors (`.1-.8`), Weather Station (`.9`)   |
| `192.168.4.x`    | Modbus TCP   | Power Meters — 21 units (`.1-.21`)              |

> See `docs/network_diagram.png` for the full network topology diagram.

---

## Technology Choices

| Layer            | Technology             | Justification                                                                 |
|------------------|------------------------|-------------------------------------------------------------------------------|
| **Broker**       | Eclipse Mosquitto 2.0  | Industry-standard lightweight MQTT broker, ideal for IoT edge deployments     |
| **Backend**      | Python 3.11 + FastAPI  | Async-capable, auto-generated OpenAPI docs, native Pydantic validation        |
| **Simulation**   | Python threading       | Lightweight concurrent simulation of 50+ devices without external deps       |
| **MQTT Client**  | Paho-MQTT              | De facto Python MQTT library with full QoS support                            |
| **Database**     | SQLite                 | Zero-config embedded DB, perfect for time-series logging in single-node setups|
| **Frontend**     | Next.js 16 + React 19  | App Router with server components, optimized polling for real-time updates    |
| **Styling**      | Tailwind CSS 4         | Utility-first CSS for rapid, consistent UI development                        |
| **Charts**       | Recharts               | Composable React charting library for data visualization                      |
| **Containerization** | Docker Compose     | Single-command deployment of the full 3-service stack                         |

---

## Building & Equipment Specification

This simulation models a **4-floor commercial building** configured for Bangkok's tropical climate.

### 1. Chiller Plant (BACnet/IP)

| Equipment              | Qty | Specs                                  |
|------------------------|-----|----------------------------------------|
| Chillers (York/Carrier)| 3   | 500 RT each, R-134a, ~0.55 kW/RT      |
| Chilled Water Pumps    | 3   | 37 kW, 1200 GPM, VSD                  |
| Condenser Water Pumps  | 3   | 55 kW, 1500 GPM, VSD                  |
| Cooling Towers         | 3   | 2 cells each, 5.5 kW/cell fan         |

### 2. Air Distribution (BACnet/IP)

| Equipment              | Qty | Distribution        |
|------------------------|-----|---------------------|
| Air Handling Units     | 4   | 1 per floor         |
| Variable Air Volume    | 16  | 4 per floor         |

### 3. Environmental Monitoring (MQTT)

| Equipment              | Qty | Distribution        |
|------------------------|-----|---------------------|
| IAQ Sensors            | 8   | 2 per floor         |
| Outdoor Weather Station| 1   | Rooftop             |

### 4. Electrical Metering (Modbus TCP)

| Meter Type             | Qty | Coverage                              |
|------------------------|-----|---------------------------------------|
| Main Building Meter    | 1   | Total building power consumption      |
| Floor Sub-Meters       | 4   | 1 per floor (Floor 1–4)              |
| Chiller Sub-Meters     | 3   | 1 per chiller (CH-1, CH-2, CH-3)    |
| CHP Sub-Meters         | 3   | 1 per chilled water pump             |
| CDP Sub-Meters         | 3   | 1 per condenser water pump           |
| CT Sub-Meters          | 3   | 1 per cooling tower                  |
| AHU Sub-Meters         | 4   | 1 per AHU                            |

**Total: 21 power meters**

---

## Data Point Configuration

### Chiller Monitoring Points

| Point Name                          | Description                              |
|-------------------------------------|------------------------------------------|
| `evap_leaving_water_temperature`    | Chilled water supply temperature (°F)    |
| `evap_entering_water_temperature`   | Chilled water return temperature (°F)    |
| `evap_water_flow_rate`              | Evaporator water flow (GPM)              |
| `evap_sat_refrig_temperature`       | Saturated refrigerant temperature (°F)   |
| `evap_water_delta_temperature`      | Supply/return temperature difference (°F)|
| `evap_approach_temperature`         | Approach temperature (°F)                |
| `status_read` / `status_write`      | Running status / Start-stop command      |
| `power`                             | Electrical power consumption (kW)        |
| `alarm`                             | Alarm status                             |
| `percentage_rla`                    | Percentage of rated load amps (%)        |
| `efficiency`                        | Current operating efficiency (kW/RT)     |
| `cooling_rate`                      | Current cooling output (RT)              |

### Pump & Cooling Tower Points

| Point Name                     | Description                     |
|--------------------------------|---------------------------------|
| `status_read` / `status_write` | Running status / Command        |
| `alarm`                        | Alarm status                    |
| `frequency_read` / `frequency_write` | VSD frequency feedback/command (Hz) |
| `power`                        | Power consumption (kW)          |
| `efficiency`                   | Operating efficiency            |

### AHU Monitoring Points

| Point Name           | Description                          |
|----------------------|--------------------------------------|
| `room_temperature`   | Zone temperature (°C)                |
| `setpoint`           | Temperature setpoint (°C)            |
| `status_read`        | Running status (on/off)              |
| `humidity`           | Zone relative humidity (%RH)         |
| `alarm`              | Alarm status                         |
| `power`              | Power consumption (kW)               |

### VAV Control Points

| Point Name        | Description                          |
|-------------------|--------------------------------------|
| `damper_position` | Current damper position (%)          |
| `air_flow_rate`   | Measured air flow rate (CFM)         |

### IAQ Sensor Points

| Point Name    | Description                          |
|---------------|--------------------------------------|
| `temperature` | Room temperature (°C)                |
| `humidity`    | Relative humidity (%RH)              |
| `co2`         | CO₂ concentration (ppm)              |
| `pm25`        | PM2.5 particulate matter (µg/m³)     |

### Outdoor Weather Station Points

| Point Name             | Description                     |
|------------------------|---------------------------------|
| `drybulb_temperature`  | Dry-bulb temperature (°C)       |
| `humidity`             | Relative humidity (%RH)         |
| `wetbulb_temperature`  | Wet-bulb temperature (°C)       |

### Digital Power Meter Points

| Point Name           | Description                              |
|----------------------|------------------------------------------|
| `voltage_LL_average` | Average line-to-line voltage (V)         |
| `current`            | Total current draw (A)                   |
| `power`              | Active power consumption (kW)            |
| `energy`             | Cumulative energy consumption (kWh)      |
| `power_factor`       | Power factor (0–1)                       |

---

## Web Dashboard

The frontend provides 4 main pages:

### 1. Main Dashboard (`/`)
- Building efficiency and performance KPIs (total power kW, energy kWh, cooling RT, efficiency kW/RT)
- Indoor Air Quality analytics: max, min, average per floor (temperature, humidity, CO₂, PM2.5)
- Outdoor weather conditions

### 2. Chiller Plant Management (`/chiller-plant`)
- Real-time equipment operational status and power consumption for all chillers, pumps, and cooling towers
- System efficiency metrics (kW/RT) for all chiller plant subsystems
- BTU meter data: supply/return temperatures, flow rates, cooling loads

### 3. Air Distribution System (`/air-distribution`)
- Floor-specific AHU and VAV operational status (On/Off, Alarm)
- Zone-level environmental averages (temperature, humidity)

### 4. Electrical Distribution (`/electrical`)
- Comprehensive power consumption analytics with main building meter
- Consumption breakdown per floor
- Individual equipment power and energy monitoring

---

## Project Structure

```
IOTE-Practical-Assessment/
├── backend/
│   ├── api/                        # REST API endpoints
│   │   ├── dashboard.py            #   Main dashboard summary
│   │   ├── chiller_plant.py        #   Chiller plant status
│   │   ├── air_distribution.py     #   Air distribution data
│   │   ├── electrical.py           #   Electrical distribution
│   │   └── health.py               #   Health check
│   ├── config/
│   │   ├── settings.py             #   App configuration
│   │   └── device_registry.py      #   All device IPs, ports, protocols
│   ├── database/
│   │   ├── connection.py           #   SQLite schema & connection
│   │   └── writer.py               #   Background DB writer thread
│   ├── simulator/
│   │   ├── base_simulator.py       #   Shared state & helpers
│   │   ├── chiller_simulator.py    #   3× chiller simulation
│   │   ├── pump_simulator.py       #   CHP & CDP pump simulation
│   │   ├── cooling_tower_simulator.py  # CT simulation
│   │   ├── ahu_simulator.py        #   AHU simulation
│   │   ├── vav_simulator.py        #   VAV simulation
│   │   ├── iaq_simulator.py        #   IAQ sensor simulation
│   │   ├── weather_simulator.py    #   Weather station simulation
│   │   ├── power_meter_simulator.py    # 21 power meter simulation
│   │   ├── mqtt_publisher.py       #   MQTT publish daemon
│   │   └── runner.py               #   Orchestrator for all simulators
│   ├── main.py                     # FastAPI entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── page.tsx            #   Main dashboard
│   │   │   ├── chiller-plant/      #   Chiller plant page
│   │   │   ├── air-distribution/   #   Air distribution page
│   │   │   └── electrical/         #   Electrical page
│   │   ├── components/             # Reusable UI components
│   │   └── lib/
│   │       └── api.ts              # API client & TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── network_diagram.png         # Physical network topology
│   ├── system_stack_diagram.png    # Software architecture diagram
│   └── IoT_Engineer_Assessment.pdf # Assessment requirements
├── infra/
│   └── mosquitto/
│       └── mosquitto.conf          # Broker configuration
├── docker-compose.yml              # Full-stack orchestration
└── README.md                       # This file
```

---

## API Endpoints

| Method | Path                  | Description                                   |
|--------|-----------------------|-----------------------------------------------|
| GET    | `/api/dashboard`      | Building KPIs, IAQ analytics, weather          |
| GET    | `/api/chiller-plant`  | Chiller plant equipment status & efficiency    |
| GET    | `/api/air-distribution` | AHU/VAV status per floor                     |
| GET    | `/api/electrical`     | Power meter readings & floor breakdown         |
| GET    | `/api/health`         | Service health check                           |
| GET    | `/docs`               | Interactive Swagger API documentation          |

---

## MQTT Topics

All device telemetry is published to the Mosquitto broker under structured topics:

| Topic Pattern                             | Protocol   | Devices         |
|-------------------------------------------|------------|-----------------|
| `building/bacnet/chiller/{id}`            | BACnet/IP  | CH-1, CH-2, CH-3|
| `building/bacnet/ahu/{id}`                | BACnet/IP  | AHU-F1 to AHU-F4|
| `building/bacnet/vav/{id}`                | BACnet/IP  | VAV-F1-1 to F4-4|
| `building/modbus/pump/chw/{id}`           | Modbus TCP | CHP-1 to CHP-3  |
| `building/modbus/pump/cdw/{id}`           | Modbus TCP | CDP-1 to CDP-3  |
| `building/modbus/cooling_tower/{id}`      | Modbus TCP | CT-1 to CT-3    |
| `building/modbus/power_meter/{id}`        | Modbus TCP | PM-MAIN + subs  |
| `building/mqtt/iaq/{id}`                  | MQTT       | IAQ-F1A to F4B  |
| `building/mqtt/weather/{id}`              | MQTT       | WS-ROOF         |

---

## License

This project was developed as part of the AltoTech Global IoT Engineer Practical Assessment.
