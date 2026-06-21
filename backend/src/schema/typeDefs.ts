export const typeDefs = `#graphql
  type Query {
    cityWeatherRankings(city: String!): CityWeatherResult!
  }

  type CityWeatherResult {
    city: String!
    country: String!
    latitude: Float!
    longitude: Float!
    forecast: [DailyForecast!]!
  }

  type DailyForecast {
    date: String!
    weatherCode: Int!
    temperatureMax: Float!
    temperatureMin: Float!
    precipitation: Float!
    snowfall: Float!
    windspeedMax: Float!
    precipitationProbability: Float!
    rankings: ActivityRankings!
  }

  type ActivityRankings {
    skiing: ActivityScore!
    surfing: ActivityScore!
    outdoorSightseeing: ActivityScore!
    indoorSightseeing: ActivityScore!
  }

  type ActivityScore {
    score: Int!
    label: String!
    description: String!
  }
`;
