const express = require("express");

const app = express();
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const spotifyApiLimit = 100;

spotifyApi.clientCredentialsGrant().then(
  (data) => {
    console.log(`The access token is ${data.body.access_token}`);
    spotifyApi.setAccessToken(data.body.access_token);
  },
  (err) => {
    console.log("Error while connecting to Spotify API: ", err);
  }
);

app.use(express.json());

function getRecommendationWithPreview(genres) {
  const promise = new Promise(function (resolve, reject) {
    let recommendation;
    spotifyApi
      .getRecommendations({
        seed_genres: genres,
        limit: spotifyApiLimit,
      })
      .then((rec) => {
        const randomIndex = Math.floor(
          Math.random() *
            Math.min(spotifyApiLimit, rec.body.seeds[0].afterRelinkingSize)
        );
        recommendation = rec.body.tracks[randomIndex];

        if (recommendation.preview_url) {
          // console.log(recommendation);
          console.log("Recommendation had preview url");
          resolve(recommendation);
        } else {
          getRecommendationWithPreview(genres);
        }
      })
      .catch((err) => {
        reject();
        console.error(err);
      });
  });
  return promise;
}
app.get("/", (req, res) => res.send("Hello World!"));

app.get("/search/:name", (req, res) => {
  spotifyApi.searchTracks(req.params.name).then(
    (data) => {
      res.send(data);
    },
    (err) => {
      console.error(err);
    }
  );
});

app.get("/recommendation/", (req, res) => {
  if (req.body.genres.length === 0 || req.body.genres.length > 5) {
    res.status(400);
    res.send("Include between 1 and 5 genres");
  }

  getRecommendationWithPreview(req.body.genres).then((result) => {
    res.send(result);
  });
});

app.get("/genres", (req, res) => {
  axios
    .get("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
      headers: {
        Authorization: `Bearer ${spotifyApi.getAccessToken()}`,
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
