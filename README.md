# Calorie Detector (React + Vite)

A simple, modern calorie detector. Type foods like "2 apples and a banana" and get calories for each item and a total.

- Uses [CalorieNinjas API](https://calorieninjas.com/api) when an API key is provided.
- Falls back to a local mock database for demo mode when no key is present.

## Quickstart

1. Install dependencies

```bash
npm install
```

2. (Optional) Add API key

- Copy `.env.template` to `.env`
- Set `VITE_CALORIENINJAS_API_KEY` to your key from CalorieNinjas

Without a key, the app still works in demo mode with approximate data.

3. Run the dev server

```bash
npm run dev
```

The app will open at http://localhost:5173

## Build for production

```bash
npm run build && npm run preview
```

## Notes

- This project uses Vite and React 18.
- Environment variable is read via `import.meta.env.VITE_CALORIENINJAS_API_KEY` in `src/api.js`.
