const express = require("express");
const auth = express.Router();

auth.get("/", (req, res) => {
  res.send("No strategy chosen");
});

auth.use('/facebook', require('./Facebook'));
auth.use('/42', require('./FortyTwo'));
auth.use('/github', require('./Github'));
auth.use('/google', require('./Google'));

module.exports = auth;
