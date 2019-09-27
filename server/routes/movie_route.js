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
const srt2vtt = require('srt2vtt');
const path = require('path');

require("dotenv").config();

async function checkAndConvertSubtitle(movie) {
	console.log("Verifying subtitles...");
	// fileName = movie.torrents[0].engSubPath;
	// if (fileName.split(".").pop() == "srt") {
	// 	console.log("Subtitles still in srt")
	// 	var srtData = fs.readFileSync('/Users/naplouvi/goinfre/hypertube/download/' + fileName);
	// 	newFileName = fileName.split('.').slice(0, -1).join('.') + '.vtt';
	// 	console.log("New filename = " + newFileName);

	// 	srt2vtt(srtData, function (err, vttData) {
	// 		if (err) throw new Error(err);
	// 		fs.writeFileSync(__dirname + '/../../client/subtitles/' + newFileName, vttData);
	// 	});
	// 	movie.torrents[0].engSubPath = newFileName;
	// 	try {
	// 		await movie.save();
	// 	} catch (err) {
	// 		console.log(err);
	// 	}
	// }
	console.log("Nothing to do here.")
}

movieRouter.get('/stream', async (req, res) => {
	if (req.query.id) {
		let ready = false;
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
			if (fs.existsSync('/Users/naplouvi/goinfre/hypertube/download/' + movie.torrents[0].fileName) && !ready) {
				ready = true;
				sendVideoStream(req.headers.range, movie, res);
			}

			const engine = torrentStream(
				"magnet:?xt=urn:btih:" +
				movie.torrents[0].hash +
				"&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80", { path: '/Users/naplouvi/goinfre/hypertube/download' }
			);

			var fileName = "";

			engine.on("ready", async () => {
				engine.files.forEach((file) => {
					file_ext = file.name.split(".").pop();
					if (["mp4", "mkv", "srt"].includes(file_ext)) {
						file.select();
						fileName = file.path;
						if (file_ext != "srt" && movie.torrents[0].fileName != fileName) {
							movie.torrents[0].fileName = fileName;
						} else if (file_ext == "srt") {
							console.log("Downloading subtitle track...");
							movie.torrents[0].engSubPath = fileName;
						}
						console.log("Downloading : " + file.path);
					}
				});
				try {
					await movie.save();
				} catch (err) {
					console.log("There was an error saving movie :");
					console.log(err);
				}
			});
			engine.on('idle', async () => {
				console.log("Files completely downloaded");
				if (movie.downlaoded == false && fs.statSync('/Users/naplouvi/goinfre/hypertube/download/' + movie.torrents[0].fileName).size == movie.torrents[o].size_bytes) {
					movie.downlaoded = true;
					try {
						await movie.save();
					} catch (err) {
						console.log("There was an error", err);
					}
				}
			});
			engine.on('download', () => {
				if (fs.existsSync('/Users/naplouvi/goinfre/hypertube/download/' + movie.torrents[0].fileName) && !ready) {
					ready = true;
					sendVideoStream(req.headers.range, movie, res);
				}
			})
		} else {
			sendVideoStream(req.headers.range, movie, res);
		}
	}
})

function sendVideoStream(range, movie, res) {
	var filename = '/Users/naplouvi/goinfre/hypertube/download/' + movie.torrents[0].fileName;
	var fileSize = fs.statSync(filename).size;
	const parts = range.replace(/bytes=/, "").split("-");
	const start = parseInt(parts[0], 10);
	const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

	checkAndConvertSubtitle(movie);

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
