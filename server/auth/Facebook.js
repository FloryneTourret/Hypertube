const express = require("express");
const Facebook = express.Router();
const User = require("../schemas/User");

Facebook.get("/", (req, res) => {
  res.send("You need to chose a strategy : login or register");
});


Facebook.post("/register", async (req, res) => {
  console.log(req.body);
  var username =
    req.body.firstName +
    req.body.lastName + Math.floor(Math.random() * 1000) +
    1;
  console.log("username = " + username);
  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: username,
    facebookID: req.body.facebookID,
    authProvider: "facebook"
  });
  user
    .save()
    .then(data => {
      console.log(data);
      res.status(200).json(data);
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        message: err
      });
    });
}).get("/login", async (req, res) => {
  let user = await User.findOne({
    facebookID: req.query.id,
    authProvider: req.query.provider
  });
  if (user != null) {
    req.session.id = user._id;
    req.session.username = user.username;
    res.status(200).json(user);
  } else {
    res.json({
      message: "No Facebook account registered. You need to register first."
    });
  }
});

module.exports = Facebook;