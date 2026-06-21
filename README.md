# Weather Activity Planner

A full-stack TypeScript application that ranks how desirable a city is for four activities — **Skiing**, **Surfing**, **Outdoor Sightseeing**, and **Indoor Sightseeing** — over the next 7 days, using real weather forecast data.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install dependencies
```bash
npm run install:all
```

### Run (two terminals)
```bash
# Terminal 1 — backend on http://localhost:4000/graphql
npm run dev:backend

# Terminal 2 — frontend on http://localhost:3000
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000), type a city name (e.g. **London**, **Aspen**, **Sydney**) and hit Search.

---

## Architecture Overview

```
Collinson_Lead_Engineer_Test/
├── backend/          Node.js + Apollo Server v4 + Express
│   └── src/
│       ├── schema/       GraphQL type definitions
│       ├── resolvers/    Query resolver
│       └── services/
│           ├── geocoding.ts   City → lat/lng via Open-Meteo Geocoding API
│           ├── weather.ts     7-day forecast via Open-Meteo Forecast API
│           └── scoring.ts     Activity scoring algorithms
└── frontend/         React 18 + Vite + Apollo Client
    └── src/
        ├── graphql/      GQL query document
        ├── components/   SearchBar, ResultsView, DayCard, ActivityBadge, ActivitySummary
        └── types.ts      Shared TypeScript interfaces
```

### Key Technical Decisions

| Decision | Rationale |
|---|---|
| **GraphQL (Apollo Server v4)** | Matches Collinson's stack; single request returns all needed data |
| **Open-Meteo** | Free, no API key required, accurate WMO weather codes + all needed daily variables |
| **Vite proxy** | Avoids CORS config during development; frontend calls `/graphql` which proxies to `:4000` |
| **Scoring as pure functions** | Each activity is a deterministic `(DailyWeather) → ActivityScore` function — easy to test and tune |
| **Separation of concerns** | `geocoding`, `weather`, and `scoring` are independent services; the resolver just orchestrates them |

---

## Scoring Methodology

Scores are 0–100 integers. Each activity weighs the same Open-Meteo daily variables differently:

### Skiing
- Sub-zero average temperature: up to +40 pts
- Snowfall (cm): up to +40 pts for fresh powder
- Low wind (<15 km/h): +15 pts
- Rain or above-zero: negative penalty
- Storms: −30 pts

### Surfing
- Wind 15–35 km/h (wave-generating range): +35 pts
- Warm max temperature (>25°C): +25 pts
- No rain: +15 pts
- Thunderstorm: −50 pts (dangerous in open water)

### Outdoor Sightseeing
- Temperature 15–22°C (ideal walking range): +40 pts
- Zero precipitation + low probability: +35 pts
- Clear sky code: +15 pts
- Rain, storm, or extreme wind: negative penalties

### Indoor Sightseeing
- Base score of 50 — always a viable option
- Heavy rain (>15mm): +30 pts
- Thunderstorm: +25 pts
- Perfect outdoor weather (clear sky, 15–25°C): −15 to −25 pts

Labels: **Excellent** (90+) · **Good** (70–89) · **Fair** (50–69) · **Poor** (30–49) · **Very Poor** (0–29)

---

## How AI Assisted

Claude Code (Anthropic) was used throughout this build:
- **Boilerplate generation**: package.json, tsconfig, Vite config, Apollo Server setup
- **Scoring algorithm drafting**: initial weight values for each activity, which I then reviewed and adjusted (e.g. the surfing wind range, the indoor base score of 50)
- **CSS**: dark-theme colour palette, grid layout, responsive breakpoints
- **Type definitions**: TypeScript interfaces for Open-Meteo API response shapes

All architectural decisions (service decomposition, GraphQL schema design, scoring philosophy) were made independently. AI output was reviewed line-by-line before use.

---

## Omissions & Trade-offs

| Omission | Reason / How I'd fix it |
|---|---|
| **Unit tests** | Omitted for time. The `scoring.ts` pure functions are straightforward to unit-test with Jest and a set of fixture weather objects. |
| **Error boundary** | React `ErrorBoundary` not added; a production app would wrap `ResultsView`. |
| **Caching** | Apollo Client caches by query variables, but the backend makes fresh Open-Meteo calls on every request. A Redis TTL cache (1 hr) per city would be the fix. |
| **Hourly data** | Open-Meteo has hourly data which would enable more precise scoring (e.g. surfing is better in the morning). Daily aggregates were used for simplicity. |
| **Wave height** | Surfing score would be far more accurate with actual swell/wave data. Open-Meteo doesn't provide this; a secondary API (e.g. Stormglass) would be needed. |
| **Authentication / rate limiting** | No auth or rate limiting on the GraphQL endpoint — acceptable for a test, not for production. |
| **CI/CD** | No pipeline configured. Would add GitHub Actions for type-check + lint on PR. |
