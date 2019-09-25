const express = require("express");
const Movie = require("../schemas/Movie");
const User = require("../schemas/User");
const torrentStream = require("torrent-stream");
const movieRouter = express.Router({
	mergeParams: true
});
const Client = require('node-torrent');
const GrowingFile = require('growing-file');
const fs = require('fs');

require("dotenv").config();

function downloadTorrent(movie) {
	const engine = torrentStream(
		"magnet:?xt=urn:btih:" +
		movie.torrents[0].hash +
		"&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80", { path: '/sgoinfre/Perso/naplouvi/hypertube/download' }
	);

	var fileName = "";

	engine.on("ready", () => {
		engine.files.forEach(file => {
			file_ext = file.name.split(".").pop();
			if (["mp4", "mkv"].includes(file_ext)) {
				file.select();
				fileName = file.path;
				movie.torrents[0].fileName = fileName;
				movie.save((err, doc) => {
					if (err)
						throw err;
				});
				console.log("Starting download : ", file.path);
			}
		});
	});
	engine.on('idle', () => {
		console.log("File completely downloaded");
		movie.downlaoded = true;
		movie.save((err, doc) => {
			if (err)
				throw err;
		});
	});
	engine.on('download', () => {
	})
}

movieRouter.get('/stream', async (req, res) => {
	if (req.query.id) {
		movie = await Movie.findOne({
			movieID: req.query.id
		});
		User.findOne({
			username: req.query.username
		})
			.then(user => {
				if (user.movies.includes(movie._id)) {
					console.log("Movie already in seen array for ", user.username);
				} else {
					console.log("Adding movie to ", user.username);
					user.movies.push(movie._id);
					user.save((err, user) => {
						if (err) throw err;
					});
				}
			})
			.catch(err => {
				throw err;
			});
	}

	if (movie.downloaded == false) {
		downloadTorrent(movie);
	}
	// var file = GrowingFile.open('/sgoinfre/Perso/naplouvi/hypertube/download/' + )
})

// movieRouter.get("/stream", async (req, res) => {
// 	if (!req.session.movie || req.session.movie.movieID != req.query.id) {
// 		req.session.movie = await Movie.findOne({
// 			movieID: req.query.id
// 		});
// 		User.findOne({
// 			username: req.query.username
// 		})
// 			.then(user => {
// 				if (user.movies.includes(req.session.movie._id)) {
// 					console.log("Movie already in seen array for ", user.username);
// 				} else {
// 					console.log("Adding movie to ", user.username);
// 					user.movies.push(req.session.movie._id);
// 					user.save(err => {
// 						if (err) throw err;
// 					});
// 				}
// 			})
// 			.catch(err => {
// 				throw err;
// 			});
// 	}
// 	if (req.session.movie) {
// 		var torrents = req.session.movie.torrents;
// 		const engine = torrentStream(
// 			"magnet:?xt=urn:btih:" +
// 			torrents[0].hash +
// 			"&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80"
// 		);
// 		let range = req.headers.range;
// 		var fileSize = torrents[0].size_bytes;

// 		engine.on("ready", () => {
// 			engine.files.forEach(file => {
// 				file_ext = file.name.split(".").pop();
// 				console.log(file.name);
// 				if (["mp4", "mkv"].includes(file_ext) && range) {
// 					console.log("range:", range);
// 					const parts = range.replace(/bytes=/, "").split("-");
// 					const start = parseInt(parts[0], 10);
// 					const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

// 					const chunksize = end - start + 1;
// 					const stream = file.createReadStream({
// 						start: start,
// 						end: end
// 					});

// 					const head = {
// 						"Content-Range": `bytes ${start}-${end}/${fileSize}`,
// 						"Accept-Ranges": "bytes",
// 						"Content-Length": chunksize,
// 						"Content-Type": "video/mp4"
// 					};

// 					res.writeHead(206, head);
// 					stream.pipe(res);
// 				}
// 			});
// 		});
// 		req.session.movie.lastPlayed = Date.now();
// 		req.session.movie.save();
// 	}
// });

movieRouter.get("/:id", async (req, res) => {
	Movie.findOne({
		movieID: req.params.id
	})
		.then(docs => {
			res.json(docs);
		})
		.catch(error => {
			console.log(error);
		});
});

module.exports = movieRouter;
