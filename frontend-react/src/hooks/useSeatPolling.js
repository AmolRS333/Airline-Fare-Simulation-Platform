import { useEffect, useState } from 'react';
import { flightService } from '../services';

export const useSeatPolling = (flightId, pollInterval = 3000) => {
  const [seatMap, setSeatMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!flightId) return;

    const fetchSeats = async () => {
      try {
        const response = await flightService.getFlightById(flightId);
        setSeatMap(response.data.seatMap || {});
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Seat polling error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchSeats();

    // Set up polling interval
    const interval = setInterval(fetchSeats, pollInterval);

    return () => clearInterval(interval);
  }, [flightId, pollInterval]);

  return { seatMap, loading, error };
};
