const express = require("express");
const Pictures = require("../schemas/Picture");
const User = require("../schemas/User");

const picturesRouter = express.Router({
  mergeParams: true
});

require("dotenv").config();

picturesRouter.get("/", async (req, res) => {
  var picture = await Pictures.find();
  res.json(picture)
});

module.exports = picturesRouter;