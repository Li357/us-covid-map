module.exports = {
  client: {
    includes: ['./queries/**/*.ts'],
    service: {
      name: 'covid-nyt-api',
      url: 'https://covid-nyt-api.now.sh/graphql',
    },
  },
};
