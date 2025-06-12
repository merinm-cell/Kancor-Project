from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from sqlalchemy import create_engine, Column, Integer, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
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

ALERT_LOW = 7.0
ALERT_HIGH = 10.0

SMTP_EMAIL = "nora.antu2001@gmail.com"       # Replace with your email
SMTP_PASSWORD = "ewnb rcya qqxo qyow"        # Use an app password
SMTP_TO = "22cs349@mgits.ac.in"          # Who gets the alert
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

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

# --- WebSocket Setup ---
connected_clients: Set[WebSocket] = set()

# Thread-safe queue for WebSocket messages
message_queue = queue.Queue()

@app.websocket("/ws/temperature")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            try:
                # Check if new temperature data is in the queue
                temp_data = message_queue.get_nowait()
                await websocket.send_json(temp_data)
            except queue.Empty:
                # If no data, just wait a bit and continue
                await asyncio.sleep(0.2)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        logger.info("WebSocket client disconnected")
    except Exception as e:
        connected_clients.remove(websocket)
        logger.error(f"WebSocket error: {e}")


# --- API Endpoints ---
@app.get("/")
async def home():
    return {"message": "FastAPI + HiveMQ MQTT backend is running 🚀"}

@app.get("/temperature")
async def get_temperatures():
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



# --- HiveMQ Cloud MQTT Configuration ---
broker_address = "06447fd0d33a4be69d6f7bc3c427e716.s1.eu.hivemq.cloud"
port = 8883
topic = "sensor/temperature"
username = "subsciber_kancor"
password = "#Kancor213"
client_id = "FastAPI-Backend"

# --- MQTT Callback Handlers ---

def send_temperature_alert(temp_value: float):
    subject = "🚨 Temperature Alert"
    body = f"Alert! Temperature is out of safe range: {temp_value}°C.\n" \
           f"Safe Range: {ALERT_LOW}°C to {ALERT_HIGH}°C."

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = SMTP_TO
    msg.set_content(body)

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("📧 Alert email sent successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to send alert email: {e}")


def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        logger.info("✅ Connected to HiveMQ Cloud")
        client.subscribe(topic, qos=1)
    else:
        logger.error(f"❌ Connection failed with code {rc}")

def on_message(client, userdata, msg):
    try:
        value = msg.payload.decode()
        temp_value = float(value.strip())

        # Save to DB
        with SessionLocal() as db:
            db.add(Temperature(value=temp_value))
            db.commit()
        logger.info(f"📡 Stored temperature: {temp_value}")

        # WebSocket broadcast
        message_queue.put({
            "value": temp_value,
            "timestamp": datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()
        })


        # ALERT CHECK AND EMAIL
        if temp_value < ALERT_LOW or temp_value > ALERT_HIGH:
            send_temperature_alert(temp_value)

    except ValueError as e:
        logger.error(f"❌ Invalid payload: {value}, error: {e}")
    except Exception as e:
        logger.error(f"❌ Error processing message: {e}")


def on_disconnect(client, userdata, rc, properties=None):
    logger.warning(f"Disconnected with code {rc}. Reconnecting...")
    while not client.is_connected():
        try:
            client.reconnect()
            logger.info("Reconnected to HiveMQ Cloud")
            break
        except Exception as e:
            logger.error(f"Reconnection failed: {e}")
            time.sleep(100)

# --- Set up MQTT Client ---
mqtt_client = mqtt.Client(client_id=client_id, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.username_pw_set(username, password)
mqtt_client.tls_set(tls_version=ssl.PROTOCOL_TLSv1_2)
mqtt_client.tls_insecure_set(True)  # Temporary for testing; use CA certificate in production
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.on_disconnect = on_disconnect

# Start MQTT client
mqtt_client.connect(broker_address, port, keepalive=60)
mqtt_client.loop_start()

# --- Shutdown Handler ---
@app.on_event("shutdown")
def shutdown_event():
    logger.info("Stopping MQTT client...")
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    engine.dispose()
    logger.info("FastAPI shutdown complete")
