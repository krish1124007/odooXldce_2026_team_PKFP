import api from './api';

// Fetch full structured itinerary (Trip + Stops + ItineraryActivities + Conflicts)
export const getCompleteItinerary = async (tripId) => {
  const response = await api.get(`/itinerary/trips/${tripId}`);
  return response.data;
};

// Trip Stops APIs
export const createTripStop = async (tripId, stopData) => {
  const response = await api.post(`/itinerary/trips/${tripId}/stops`, stopData);
  return response.data;
};

export const updateTripStop = async (stopId, stopData) => {
  const response = await api.put(`/itinerary/stops/${stopId}`, stopData);
  return response.data;
};

export const deleteTripStop = async (stopId) => {
  const response = await api.delete(`/itinerary/stops/${stopId}`);
  return response.data;
};

export const reorderTripStops = async (tripId, stopIds) => {
  const response = await api.put(`/itinerary/trips/${tripId}/stops/reorder`, { stopIds });
  return response.data;
};

// Itinerary Activities APIs
export const addItineraryActivity = async (stopId, activityData) => {
  const response = await api.post(`/itinerary/stops/${stopId}/activities`, activityData);
  return response.data;
};

export const updateItineraryActivity = async (activityId, activityData) => {
  const response = await api.put(`/itinerary/itinerary-activities/${activityId}`, activityData);
  return response.data;
};

export const deleteItineraryActivity = async (activityId) => {
  const response = await api.delete(`/itinerary/itinerary-activities/${activityId}`);
  return response.data;
};

export const reorderStopActivities = async (stopId, activityIds) => {
  const response = await api.put(`/itinerary/stops/${stopId}/activities/reorder`, { activityIds });
  return response.data;
};
