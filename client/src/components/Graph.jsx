import React, { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

function Graph() {
  const [data, setData] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // ⭐ Setup WebSocket connection
    socketRef.current = new WebSocket("wss://kancor-project.onrender.com/ws/temperature");

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const newEntry = {
        time: new Date(msg.timestamp).toLocaleTimeString(),
        temperature: msg.value,
      };
      setData((prevData) => {
        const updated = [...prevData, newEntry];
        return updated.slice(-20); // ⭐ Keep last 20 for live sliding effect
      });
    };

    socketRef.current.onopen = () => {
      console.log("🔌 WebSocket connected");
    };

    socketRef.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{ backgroundColor: "#000", padding: "2rem", borderRadius: "1rem" }}>
      <h2 style={{ color: "white", textAlign: "center" }}>🌡️ Live Temperature Graph</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid stroke="#333" strokeDasharray="3 3" /> {/* ⭐ Slightly dimmer grid */}
          <XAxis dataKey="time" stroke="#fff" />
          <YAxis domain={[0, 50]} stroke="#fff"
            label={{
              value: "°C",
              angle: -90,
              position: "insideLeft",
              fill: "white"
            }}
          />
          <Tooltip
  content={({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", color: "#000" }}>
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
            dot={{ fill: '#ffffff', stroke: '#ffffff', r: 5 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Graph;
