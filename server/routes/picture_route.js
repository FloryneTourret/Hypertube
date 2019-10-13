const express = require("express");
const Pictures = require("../schemas/Picture");

const picturesRouter = express.Router({
  mergeParams: true
});

picturesRouter.get("/", async (req, res) => {
  var picture = await Pictures.find();
  res.json(picture)
});

module.exports = picturesRouter;