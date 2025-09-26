# Global Weather (Red & Black)

A simple client‑side weather app with a red/black theme. Search any city worldwide and view current weather using Open‑Meteo APIs (no API key required).

## Features
- Search any city worldwide (Open‑Meteo Geocoding API)
- Current temperature in Celsius and Kelvin
- Relative humidity
- Wind speed and wind direction
- Red & black modern theme

## Run
Just open `index.html` in your browser. The app calls Open‑Meteo directly from the client.

## How it works
- On input, the app queries `https://geocoding-api.open-meteo.com/v1/search` for up to 10 matching city names.
- On selection/Enter, the app queries `https://api.open-meteo.com/v1/forecast` with `current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m`.
- Wind speed is shown in km/h; temperatures are shown in °C and K (converted client-side).

## Notes
- No API key required. Open‑Meteo is free and anonymous.
- If suggestions do not appear, check your network connection or any browser extensions that may block cross‑origin requests.
