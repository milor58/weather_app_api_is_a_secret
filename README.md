# Weather Dashboard

Type a city, get its current weather from the [OpenWeatherMap](https://openweathermap.org/api) API.

Shows temperature, conditions, a weather icon, feels-like, humidity, wind, and pressure.
Includes a loading spinner, clear error messages (bad city, no connection, timeout, rate limit, bad key), and a Retry button.
The background changes with the weather. Works on mobile and desktop.

The API key stays on the server (in `.env`). The browser only talks to this app's own
`/api/weather` endpoint, so the key never appears in the page's JavaScript or in DevTools.

## Requirements

- Node.js 18 or newer (no `npm install` needed, there are no dependencies)

## Setup

1. Create a free account at <https://openweathermap.org/api> and copy your API key
   (Profile -> My API keys). **A new key can take up to 2 hours to activate.**
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   (On Windows, duplicate `.env.example` and rename the copy to `.env`.)
3. Open `.env` and replace `YOUR_API_KEY_HERE` with your key:
   ```
   OPENWEATHER_API_KEY=abc123...
   ```
4. Start the app:
   ```bash
   npm start
   ```
5. Open <http://localhost:3000>

`.env` is listed in `.gitignore`, so your key is never committed.
Only `.env.example` (a placeholder) is in the repository.

## Project structure

- `server.js` : tiny Node server. Serves `public/` and proxies `/api/weather?city=...` to OpenWeatherMap using the key from `.env`
- `public/index.html`
- `public/css/style.css`
- `public/js/api.js` : fetch + error handling (async/await, try/catch)
- `public/js/ui.js` : DOM updates (status, rendering, themes)
- `public/js/main.js` : connects the form to api.js and ui.js
- `.env.example` : placeholder (committed)
- `.env` : your real key (git-ignored)

## How errors are handled

| Problem | What the user sees |
|---|---|
| Empty input | "Enter a city name to search." |
| 404 city not found | "We couldn't find that city..." |
| Missing / rejected API key | Message telling you to check `.env` |
| 429 rate limit | "Too many requests..." |
| 5xx / weather service down | "The weather service is having problems..." |
| Server not running / offline | "Couldn't reach the app server..." |
| No response in 12 s | "The request took too long..." |

Every fetch is wrapped in `try/catch`, non-200 responses are checked explicitly, and API text is
inserted with `textContent` (never `innerHTML`). The server also limits each visitor to 30 requests per minute.

## Screenshot

Add `screenshot.png` here showing the page with weather for a city of your choice.
