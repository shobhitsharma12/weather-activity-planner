import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_CITY_RANKINGS } from './graphql/queries';
import { CityWeatherResult } from './types';
import SearchBar from './components/SearchBar';
import ResultsView from './components/ResultsView';
import './App.css';

interface QueryData {
  cityWeatherRankings: CityWeatherResult;
}

export default function App() {
  const [city, setCity] = useState('');

  const [getCityRankings, { loading, error, data }] =
    useLazyQuery<QueryData>(GET_CITY_RANKINGS);

  const handleSearch = () => {
    const trimmed = city.trim();
    if (!trimmed) return;
    getCityRankings({ variables: { city: trimmed } });
  };

  const errorMessage =
    error?.graphQLErrors[0]?.message ?? error?.message ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Weather Activity Planner</h1>
        <p className="app-subtitle">
          Discover the best days for skiing, surfing, and sightseeing — anywhere
          in the world
        </p>
      </header>

      <main className="app-main">
        <SearchBar
          value={city}
          onChange={setCity}
          onSearch={handleSearch}
          disabled={loading}
        />

        {loading && (
          <div className="state-message loading">
            Fetching weather forecast...
          </div>
        )}

        {errorMessage && !loading && (
          <div className="state-message error">{errorMessage}</div>
        )}

        {data?.cityWeatherRankings && !loading && (
          <ResultsView result={data.cityWeatherRankings} />
        )}
      </main>
    </div>
  );
}
