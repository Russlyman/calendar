import { useEffect, useState } from 'react';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { EventType } from './types/EventType';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<EventType[]>([]);

  const deleteEvent = async (eventId: number) => {
    const response = await fetch(`http://localhost:5281/events/${eventId}`, {
      method: 'DELETE',
    });

    // Check response
    if (!response.ok) {
      console.error('Failed to delete');
      return;
    }

    setSelectedEvents(prev => prev.filter(e => e.id !== eventId));
  };

  useEffect(() => {
    const getEvents = async () => {
      // ACK: toIsoString will break because it forces UTC timezone,
      // if we convert to CA locale we get an ISO like date string using
      // local time.
      const date = selectedDate.toLocaleDateString('en-CA');

      const response = await fetch(`http://localhost:5281/events?date=${date}`);

      // Check response
      if (!response.ok) {
        console.error('Failed to get');
        return;
      }

      const responseJson = await response.json();

      const responseFixDate: EventType[] = responseJson.map(
        (e: { date: string }) => ({ ...e, date: new Date(e.date) })
      );

      setSelectedEvents(responseFixDate);
    };

    getEvents();
  }, [selectedDate]);

  const events = selectedEvents.map(e => (
    <div key={e.id}>
      <p>{e.title}</p>
      <p>{e.description}</p>
      <button
        className="px-5 py-3 bg-gray-400"
        onClick={() => deleteEvent(e.id)}
      >
        Delete
      </button>
    </div>
  ));

  return (
    <>
      <DayPicker
        animate
        required
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
      />
      <div>
        <p>Selected {selectedDate.toLocaleDateString()}</p>
        <div>{events.length > 0 ? events : <p>No events!</p>}</div>
      </div>
    </>
  );
}

export default App;
