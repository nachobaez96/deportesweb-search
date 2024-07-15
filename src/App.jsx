import React, { useState } from 'react';
import './App.css';

function App() {
    const [sport, setSport] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [courts, setCourts] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert date to DD/MM/YYYY format
        const [year, month, day] = date.split('-');
        const formattedDate = `"${day}/${month}/${year}"`;
    
        const response = await fetch('http://localhost:5000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sport, date: formattedDate, time }),
        });
        const data = await response.json();
        setCourts(data.courts);
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
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <br />
                <label>
                    Time:
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </label>
                <br />
                <button type="submit">Search</button>
            </form>
            <h2>Available Courts</h2>
            {/* <ul>
                {courts.map((court, index) => (
                    <li key={index}>{court.name} - {court.availability}</li>
                ))}
            </ul> */}
        </div>
    );
}

export default App;
