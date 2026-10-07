let lastCity = '';

async function search(city) {
  setStatus('loading', `Loading weather for ${city}…`);
  try {
    const data = await fetchWeather(city);
    renderWeather(data);
    setStatus('success');
    lastCity = city;
  } catch (err) {
    resetTheme();
    const message = err instanceof WeatherError
      ? err.message
      : 'Something went wrong. Try again.';
    setStatus('error', message);
    lastCity = city;
    console.warn('Weather request failed:', err.message);
  }
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const city = els.input.value.trim();
  if (!city) {
    resetTheme();
    setStatus('error', 'Enter a city name to search.');
    els.input.focus();
    return;
  }
  search(city);
});

els.retryBtn.addEventListener('click', () => {
  if (lastCity) search(lastCity);
  else els.input.focus();
});

setStatus('idle', 'Search for a city to see its current weather.');
