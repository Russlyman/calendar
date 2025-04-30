import { useEffect, useState } from 'react';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { EventType } from './types/EventType';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<EventType[]>([]);
  const [monthEvents, setMonthEvents] = useState<Date[]>([]);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent = {
      title,
      description: description.length === 0 ? null : description,
      date: selectedDate.toLocaleDateString('en-CA'),
    };

    const response = await fetch(`http://localhost:5281/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });

    // Check response
    if (!response.ok) {
      console.error('Failed to add');
      return;
    }

    const responseJson = await response.json();

    setSelectedEvents(prev => [
      ...prev,
      { ...responseJson, date: new Date(responseJson.date) },
    ]);
    setMonthEvents(prev => [...prev, selectedDate]);
  };

  // Handler for deleting an event.
  const deleteEvent = async (eventId: number) => {
    const response = await fetch(`http://localhost:5281/events/${eventId}`, {
      method: 'DELETE',
    });

    // Check response
    if (!response.ok) {
      console.error('Failed to delete');
      return;
    }

    // FIX: I should probably use a Set instead to record dates.

    const eventToDelete = selectedEvents.find(e => e.id === eventId);

    if (selectedEvents.length === 1) {
      setMonthEvents(
        monthEvents.filter(e => e.getDate() !== eventToDelete?.date.getDate())
      );
    }

    setSelectedEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // Get events for the selected day.
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

  // Gets days that have events on them.
  useEffect(() => {
    const getMonth = async () => {
      // YYYY-MM-DD
      const date = selectedMonth.toLocaleDateString('en-CA').split('-');

      const response = await fetch(
        `http://localhost:5281/events?year=${date[0]}&month=${date[1]}`
      );

      // Check response
      if (!response.ok) {
        console.error('Failed to get');
        return;
      }

      const responseJson = await response.json();

      const responseFixDate: Date[] = responseJson.map(
        (d: string) => new Date(d)
      );

      setMonthEvents(responseFixDate);
    };

    getMonth();
  }, [selectedMonth]);

  const events = selectedEvents.map(e => (
    <div
      key={e.id}
      className="bg-gray-100 flex justify-between p-5 rounded-xl flex-col gap-3"
    >
      <h2 className="text-xl font-bold">{e.title}</h2>
      <p className="wrap-break-word">{e.description}</p>
      <button
        className="px-5 py-3 bg-gray-400 rounded-xl self-start"
        onClick={() => deleteEvent(e.id)}
      >
        Delete
      </button>
    </div>
  ));

  return (
    <main className="flex justify-center">
      <section className="flex flex-col gap-5 max-w-4xl items-center w-full m-5">
        <DayPicker
          animate
          required
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          modifiers={{ eventDays: monthEvents }}
          modifiersClassNames={{
            eventDays: 'text-red-500',
            today: 'text-black',
          }}
        />
        <div className="flex gap-5 flex-col w-full">
          <p className="text-center">
            Selected {selectedDate.toLocaleDateString()}
          </p>
          <form className="flex flex-col gap-5" onSubmit={createEvent}>
            <div className="flex flex-col">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                className="border rounded-xl p-3"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="border rounded-xl p-3"
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>
            </div>
            <button className="bg-gray-400 px-5 py-3 self-start rounded-xl">
              Submit
            </button>
          </form>
          <div className="flex flex-col gap-5">
            {events.length > 0 ? (
              events
            ) : (
              <p className="text-center text-4xl font-bold">No events!</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
