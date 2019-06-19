const express = require("express");
const Movie = require("../schemas/Movie");
const User = require("../schemas/User");

const movieRouter = express.Router({
  mergeParams: true
});

require("dotenv").config();

movieRouter.post("/", async (req, res) => {
  console.log(req.body);
  user = await User.findById(req.body.userID);
  existing_entry = await Movie.findOne({
    title: req.body.title,
    user: user
  });
  if (!existing_entry) {
    movie = new Movie({
      title: req.body.title,
      user: user,
      movieID: req.body.movieID
    });
    movie
      .save()
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json({
          message: err
        });
      });
  } else {
      res.json({
          message: "Existing entry"
      })
  }
});

module.exports = movieRouter;
