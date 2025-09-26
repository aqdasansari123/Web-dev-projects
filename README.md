# Internet Speed Tester (React + Vite)

Features
- Clean, responsive UI with Tailwind CSS
- Start/Stop test with progress indicator
- Download, Upload, and Ping measurements
- Real-time progress and animated gauge
- History (last 10), chart via Recharts
- Dark/Light mode toggle
- Export results as CSV

## Getting Started

1. Install dependencies
```
npm install
```

2. Run dev server
```
npm run dev
```

## Notes
- The test uses Cloudflare speed endpoints (`https://speed.cloudflare.com/__down` and `__up`). If your network blocks these or CORS changes, the test may fail.
- Results are indicative and can vary by browser, device, and concurrent traffic.
