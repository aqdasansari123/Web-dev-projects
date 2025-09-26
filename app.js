const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const suggestionsEl = $('#suggestions');
const cityInput = $('#city-input');
const clearBtn = $('#clear-btn');
const weatherEl = $('#weather');

let debounceTimer = null;
let latestSuggestions = [];

function setSuggestionsVisible(v) {
  suggestionsEl.classList.toggle('visible', v);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
}

function formatCity(item) {
  const parts = [item.name];
  if (item.admin1 && item.admin1 !== item.name) parts.push(item.admin1);
  if (item.country) parts.push(item.country);
  return parts.filter(Boolean).join(', ');
}

function renderSuggestions(results) {
  latestSuggestions = results || [];
  if (!latestSuggestions.length) {
    suggestionsEl.innerHTML = '<div class="suggestion-item"><span class="suggestion-name">No results</span></div>';
    setSuggestionsVisible(true);
    return;
  }
  suggestionsEl.innerHTML = latestSuggestions.map((r, idx) => {
    const label = escapeHtml(formatCity(r));
    const coords = `${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)}`;
    return `<div class="suggestion-item" role="option" data-idx="${idx}">
      <span class="suggestion-name">${label}</span>
      <span class="suggestion-meta">${coords} • ${escapeHtml(r.timezone || '')}</span>
    </div>`;
  }).join('');
  setSuggestionsVisible(true);
}

async function searchCities(query) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '10');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  return data.results || [];
}

function showLoading(message = 'Loading…') {
  weatherEl.innerHTML = `<div class="loading">${message}</div>`;
}

function showError(msg) {
  weatherEl.innerHTML = `<div class="error">${escapeHtml(msg)}</div>`;
}

function cToK(c) { return c + 273.15; }

function renderWeather(city, current) {
  const title = escapeHtml(formatCity(city));
  const tempC = current.temperature_2m;
  const tempK = cToK(tempC);
  const rh = current.relative_humidity_2m; // %
  const ws = current.wind_speed_10m; // km/h (we set unit)
  const wd = current.wind_direction_10m; // degrees

  weatherEl.innerHTML = `
    <div class="card-header">
      <div>
        <div class="location-title">${title}</div>
        <div class="location-sub">${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)} • ${escapeHtml(city.timezone || '')}</div>
      </div>
      <div class="location-sub">Observed: ${escapeHtml(current.time || '')}</div>
    </div>
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Temperature (Celsius)</div>
        <div class="metric-value">${tempC.toFixed(1)} °C</div>
      </div>
      <div class="metric">
        <div class="metric-label">Temperature (Kelvin)</div>
        <div class="metric-value">${tempK.toFixed(2)} K</div>
      </div>
      <div class="metric">
        <div class="metric-label">Humidity</div>
        <div class="metric-value">${rh.toFixed(0)} %</div>
      </div>
      <div class="metric">
        <div class="metric-label">Wind Speed</div>
        <div class="metric-value">${ws.toFixed(1)} km/h</div>
      </div>
      <div class="metric">
        <div class="metric-label">Wind Direction</div>
        <div class="metric-value">${wd.toFixed(0)}°</div>
      </div>
    </div>
  `;
}

async function fetchWeatherForCity(city) {
  try {
    showLoading('Fetching weather…');
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', city.latitude);
    url.searchParams.set('longitude', city.longitude);
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m');
    url.searchParams.set('wind_speed_unit', 'kmh');
    url.searchParams.set('timezone', city.timezone || 'auto');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();
    if (!data.current) throw new Error('No current weather available');
    renderWeather(city, data.current);
  } catch (e) {
    console.error(e);
    showError('Unable to fetch weather. Please try again.');
  }
}

function handleSuggestionClick(e) {
  const item = e.target.closest('.suggestion-item');
  if (!item) return;
  const idx = Number(item.dataset.idx);
  const city = latestSuggestions[idx];
  if (!city) return;
  setSuggestionsVisible(false);
  cityInput.value = formatCity(city);
  fetchWeatherForCity(city);
}

function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce(async (q) => {
  if (!q || q.trim().length < 2) { setSuggestionsVisible(false); return; }
  try {
    const results = await searchCities(q.trim());
    renderSuggestions(results);
  } catch (e) {
    console.error(e);
    suggestionsEl.innerHTML = '<div class="suggestion-item"><span class="suggestion-name">Search failed</span></div>';
    setSuggestionsVisible(true);
  }
}, 300);

cityInput?.addEventListener('input', (e) => {
  const q = e.target.value;
  debouncedSearch(q);
});

cityInput?.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (latestSuggestions[0]) {
      const city = latestSuggestions[0];
      setSuggestionsVisible(false);
      cityInput.value = formatCity(city);
      fetchWeatherForCity(city);
    } else if (cityInput.value.trim()) {
      try {
        const results = await searchCities(cityInput.value.trim());
        if (results[0]) {
          setSuggestionsVisible(false);
          cityInput.value = formatCity(results[0]);
          fetchWeatherForCity(results[0]);
        }
      } catch {}
    }
  }
});

clearBtn?.addEventListener('click', () => {
  cityInput.value = '';
  setSuggestionsVisible(false);
  weatherEl.innerHTML = '<div class="placeholder">Search a city to see its current weather.</div>';
  cityInput.focus();
});

suggestionsEl?.addEventListener('click', handleSuggestionClick);

document.addEventListener('click', (e) => {
  if (!suggestionsEl.contains(e.target) && e.target !== cityInput) {
    setSuggestionsVisible(false);
  }
});
