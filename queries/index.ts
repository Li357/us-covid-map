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
        name
        cases
        deaths
      }
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
    }
  }
`;

export const GET_COUNTY_DATA_BY_STATE = gql`
  query getCountyData($stateId: ID!) {
    states(fips: $stateId) {
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
      }
    }
  }
`;
