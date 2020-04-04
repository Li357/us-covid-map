import Head from 'next/head';
import { gql, useQuery } from '@apollo/client';
import Page from '../components/Page';
import Choropleth from '../components/Choropleth';
import { withApollo } from '../lib/apollo';
import { createRegionMap } from '../lib/data';

const GET_ALL_CASES = gql`
  query getAllCases {
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

function Index() {
  const { loading, data } = useQuery(GET_ALL_CASES);
  if (loading || !data) {
    return null;
  }

  const regionMap = createRegionMap(data!.nation, data!.states);
  return (
    <Page>
      <Head>
        <title>US COVID-19 Map</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Choropleth regions={regionMap} width={960} height={600} onEnterRegion={() => {}} onExitRegion={() => {}} />
    </Page>
  );
}

export default withApollo({ ssr: true })(Index);
