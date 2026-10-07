const els = {
  form: document.getElementById('search-form'),
  input: document.getElementById('city-input'),
  searchBtn: document.getElementById('search-btn'),
  status: document.getElementById('status'),
  statusText: document.getElementById('status-text'),
  spinner: document.getElementById('spinner'),
  retryBtn: document.getElementById('retry-btn'),
  card: document.getElementById('weather'),
  city: document.getElementById('w-city'),
  desc: document.getElementById('w-desc'),
  icon: document.getElementById('w-icon'),
  temp: document.getElementById('w-temp'),
  feels: document.getElementById('w-feels'),
  humidity: document.getElementById('w-humidity'),
  wind: document.getElementById('w-wind'),
  pressure: document.getElementById('w-pressure'),
};

function setStatus(state, message = '') {
  els.status.dataset.state = state;
  els.statusText.textContent = message;
  els.spinner.hidden = state !== 'loading';
  els.retryBtn.hidden = state !== 'error';
  els.searchBtn.disabled = state === 'loading';
  els.status.hidden = state === 'success';
  if (state !== 'success') els.card.hidden = true;
}

function themeFor(weather) {
  const main = weather.main.toLowerCase();
  const isNight = weather.icon.endsWith('n');
  if (main === 'thunderstorm') return 'storm';
  if (main === 'rain' || main === 'drizzle') return 'rain';
  if (main === 'snow') return 'snow';
  if (main === 'clear') return isNight ? 'night' : 'clear';
  if (main === 'clouds') return isNight ? 'night-clouds' : 'clouds';
  return 'mist';
}

function renderWeather(data) {
  const w = data.weather[0];

  els.city.textContent = `${data.name}, ${data.sys.country}`;
  els.desc.textContent = w.description;
  els.temp.textContent = Math.round(data.main.temp);
  els.feels.textContent = `${Math.round(data.main.feels_like)}°C`;
  els.humidity.textContent = `${data.main.humidity}%`;
  els.wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  els.pressure.textContent = `${data.main.pressure} hPa`;

  els.icon.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
  els.icon.alt = w.description;

  document.body.dataset.theme = themeFor(w);
  els.card.hidden = false;
}

function resetTheme() {
  document.body.dataset.theme = 'default';
}
