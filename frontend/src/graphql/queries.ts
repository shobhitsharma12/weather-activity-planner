import { gql } from '@apollo/client';

export const GET_CITY_RANKINGS = gql`
  query GetCityRankings($city: String!) {
    cityWeatherRankings(city: $city) {
      city
      country
      latitude
      longitude
      forecast {
        date
        weatherCode
        temperatureMax
        temperatureMin
        precipitation
        snowfall
        windspeedMax
        precipitationProbability
        rankings {
          skiing {
            score
            label
            description
          }
          surfing {
            score
            label
            description
          }
          outdoorSightseeing {
            score
            label
            description
          }
          indoorSightseeing {
            score
            label
            description
          }
        }
      }
    }
  }
`;
