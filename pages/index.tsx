import Head from 'next/head';
import Page from '../components/Page';
import { withApollo } from '../lib/apollo';

function Index() {
  return (
    <Page>
      <Head>
        <title>US COVID-19 Map</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Page>
  );
}

export default withApollo({ ssr: true })(Index);
