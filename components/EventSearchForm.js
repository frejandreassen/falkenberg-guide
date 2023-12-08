import React, { useState } from 'react';
import axios from 'axios';

const EventSearchForm = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [text, setText] = useState('');
    const [results, setResults] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/events', { fromDate, toDate, text });
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setResults('Unable to fetch data');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                />
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Search text"
                    required
                />
                <button type="submit" className="bg-white">Search</button>
            </form>
            {results && <div className="text-gray-400">{JSON.stringify(results)}</div>}
        </div>
    );
};

export default EventSearchForm;
