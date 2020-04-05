/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getAllCasesDeaths
// ====================================================

export interface getAllCasesDeaths_states_timeline {
  __typename: "DayTotal";
  date: string;
  cases: number;
  deaths: number;
}

export interface getAllCasesDeaths_states_counties {
  __typename: "County";
  fips: string;
  cases: number;
  deaths: number;
}

export interface getAllCasesDeaths_states {
  __typename: "State";
  fips: string;
  name: string;
  population: number;
  cases: number;
  deaths: number;
  timeline: getAllCasesDeaths_states_timeline[];
  counties: getAllCasesDeaths_states_counties[];
}

export interface getAllCasesDeaths_nation_timeline {
  __typename: "DayTotal";
  date: string;
  cases: number;
  deaths: number;
}

export interface getAllCasesDeaths_nation {
  __typename: "Nation";
  fips: string;
  name: string;
  population: number;
  cases: number;
  deaths: number;
  timeline: getAllCasesDeaths_nation_timeline[];
}

export interface getAllCasesDeaths {
  states: getAllCasesDeaths_states[];
  nation: getAllCasesDeaths_nation;
}
