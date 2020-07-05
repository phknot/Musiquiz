const express = require('express');
const app = express();
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// app.use(express.json);

spotifyApi.clientCredentialsGrant().then(
    function(data) {
      console.log('The access token is ' + data.body['access_token']);
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Error while connecting to Spotify API: ', err);
    },
);

app.use(express.json());

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

app.get('/recommendations/', (req, res) => {
  console.log(req.body.genres);
  if (!req.body.genres) {
    res.status(400);
    res.send('Include at least 1 genre');
  }

  spotifyApi
      .getRecommendations({
        seed_genres: req.body.genres,
      })
      .then((rec) => {
        res.send(rec);
      })
      .catch((err) => {
        console.error(err);
      });
});

app.get('/genres', (req, res) => {
  // console.log(spotifyApi.getAccessToken());
  // spotifyApi.getCategories().then((cat) => {
  //     res.send(cat);
  // }).catch((err) => {
  //     console.error(err);
  // });

  axios
      .get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
        headers: {
          Authorization: 'Bearer ' + spotifyApi.getAccessToken(),
        },
      })
      .then((apiResult) => {
        res.send(apiResult.data);
      })
      .catch((err) => {
        console.error(err);
        res.status(500);
        res.send();
      });
});

module.exports = app;
