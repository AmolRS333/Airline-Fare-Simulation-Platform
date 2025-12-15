import { DateTime } from 'luxon';

export const formatDate = (date, format = 'dd LLL yyyy') => {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    return DateTime.fromISO(dateObj.toISOString()).toFormat(format);
  } catch (err) {
    console.error('Date formatting error:', err);
    return 'N/A';
  }
};

export const formatTime = (date, format = 'HH:mm') => {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    return DateTime.fromISO(dateObj.toISOString()).toFormat(format);
  } catch (err) {
    console.error('Time formatting error:', err);
    return 'N/A';
  }
};

export const formatDateTime = (date, format = 'dd LLL yyyy HH:mm') => {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    return DateTime.fromISO(dateObj.toISOString()).toFormat(format);
  } catch (err) {
    console.error('DateTime formatting error:', err);
    return 'N/A';
  }
};

export const getDurationString = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const getHoursUntilDeparture = (departureTime) => {
  const now = new Date();
  const departure = new Date(departureTime);
  const hours = (departure - now) / (1000 * 60 * 60);
  return Math.round(hours * 10) / 10;
};

export const getPriceChangePercentage = (oldPrice, newPrice) => {
  return Math.round(((newPrice - oldPrice) / oldPrice) * 100);
};
