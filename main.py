from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from sqlalchemy import create_engine, Column, Integer, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Set
import paho.mqtt.client as mqtt
import ssl
import asyncio
import logging
import queue
import threading
import smtplib
from email.message import EmailMessage
import time
import os
from fastapi.middleware.cors import CORSMiddleware

ALERT_LOW = 7.0
ALERT_HIGH = 10.0

SMTP_EMAIL = "nora.antu2001@gmail.com"
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "ewnb rcya qqxo qyow")
SMTP_TO = "22cs349@mgits.ac.in"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
DATABASE_URL = "sqlite:///./temperature.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class Temperature(Base):
    __tablename__ = "temperature"
    id = Column(Integer, primary_key=True, index=True)
    value = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")))

Base.metadata.create_all(bind=engine)

# --- Database Cleanup ---
MAX_DB_SIZE_MB = 100  # Max database size in MB
MIN_RECORDS = 1000    # Minimum records to keep
MAX_AGE_DAYS = 7      # Maximum age of records to keep

def cleanup_database():
    """Periodically check and clean up the database if it exceeds size limit."""
    db_path = "temperature.db"
    while True:
        try:
            if os.path.exists(db_path):
                db_size_mb = os.path.getsize(db_path) / (1024 * 1024)  # Convert bytes to MB
                logger.info(f"Database size: {db_size_mb:.2f} MB")
                if db_size_mb > MAX_DB_SIZE_MB:
                    logger.info(f"Database size exceeds {MAX_DB_SIZE_MB} MB. Cleaning up...")
                    with SessionLocal() as db:
                        # Delete records older than MAX_AGE_DAYS, keeping at least MIN_RECORDS
                        cutoff_time = datetime.now(ZoneInfo("Asia/Kolkata")) - timedelta(days=MAX_AGE_DAYS)
                        query = db.query(Temperature).filter(Temperature.timestamp < cutoff_time)
                        if db.query(Temperature).count() > MIN_RECORDS:
                            deleted = query.delete()
                            db.commit()
                            logger.info(f"Deleted {deleted} old records.")
                        else:
                            logger.info(f"Retaining {MIN_RECORDS} records, skipping cleanup.")
                else:
                    logger.debug("Database size within limit, no cleanup needed.")
            else:
                logger.warning("Database file not found.")
        except Exception as e:
            logger.error(f"Database cleanup error: {e}", exc_info=True)
        time.sleep(3600)  # Check every hour

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_database, daemon=True)
cleanup_thread.start()

# --- WebSocket Setup ---
connected_clients: Set[WebSocket] = set()
message_queue = queue.Queue()

@app.websocket("/ws/temperature")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            try:
                temp_data = message_queue.get_nowait()
                await websocket.send_json(temp_data)
            except queue.Empty:
                await asyncio.sleep(0.2)
            except Exception as e:
                logger.error(f"WebSocket send error: {e}")
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        logger.info("WebSocket client disconnected")
    except Exception as e:
        connected_clients.remove(websocket)
        logger.error(f"WebSocket error: {e}")

# --- API Endpoints ---
@app.get("/")
async def home():
    try:
        return {"message": "FastAPI + HiveMQ MQTT backend is running 🚀"}
    except Exception as e:
        logger.error(f"Error in root endpoint: {e}", exc_info=True)
        raise

@app.get("/temperature")
async def get_temperatures():
    try:
        with SessionLocal() as db:
            temps = db.query(Temperature).all()
            return [
                {
                    "id": t.id,
                    "value": t.value,
                    "timestamp": t.timestamp.replace(tzinfo=ZoneInfo("UTC"))
                        .astimezone(ZoneInfo("Asia/Kolkata")).isoformat()
                }
                for t in temps
            ]
    except Exception as e:
        logger.error(f"Error fetching temperatures: {e}", exc_info=True)
        raise

@app.get("/temperature-history")
async def get_temperature_history():
    try:
        with SessionLocal() as db:
            temps = db.query(Temperature).all()
            return [
                {
                    "value": t.value,
                    "timestamp": t.timestamp.isoformat()
                }
                for t in temps
            ]
    except Exception as e:
        logger.error(f"Error fetching temperature history: {e}", exc_info=True)
        raise

# --- HiveMQ Cloud MQTT Configuration ---
broker_address = "06447fd0d33a4be69d6f7bc3c427e716.s1.eu.hivemq.cloud"
port = 8883
topic = "sensor/temperature"
username = os.getenv("MQTT_USERNAME", "subsciber_kancor")
password = os.getenv("MQTT_PASSWORD", "#Kancor213")
client_id = f"FastAPI-Backend-{int(time.time())}"

# --- MQTT Callback Handlers ---
def send_temperature_alert(temp_value: float):
    subject = "🚨 Temperature Alert"
    body = f"Alert! Temperature is out of safe range: {temp_value}°C.\nSafe Range: {ALERT_LOW}°C to {ALERT_HIGH}°C."

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = SMTP_TO
    msg.set_content(body)

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=ssl.create_default_context()) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("📧 Alert email sent successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to send alert email: {e}", exc_info=True)

def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        logger.info("✅ Connected to HiveMQ Cloud")
        client.subscribe(topic, qos=1)
    else:
        logger.error(f"❌ Connection failed with code {reason_code}: {mqtt.error_string(reason_code)}")

def on_message(client, userdata, msg):
    try:
        value = msg.payload.decode()
        temp_value = float(value.strip())
        logger.info(f"📡 Stored temperature: {temp_value}")

        # Save to DB
        with SessionLocal() as db:
            db.add(Temperature(value=temp_value))
            db.commit()

        # WebSocket broadcast
        message_queue.put({
            "value": temp_value,
            "timestamp": datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()
        })

        # Alert check
        if temp_value < ALERT_LOW or temp_value > ALERT_HIGH:
            send_temperature_alert(temp_value)

    except ValueError as e:
        logger.error(f"❌ Invalid payload: {value}, error: {e}", exc_info=True)
    except Exception as e:
        logger.error(f"❌ Error processing message: {e}", exc_info=True)

def on_disconnect(client, userdata, disconnect_flags, reason_code, properties=None):
    logger.warning(f"Disconnected with code {reason_code}: {mqtt.error_string(reason_code)}. Reconnecting...")
    if reason_code != 0:
        while not client.is_connected():
            try:
                client.reconnect()
                logger.info("✅ Reconnected to HiveMQ Cloud")
                break
            except Exception as e:
                logger.error(f"Reconnection failed: {e}. Retrying in 5 seconds...", exc_info=True)
                time.sleep(5)

# --- Set up MQTT Client ---
mqtt_client = mqtt.Client(client_id=client_id, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.username_pw_set(username, password)
mqtt_client.tls_set(tls_version=ssl.PROTOCOL_TLSv1_2)
mqtt_client.tls_insecure_set(False)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.on_disconnect = on_disconnect
mqtt_client.on_log = lambda client, userdata, level, buf: logger.debug(f"MQTT log: {buf}")

try:
    mqtt_client.connect(broker_address, port, keepalive=120)
    mqtt_client.loop_start()
except Exception as e:
    logger.error(f"❌ Failed to connect to MQTT broker: {e}", exc_info=True)

# --- Shutdown Handler ---
@app.on_event("shutdown")
def shutdown_event():
    logger.info("Stopping MQTT client...")
    try:
        mqtt_client.loop_stop()
        mqtt_client.disconnect()
    except Exception as e:
        logger.error(f"Error stopping MQTT client: {e}", exc_info=True)
    try:
        engine.dispose()
    except Exception as e:
        logger.error(f"Error disposing database engine: {e}", exc_info=True)
    logger.info("FastAPI shutdown complete")