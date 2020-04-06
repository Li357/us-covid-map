import { gql } from '@apollo/client';

export const GET_ALL_CASES_DEATHS = gql`
  query getAllCasesDeaths {
    states {
      fips
      name
      population
      cases
      deaths
      timeline {
        date
        cases
        deaths
      }
      counties {
        fips
        cases
        deaths
      }
      lastUpdated
    }
    nation {
      fips
      name
      population
      cases
      deaths
      timeline {
        date
        cases
        deaths
      }
      lastUpdated
    }
  }
`;

export const GET_COUNTY_DATA_BY_STATE = gql`
  query getCountyData($stateFips: ID!) {
    states(fips: $stateFips) {
      counties {
        fips
        name
        population
        cases
        deaths
        timeline {
          date
          cases
          deaths
        }
        lastUpdated
      }
    }
  }
`;
