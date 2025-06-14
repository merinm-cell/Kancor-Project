import React, { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { MdWarning } from "react-icons/md";

function Graph() {
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestTemp, setLatestTemp] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // ✅ Safe range constants
  const SAFE_MIN_TEMP = 7;
  const SAFE_MAX_TEMP = 10;

  const connectWebSocket = () => {
    const wsUrl = "wss://kancor-project.onrender.com/ws/temperature";
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("🔌 WebSocket connected");
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    socketRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.value && msg.timestamp) {
          const newEntry = {
            time: new Date(msg.timestamp).toLocaleTimeString(),
            temperature: msg.value,
          };
          setLatestTemp(msg.value);
          setData((prevData) => {
            const updated = [...prevData, newEntry];
            return updated.slice(-20);
          });
        }
      } catch (e) {
        console.error("❌ Failed to parse WebSocket message:", e);
      }
    };

    socketRef.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, delay);
      } else {
        console.error("❌ Max reconnection attempts reached");
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setIsConnected(false);
      socketRef.current.close();
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // ✅ Check if temperature is outside safe range
  const isOutOfSafeRange = latestTemp !== null &&
    (latestTemp < SAFE_MIN_TEMP || latestTemp > SAFE_MAX_TEMP);

  return (
    <div style={{
      backgroundColor: "#000",
      padding: "2rem",
      borderRadius: "1rem",
      color: "white",
      fontFamily: "Arial, sans-serif",
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "2rem" }}>
        🌡 Live Temperature Graph {isConnected ? "🟢" : "🔴"}
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#fff" />
          <YAxis
            domain={[0, 30]}
            stroke="#fff"
            label={{
              value: "°C",
              angle: -90,
              position: "insideLeft",
              fill: "white",
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div style={{
                    backgroundColor: "#fff",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    color: "#000",
                  }}>
                  <p style={{ margin: 0 }}>{`Temp: ${payload[0].value} °C`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#ffffff"
            strokeWidth={4}
            dot={{ fill: "#ffffff", stroke: "#ffffff", r: 5 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* ✅ Current Temperature Display */}
      <div style={{
        marginTop: "2.5rem",
        textAlign: "center",
        fontSize: "2.5rem", // ⬅ Enlarged font
        fontWeight: "bold",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.6rem",
        color: isOutOfSafeRange ? "red" : "limegreen",
      }}>
        {latestTemp !== null && (
          <>
            {isOutOfSafeRange && <MdWarning size={32} />}
            Current Temperature: {latestTemp.toFixed(2)}°C
          </>
        )}
      </div>
    </div>
  );
}

export default Graph;
