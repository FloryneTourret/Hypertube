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

require("dotenv").config();

movieRouter.get('/stream', async (req, res) => {
	if (req.query.id) {
		let sent = false;
		movie = await Movie.findOne({
			movieID: req.query.id
		});
		User.findOne({
			username: req.query.username
		})
			.then(user => {
				if (!user.movies.includes(movie._id)) {
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

		if (movie.downloaded == false) {
			if (fs.existsSync('/sgoinfre/Perso/naplouvi/hypertube/download/' + movie.torrents[0].fileName) && !sent) {
				sent = true;
				sendFile(req.headers.range, movie, res);
			}

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
						if (file_ext != "srt" && movie.torrents[0].fileName != fileName) {
							movie.torrents[0].fileName = fileName;
							movie.save((err, doc) => {
								if (err)
									throw err;
							});
						}
						console.log("Downloading : " + file.path);
					}
				});
			});
			engine.on('idle', () => {
				console.log("File completely downloaded");
				if (movie.downlaoded == false) {
					movie.downlaoded = true;
					movie.save((err, doc) => {
						if (err)
							throw err;
					});
				}
			});
			engine.on('download', () => {
				if (fs.existsSync('/sgoinfre/Perso/naplouvi/hypertube/download/' + movie.torrents[0].fileName) && !sent) {
					sent = true;
					sendFile(req.headers.range, movie, res);
				}
			})
		} else {
			sendFile(req.headers.range, movie, res);
		}
	}
})

function sendFile(range, movie, res) {
	var filename = '/sgoinfre/Perso/naplouvi/hypertube/download/' + movie.torrents[0].fileName;
	var fileSize = movie.torrents[0].size_bytes;
	const parts = range.replace(/bytes=/, "").split("-");
	const start = parseInt(parts[0], 10);
	const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

	var file_ext = filename.split(".").pop();
	if (file_ext == "mkv") {
		const stream = growingFile.open(filename)

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
			'Content-Type': 'video/webm',
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
	}
}

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
