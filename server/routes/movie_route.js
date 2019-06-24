const express = require("express");
const Movie = require("../schemas/Movie");
const User = require("../schemas/User");
const torrentStream = require("torrent-stream");
const parseTorrent = require("parse-torrent");

const movieRouter = express.Router({
	mergeParams: true
});

require("dotenv").config();

movieRouter.post("/", async (req, res) => {
	let user = await User.findById(req.body.userID);
	existing_entry = await Movie.findOne({
		title: req.body.title,
		user: user
	});
	if (!existing_entry) {
		movie = new Movie({
			title: req.body.title,
			user: user,
			backgroundImage: req.body.backgroundImage,
			movieID: req.body.movieID
		});
		movie
			.save()
			.then(data => {
				user.movies.push(data);
				user.save(() => {
					console.log("entry add");
				});
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

movieRouter.get('/stream', async (req, res) => {
	console.log(req.query);
	const engine = torrentStream(
		"magnet:?xt=urn:btih:" +
		req.query.hash +
		"&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80"
	);
	let range = req.header.range;

	engine.on("ready", function () {
		engine.files.forEach(function (file) {
			file_ext = file.name.split(".").pop();
			if (file_ext == "mp4") {
				console.log("Streaming file");
				if (range) {
					console.log("range:", range)
					const parts = range.replace(/bytes=/, "").split("-");
					const start = parseInt(parts[0], 10);
					const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

					const chunksize = end - start + 1;
					const stream = file.createReadStream({
						start: start,
						end: end
					});
					const head = {
						"Content-Range": `bytes ${start}-${end}/${fileSize}`,
						"Accept-Ranges": "bytes",
						"Content-Length": chunksize,
						"Content-Type": "video/mp4"
					};

					res.writeHead(206, head);
					stream.pipe(res);
				}
			}
		});
	});
})

module.exports = movieRouter;