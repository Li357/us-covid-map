/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getAllCases
// ====================================================

export interface getAllCases_states_timeline {
  __typename: "DayTotal";
  date: string;
  cases: number;
  deaths: number;
}

export interface getAllCases_states_counties {
  __typename: "County";
  fips: string;
  cases: number;
}

export interface getAllCases_states {
  __typename: "State";
  fips: string;
  name: string;
  population: number;
  cases: number;
  deaths: number;
  timeline: getAllCases_states_timeline[];
  counties: getAllCases_states_counties[];
}

export interface getAllCases_nation_timeline {
  __typename: "DayTotal";
  date: string;
  cases: number;
  deaths: number;
}

export interface getAllCases_nation {
  __typename: "Nation";
  fips: string;
  name: string;
  population: number;
  cases: number;
  deaths: number;
  timeline: getAllCases_nation_timeline[];
}

export interface getAllCases {
  states: getAllCases_states[];
  nation: getAllCases_nation;
}
