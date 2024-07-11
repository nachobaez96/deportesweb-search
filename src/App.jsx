import React, { useState } from 'react';
import './App.css';

function App() {
    const [sport, setSport] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [courts, setCourts] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/get-courts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: 'yourUsername', password: 'yourPassword', sport, date, time })
        });
        const data = await response.json();
        setCourts(data);
    };

    return (
        <div>
            <h1>DeportesWeb Madrid Search</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Sport:
                    <input type="text" value={sport} onChange={(e) => setSport(e.target.value)} />
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
            <ul>
                {courts.map((court, index) => (
                    <li key={index}>{court.name} - {court.availability}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
