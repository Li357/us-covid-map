module.exports = {
  client: {
    includes: ['./pages/**/*.tsx'],
    service: {
      name: 'covid-nyt-api',
      url: 'https://covid-nyt-api.now.sh/graphql',
    },
  },
};
