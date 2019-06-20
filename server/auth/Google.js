const express = require("express");
const Google = express.Router();
const User = require("../schemas/User");

Google.get("/", (req, res) => {
  res.send("No strategy chosen");
});

Google.post("/login", async (req, res) => {
  var user = await User.findOne({
    email: req.body.email,
    authProvider: "google"
  });
  if (user) {
    req.session.id = user._id;
    req.session.username = user.username;
    res.status(200).send(user);
  } else {
    res.status(404).send("Not found");
  }
}).post("/register", async (req, res) => {
  user = new User({
    email: req.body.user.U3.toLowerCase(),
    username: req.body.user.ofa + req.body.user.wea,
    firstName:
      req.body.user.ofa.charAt(0).toUpperCase() + req.body.user.ofa.slice(1),
    lastName: req.body.user.wea
      ? req.body.user.wea.toUpperCase()
      : req.body.user.ofa
      ? req.body.user.ofa
      : req.body.user.ig,
    authProvider: "google"
  });
  user
    .save()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({
        message: err
      });
    });
});

module.exports = Google;