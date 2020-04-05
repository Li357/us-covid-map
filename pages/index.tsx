import { useState, useMemo } from 'react';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import Page from '../components/Page';
import Choropleth from '../components/Choropleth';
import Sidebar from '../components/Sidebar';
import { withApollo } from '../utils/apollo';
import { createRegionMap } from '../utils/data';
import { Region } from '../types';
import { GET_ALL_CASES_DEATHS } from '../queries';

function Index() {
  const { loading, data } = useQuery(GET_ALL_CASES_DEATHS);
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(data?.nation);
  const regionMap = useMemo(() => (data ? createRegionMap(data) : null), [data]);

  if (loading || !data) {
    return null;
  }

  return (
    <Page>
      <div>
        <Head>
          <title>US COVID-19 Map</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Choropleth
          regions={regionMap!}
          width={960}
          height={600}
          onEnterRegion={(region) => setSelectedRegion(region as Region) /* guaranteed to be full region */}
          onExitRegion={() => setSelectedRegion(data?.nation)}
        />
        <Sidebar selectedRegion={selectedRegion} />
      </div>
      <style jsx>{`
        div {
          display: flex;
          align-items: stretch;
          height: 100%;
        }
      `}</style>
    </Page>
  );
}

export default withApollo({ ssr: true })(Index);
