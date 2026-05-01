import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.simulator.runner import start_simulation, stop_simulation
from backend.database.writer import start_db_writer, stop_db_writer

from backend.api.dashboard import router as dashboard_router
from backend.api.chiller_plant import router as chiller_router
from backend.api.air_distribution import router as air_router
from backend.api.electrical import router as electrical_router
from backend.api.history import router as history_router

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger("backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    logger.info("Starting background services...")
    start_simulation()
    start_db_writer()
    yield
    # Shutdown event
    logger.info("Stopping background services...")
    stop_db_writer()
    stop_simulation()

app = FastAPI(title="IoT Assessment API", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard_router, prefix='/api/dashboard', tags=["Dashboard"])
app.include_router(chiller_router, prefix='/api/chiller-plant', tags=["Chiller Plant"])
app.include_router(air_router, prefix='/api/air-distribution', tags=["Air Distribution"])
app.include_router(electrical_router, prefix='/api/electrical', tags=["Electrical"])
app.include_router(history_router, prefix='/api/history', tags=["History"])

@app.get('/api/health')
def health_check():
    return {"status": "ok", "message": "FastAPI and simulators are running"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
