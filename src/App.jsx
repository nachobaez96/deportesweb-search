import React, { useState } from "react";
import "./App.css";

function App() {
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [courts, setCourts] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert date to DD/MM/YYYY format
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

        // Split and handle SSE data
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
    if (!selectedTime) {
      setCourts(data);
      return;
    }

    const [selectedHour, selectedMinute] = selectedTime.split(":");
    const selectedDateTime = new Date();
    selectedDateTime.setHours(selectedHour, selectedMinute, 0, 0);

    const startTime = new Date(selectedDateTime);
    startTime.setMinutes(startTime.getMinutes() - 90);

    const endTime = new Date(selectedDateTime);
    endTime.setMinutes(endTime.getMinutes() + 90);

    const filteredData = data.map(center => {
      const timeSlotCounts = {};
      center.freeSlots.forEach(slot => {
          const [slotHour, slotMinute] = slot.split(':');
          const slotDateTime = new Date();
          slotDateTime.setHours(slotHour, slotMinute, 0, 0);
          if (slotDateTime >= startTime && slotDateTime <= endTime) {
              const timeSlot = `${slotHour}:${slotMinute}`;
              if (!timeSlotCounts[timeSlot]) {
                  timeSlotCounts[timeSlot] = 0;
              }
              timeSlotCounts[timeSlot]++;
          }
      });

      const aggregatedSlots = Object.entries(timeSlotCounts).map(([time, count]) => {
          return `${time} (x${count})`;
      });

      return { ...center, freeSlots: aggregatedSlots };
  });

  setCourts(filteredData);
};

  const handleTimeChange = (e) => {
    setTime(e.target.value);
    filterCourts(rawData, e.target.value);
  };

  return (
    <div>
      <h1>DeportesWeb Madrid Search</h1>
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
        <br />
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <br />
        <label>
          Time:
          <input type="time" value={time} onChange={handleTimeChange} />
        </label>
        <br />
        <button type="submit">Search</button>
      </form>
      {loading && <p>{loading}</p>}
      <h2>Available Courts</h2>
      <ul>
        {courts.map((court, index) => (
          <li key={index}>
            <h3>{court.sportsCenter}</h3>
            <ul>
              {court.freeSlots.map((slot, idx) => (
                <li key={idx}>{slot}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
