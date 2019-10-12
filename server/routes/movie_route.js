const express = require("express");
const Movie = require("../schemas/Movie");
const User = require("../schemas/User");
const torrentStream = require("torrent-stream");
const movieRouter = express.Router({
	mergeParams: true
});
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const growingFile = require('growing-file');
const pump = require('pump');

const downloadSubtitles = require('../tools/downloadSubtitles');

require("dotenv").config();

movieRouter.get('/:id/ready', async (req, res) => {
	movie = await Movie.findOne({
		movieID: req.params.id
	});

	var path = process.env.DOWNLOAD_DEST + movie.torrents[0].fileName;
	if (movie.downloaded == false) {
		fs.access(path, fs.constants.F_OK, (err) => {
			if (!err) {
				file = fs.statSync(path);
				var downloaded_percentage = Math.floor(100 * file.size / movie.torrents[0].size_bytes);
				console.log("Downloading " + movie.title + " : " + downloaded_percentage + "% downloaded")
				if (downloaded_percentage >= 5) {
					console.log("file ready so sending now")
					res.send('ready');
				} else {
					res.send('unready');
				}
			} else {
				console.log("file unready");
				res.send('unready');
			}
		});
	}
})

movieRouter.get('/:id/video', async (req, res) => {
	console.log("Sending video stream");
	movie = await Movie.findOne({
		movieID: req.params.id
	});

	let range = req.headers.range;

	var filename = process.env.DOWNLOAD_DEST + movie.torrents[0].fileName;
	var fileSize = fs.statSync(filename).size;
	const parts = range.replace(/bytes=/, "").split("-");
	const start = parseInt(parts[0], 10);
	let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
	if (end < start) {
		end = start + 1
	};

	var file_ext = filename.split(".").pop();
	if (file_ext == "mkv") {
		const stream = growingFile.open(filename);

		let conversion = ffmpeg(stream)
			.withVideoCodec("libvpx")
			.withVideoBitrate("1500")
			.withAudioCodec("libvorbis")
			.withAudioBitrate("256k")
			.audioChannels(2)
			.outputOptions([
				"-preset ultrafast",
				"-deadline realtime",
				"-error-resilient 1",
				"-movflags +faststart",
			])
			.format("matroska")
		const head = {
			'Content-Type': 'video/mp4',
		}

		res.writeHead(200, head);
		pump(conversion, res);
	} else {
		const chunksize = end - start + 1;

		const stream = fs.createReadStream(filename, {
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
		console.log("file sent to front")

		movie.lastPlayed = Date.now();
		try {
			await movie.save();
		} catch (err) {
			console.log(err)
		}
	}
})

async function startEngine(movie) {
	const engine = torrentStream(
		"magnet:?xt=urn:btih:" +
		movie.torrents[0].hash +
		"&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80", {
			path: process.env.DOWNLOAD_DEST
		}
	);

	let fileName = "";
	let found = false;

	engine.on("ready", async () => {
		engine.files.forEach((file) => {
			file_ext = file.name.split(".").pop();
			if (["mp4", "mkv"].includes(file_ext) && !found) {
				file.select();
				found = true;
				fileName = file.path;
				if (movie.torrents[0].fileName != fileName) {
					movie.torrents[0].fileName = fileName;
				}
				console.log("Downloading : " + file.path);
			}
		});
		if (movie.torrents[0].subtitles[0] == undefined) {
			await downloadSubtitles(movie, "fr", fileName)
		}
		if (movie.torrents[0].subtitles[1] == undefined) {
			await downloadSubtitles(movie, "en", fileName);
		}
		try {
			await movie.save();
		} catch (err) {
			console.log("There was an error saving movie :" + err);
		}
	});
	engine.on('idle', async () => {
		if (movie.downloaded == false) {
			console.log("Finished downloading ");
			movie.downloaded = true;
			try {
				await movie.save();
			} catch (err) {}
		}
	});
}

movieRouter.get("/:id", async (req, res) => {
	movie = await Movie.findOne({
		movieID: req.params.id
	});

	res.json(movie);
	startEngine(movie).then(() => {
		console.log("Engine started")
	}).catch(err => {});

	User.findOne({
			username: req.query.username
		})
		.then(user => {
			if (user.movies != null && user.movies.includes(movie._id) === false) {
				console.log("Adding movie to ", user.username);
				user.movies.push(movie._id);
				user.save((err) => {
					if (err) throw err;
				});
			} else if (user.movies === null) {
				user.movies.push(movie._id);
				user.save((err) => {
					if (err) throw err;
				});
			}
		})
		.catch(err => {
			console.log(err);
		});
});

movieRouter.get('/:id/subtitles', async (req, res) => {
	movie = await Movie.findOne({
		movieID: req.params.id
	});

	if (req.query.lang) {
		var trackExists = false;
		if (movie.torrents[0].subtitles.length > 0) {
			for (i in movie.torrents[0].subtitles) {
				if (movie.torrents[0].subtitles[i].language == req.query.lang) {
					trackExists = true;
					console.log(movie.torrents[0].subtitles[i].vttPath);
					res.sendFile(movie.torrents[0].subtitles[i].vttPath);
					break;
				}
			}
		}
		if (!trackExists) {
			var langcode = req.query.lang == "English" ? "en" : "fr";
			downloadSubtitles(movie, langcode, movie.torrents[0].fileName).then(response => {
				console.log('callback response is ' + response);

			}).catch(error => {
				console.log("Maybe it fails for a subtitle track", error);
			})
		}
	} else {
		movie.torrents[0].subtitles.forEach(track => {
			if (track.language == "English") {
				res.sendFile(track.vttPath);
			}
		})
	}
})

module.exports = movieRouter;