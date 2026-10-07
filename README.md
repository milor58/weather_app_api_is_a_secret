# important 
my api is hidden  *** ^^ you said never put the api key in the github ^^ ***
it will never run unless you do these steps in how to run it 
# Weather Dashboard
A small weather app I built for Assignment 4. You type a city name and it shows the current weather from the OpenWeatherMap API: temperature, a short description, an icon, feels-like temperature, humidity, wind and pressure.
I wanted the API key to stay private, so the browser never talks to OpenWeatherMap directly. It talks to a tiny Node server in this project, and that server adds the key (read from a `.env` file) and passes the request on. That way the key is not in the JavaScript and nobody can see it in DevTools.

## What i needed 

- Node.js 18 or newer. There is nothing to install with npm, the project has no dependencies.
- A free OpenWeatherMap API key or open-meteo both are free to use

## How to run it

1. Make a free account at https://openweathermap.org/api and copy your key from Profile > My API keys. A new key can take up to 2 hours before it starts working.
2. In the project folder, copy `.env.example` and name the copy `.env`.
3. Open `.env` and put your key after the equals sign, with no quotes and no spaces:
```
   OPENWEATHER_API_KEY=your_key_here
```
4. Start the server:
```
   node server.js
```
   (`npm start` does the same thing. On Windows PowerShell, if `npm start` is blocked, just use `node server.js`.)
5. Open http://localhost:3000 in your browser.

Use this address and not the VS Code Live Server. The search only works through the Node server.

If port 3000 is busy, change `PORT=3000` in `.env` to another number like 3001 and open that address instead.

`.env` is in `.gitignore`, so the real key is never pushed to GitHub. Only `.env.example` with a placeholder is in the repo.

## Files

- `server.js`: the Node server. It serves the `public` folder and handles `/api/weather?city=...`.
- `public/index.html`: the page.
- `public/css/style.css`: the styling. The background color changes with the weather.
- `public/js/api.js`: the fetch call with async/await and try/catch.
- `public/js/ui.js`: updates the page (loading, errors, results).
- `public/js/main.js`: connects the search form to the other two files.

## Loading and errors

While a request is running the app shows a spinner and the Search button is disabled. If something goes wrong it shows a message in plain words and a Try again button. These cases are handled:

- empty search
- city not found
- missing or wrong API key
- too many requests
- weather service down
- server not running or no internet
- request taking too long (over 12 seconds)

Every fetch is inside a try/catch, and any response that is not 200 is checked on purpose. API text goes on the page with `textContent`, never `innerHTML`.

The layout works on phones and on desktop.

## Author

Hussein Ezzeddine, 232773