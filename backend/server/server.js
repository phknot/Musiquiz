const express = require('express');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

spotifyApi.clientCredentialsGrant().then(
    function(data) {
      console.log('The access token is ' + data.body['access_token']);
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Error while connecting to Spotify API: ', err);
    },
);

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/search/:name', (req, res) => {
  spotifyApi.searchTracks(req.params.name).then(
      (data) => {
        res.send(data);
      },
      (err) => {
        console.error(err);
      },
  );
});

app.get('/rock/', (req, res) => {
  spotifyApi
      .getRecommendations({
        seed_genres: ['rock'],
      })
      .then((rec) => {
        res.send(rec);
      })
      .catch((err) => {
        console.error(err);
      });
});

module.exports = app;
