import { DateTime } from 'luxon';

export const formatDate = (date, format = 'dd LLL yyyy') => {
  return DateTime.fromISO(new Date(date).toISOString()).toFormat(format);
};

export const formatTime = (date, format = 'HH:mm') => {
  return DateTime.fromISO(new Date(date).toISOString()).toFormat(format);
};

export const formatDateTime = (date, format = 'dd LLL yyyy HH:mm') => {
  return DateTime.fromISO(new Date(date).toISOString()).toFormat(format);
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
