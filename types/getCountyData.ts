/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getCountyData
// ====================================================

export interface getCountyData_states_counties_timeline {
  __typename: "DayTotal";
  date: string;
  cases: number;
  deaths: number;
}

export interface getCountyData_states_counties {
  __typename: "County";
  fips: string;
  name: string;
  population: number;
  cases: number;
  deaths: number;
  timeline: getCountyData_states_counties_timeline[];
}

export interface getCountyData_states {
  __typename: "State";
  counties: getCountyData_states_counties[];
}

export interface getCountyData {
  states: getCountyData_states[];
}

export interface getCountyDataVariables {
  stateId: string;
}
