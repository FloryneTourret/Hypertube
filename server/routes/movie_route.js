const express = require("express");
const Movie = require("../schemas/Movie");
const User = require("../schemas/User");
const torrentStream = require("torrent-stream");
const fs = require('fs');
const ffmpeg = require('ffmpeg');
const movieRouter = express.Router({
	mergeParams: true
});

require("dotenv").config();

movieRouter.get('/stream', async (req, res) => {
	if (!req.session.movie || req.session.movie.movieID != req.query.id) {
		req.session.movie = await Movie.findOne({
			movieID: req.query.id
		});
	}
	if (req.session.movie) {
		var torrents = req.session.movie.torrents;
		const engine = torrentStream(
			"magnet:?xt=urn:btih:" +
			torrents[0].hash +
			"&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80"
		);
		let range = req.headers.range;
		var fileSize = torrents[0].size_bytes;

		engine.on("ready", () => {
			engine.files.forEach((file) => {
				file_ext = file.name.split(".").pop();
				if (["mkv", "mp4"].includes(file_ext)) {
					var dest = fs.createWriteStream(__dirname + '/' + file.name, {
						'flags': 'a'
					});
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
						stream.pipe(dest);
						stream.pipe(res);
					}
				};
			});
		});
		req.session.movie.lastPlayed = Date.now();
		req.session.movie.save();
	}
})

movieRouter.get('/:id', async (req, res) => {
	Movie.findOne({
		movieID: req.params.id
	}).then(docs => {
		res.json(docs);
	}).catch(error => {
		console.log(error);
	})
});

module.exports = movieRouter;