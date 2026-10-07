const API_URL = '/api/weather';
const REQUEST_TIMEOUT_MS = 12000;

class WeatherError extends Error {
  constructor(type, message) {
    super(message);
    this.name = 'WeatherError';
    this.type = type;
  }
}

async function errorFromResponse(response) {
  let message = '';
  try {
    const body = await response.json();
    message = body.error || '';
  } catch {
    message = '';
  }
  let type = 'http';
  if (response.status === 404) type = 'not-found';
  else if (response.status === 429) type = 'rate-limit';
  else if (response.status >= 500) type = 'server';
  return new WeatherError(type, message || `The request failed (HTTP ${response.status}). Try again.`);
}

async function fetchWeather(city) {
  const params = new URLSearchParams({ city });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_URL}?${params}`, { signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new WeatherError('timeout', 'The request took too long. Check your connection and try again.');
    }
    throw new WeatherError('network', "Couldn't reach the app server. Check that it is running (npm start) and that you are online.");
  } finally {
    clearTimeout(timer);
  }

  if (response.status !== 200) {
    throw await errorFromResponse(response);
  }

  try {
    return await response.json();
  } catch {
    throw new WeatherError('bad-data', 'The server sent a response we could not read.');
  }
}
