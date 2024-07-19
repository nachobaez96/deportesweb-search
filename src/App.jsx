import React, { useState, useEffect } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [courts, setCourts] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (loading === "Done!") {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setLoading("");
          setFadeOut(false);
        }, 3000);
      }, 500);
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const [year, month, day] = date.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    setLoading("Logging in...");

    try {
      const response = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sport, date: formattedDate, time }),
      });

      if (!response.ok) {
        throw new Error("Error occurred while fetching data");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let result = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: !done });

        const lines = chunk.split("\n");
        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const cleanChunk = line.replace(/^data:\s*/, "");
            try {
              const parsedData = JSON.parse(cleanChunk);
              setRawData(parsedData);
              filterCourts(parsedData, time);
            } catch (err) {
              setLoading(cleanChunk);
            }
          }
        });
      }

      setLoading("Done!");
    } catch (error) {
      console.error("Error occurred:", error);
      setLoading("Error occurred while fetching data");
    }
  };

  const filterCourts = (data, selectedTime) => {
    let startTime = null;
    let endTime = null;

    if (selectedTime) {
      const [selectedHour, selectedMinute] = selectedTime.split(":");
      const selectedDateTime = new Date();
      selectedDateTime.setHours(selectedHour, selectedMinute, 0, 0);

      startTime = new Date(selectedDateTime);
      startTime.setMinutes(startTime.getMinutes() - 90);

      endTime = new Date(selectedDateTime);
      endTime.setMinutes(endTime.getMinutes() + 90);
    }

    const aggregatedData = data.map((center) => {
      const timeSlotCounts = {};

      center.freeSlots.forEach((slot) => {
        const [slotHour, slotMinute] = slot.split(":");
        const slotDateTime = new Date();
        slotDateTime.setHours(slotHour, slotMinute, 0, 0);

        if (
          !selectedTime ||
          (slotDateTime >= startTime && slotDateTime <= endTime)
        ) {
          const timeSlot = `${slotHour}:${slotMinute}`;
          if (!timeSlotCounts[timeSlot]) {
            timeSlotCounts[timeSlot] = 0;
          }
          timeSlotCounts[timeSlot]++;
        }
      });

      const aggregatedSlots = Object.entries(timeSlotCounts).map(
        ([time, count]) => {
          return `${time} (x${count})`;
        }
      );

      return { ...center, freeSlots: aggregatedSlots };
    });

    const filteredData = aggregatedData.filter(center => center.freeSlots.length > 0);

    setCourts(filteredData);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
    filterCourts(rawData, e.target.value);
  };

  return (
    <div id="root">
      {loading && (
        <p className={`loading-message ${fadeOut ? "fade-out" : ""}`}>
          {loading}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Sport:
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="">Select a sport</option>
            <option value="Pista de bádminton">Pista de bádminton</option>
            <option value="Frontón">Frontón</option>
            <option value="Pista de pádel">Pista de pádel</option>
            <option value="Pista de pickleball">Pista de pickleball</option>
            <option value="Pista de squash">Pista de squash</option>
            <option value="Pista de tenis">Pista de tenis</option>
            <option value="Tenis de mesa">Tenis de mesa</option>
          </select>
        </label>
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Time:
          <input type="time" value={time} onChange={handleTimeChange} />
        </label>
        <button type="submit">Search</button>
      </form>
      <MapContainer
        id="map"
        center={[40.416775, -3.70379]}
        zoom={12}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright"/>
        {courts.map((court, index) => (
          <Marker
            key={index}
            position={[court.coordinates.lat, court.coordinates.lon]}
          >
            <Popup>
              <h3>{court.sportsCenter}</h3>
              <p>{court.address}</p>
              <ul>
                {court.freeSlots.map((slot, idx) => (
                  <li key={idx}>{slot}</li>
                ))}
              </ul>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
