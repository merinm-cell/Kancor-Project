from fastapi import FastAPI
import paho.mqtt.client as mqtt
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from zoneinfo import ZoneInfo



app = FastAPI()
DATABASE_URL = "sqlite:///./temperatures.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class Temperature(Base):
    __tablename__ = "temperatures"
    id = Column(Integer, primary_key=True, index=True) #auto incrementing id
    value = Column(Float)    #store the actual temperature value.
    timestamp = Column(DateTime, default=datetime.utcnow)   #store the time the temperature was received.

Base.metadata.create_all(bind=engine)


# --- MQTT Configuration ---
broker_address = "test.mosquitto.org"
topic = "project"

#runs when connected to the MQTT broker
def on_connect(client, userdata, flags, rc):     
    print("✅ Connected to MQTT broker with result code " + str(rc))
    client.subscribe(topic)

#runs when a message is received.
def on_message(client, userdata, msg):   
    value = msg.payload.decode()

    try:
        temp_value = float(value.split('=')[-1].strip())  # Extract number like 33.5
        db = SessionLocal()
        db.add(Temperature(value=temp_value))
        db.commit()
        db.close()
        print(f"📡 Stored temperature: {temp_value}")
    except Exception as e:
        print(f"❌ Error parsing/storing data: {e}")


# --- Set up MQTT Client ---
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(broker_address, 1883, 60)

# --- Start MQTT loop in background ---
mqtt_client.loop_start()

# --- Just a test route to check if backend is working ---
@app.get("/")
def home():
    return {"message": "FastAPI + MQTT backend is running 🚀"}


@app.get("/temperatures")
def get_temperatures():
    db = SessionLocal()
    temps = db.query(Temperature).all()
    db.close()
    return [
        {
            "id": t.id,
            "value": t.value,
            "timestamp": t.timestamp.replace(tzinfo=ZoneInfo("UTC")).astimezone(ZoneInfo("Asia/Kolkata")).isoformat()
        }
        for t in temps
    ]

@app.get("/test-create-db")
def create_db():
    db = SessionLocal()
    db.add(Temperature(value=60.0))
    db.commit()
    db.close()
    return {"message": "DB file created with sample value ✅"}
