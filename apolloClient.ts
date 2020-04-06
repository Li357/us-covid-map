import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { BatchHttpLink } from '@apollo/link-batch-http';
import { NextPageContext } from 'next';
import fetch from 'isomorphic-unfetch';

export default function createApolloClient(initialState: NormalizedCacheObject, ctx?: NextPageContext) {
  return new ApolloClient({
    ssrMode: Boolean(ctx),
    link: new BatchHttpLink({
      uri: 'https://covid-nyt-api.now.sh/graphql',
      fetch,
    }),
    cache: new InMemoryCache().restore(initialState),
  });
}
