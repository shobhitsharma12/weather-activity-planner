import { CityWeatherResult } from '../types';
import ActivitySummary from './ActivitySummary';
import DayCard from './DayCard';

interface ResultsViewProps {
  result: CityWeatherResult;
}

export default function ResultsView({ result }: ResultsViewProps) {
  const latDir = result.latitude >= 0 ? 'N' : 'S';
  const lonDir = result.longitude >= 0 ? 'E' : 'W';

  return (
    <div className="results-view">
      <div className="location-header">
        <h2 className="location-name">
          {result.city}, {result.country}
        </h2>
        <span className="location-coords">
          {Math.abs(result.latitude).toFixed(2)}°{latDir},{' '}
          {Math.abs(result.longitude).toFixed(2)}°{lonDir}
        </span>
      </div>

      <ActivitySummary forecast={result.forecast} />

      <h3 className="section-title">7-Day Forecast</h3>
      <div className="forecast-grid">
        {result.forecast.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}
