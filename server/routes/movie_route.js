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
const OS = require('opensubtitles-api');
const http = require('http');

require("dotenv").config();

async function downloadSubtitles(movie) {
	console.log("downloading subtitles")
	const OpenSubtitles = new OS(
		'TemporaryUserAgent'
	);
	OpenSubtitles.search({
		imdbid: movie.imdbCode,
		path: process.env.DOWNLOAD_DEST + movie.torrents[0].fileName,
		filesize: movie.torrents[0].size_bytes,
		extensions: ['srt', 'vtt']
	}).then(async (subtitles) => {
		var path = __dirname + '/subtitles/' + movie.torrents[0].fileName.split('/')[0];
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
		for (i in subtitles) {
			if (["en", "fr"].includes(subtitles[i].langcode)) {
				var file = fs.createWriteStream(path + '/' + subtitles[i].filename);
				http.get(subtitles[i].url, (response) => {
					response.pipe(file);
				});

				var vttFile = movie.torrents[0].fileName.split('/')[0] + '/' + subtitles[i].filename.split('.').pop() + '.vtt';
				var srtData = fs.readFileSync(file);
				await srt2vtt(srtData, function (err, vttData) {
					if (err) throw new Error(err);
					fs.writeFileSync(__dirname + '/subtitles/' + vttFile, vttData);
				});

				movie.torrents[0].subtitles.push({
					language: subtitles[i].lang,
					srtPath: movie.torrents[0].fileName.split('/')[0] + '/' + subtitles[i].filename,
					vttPath: vttFile
				})
			}
		}
		movie.save(error => {
			console.log(error);
		})
	}).catch(error => {
		console.log(error);
	})
}

// async function checkAndConvertSubtitle(movie) {
// 	console.log("Verifying subtitles...");
// 	console.log(movie.torrents[0].subtitles);
// 	var changes = false;
// 	for (var i = 0; i < movie.torrents[0].subtitles.length; i++) {
// 		console.log("checking track...")
// 		srtFile = movie.torrents[0].subtitles[i].srtPath;
// 		console.log("SRT FILE = ", srtFile, " i =", i);
// 		if (!movie.torrents[0].subtitles[i].vttPath) {
// 			console.log("Subtitles still in srt")
// 			var srtData = fs.readFileSync(__dirname + '/subtitles/' + srtFile);
// 			vttFile = srtFile.split('.').slice(0, -1).join('.') + '.vtt';
// 			console.log("New vtt file = " + vttFile);

// 			srt2vtt(srtData, function (err, vttData) {
// 				if (err) throw new Error(err);
// 				var dir = vttFile.split('/');
// 				if (!fs.existsSync((__dirname + '/subtitles/' + vttFile.split('/')[0]))) {
// 					fs.mkdirSync(__dirname + '/subtitles/' + vttFile.split('/')[0]);
// 				}
// 				fs.writeFileSync(__dirname + '/subtitles/' + vttFile, vttData);
// 				changes = true;
// 			});
// 			movie.torrents[0].subtitles[i].vttPath = vttFile;

// 		}
// 	}
// 	if (changes) {
// 		try {
// 			await movie.save();
// 		} catch (err) {
// 			console.log(err);
// 		}
// 	}
// }

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
					user.save((err) => {
						if (err) throw err;
					});
				}
			})
			.catch(err => {
				throw err;
			});

		if (movie.downloaded == false) {
			if (fs.existsSync(process.env.DOWNLOAD_DEST + movie.torrents[0].fileName) && !ready) {
				ready = true;
				sendVideoStream(req.headers.range, movie, res);
			}

			const engine = torrentStream(
				"magnet:?xt=urn:btih:" +
				movie.torrents[0].hash +
				"&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80", {
				path: process.env.DOWNLOAD_DEST
			}
			);

			var fileName = "";

			engine.on("ready", async () => {
				engine.files.forEach((file) => {
					file_ext = file.name.split(".").pop();
					if (["mp4", "mkv"].includes(file_ext)) {
						file.select();
						fileName = file.path;
						if (movie.torrents[0].fileName != fileName) {
							movie.torrents[0].fileName = fileName;
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
				if (movie.downlaoded == false && fs.statSync(process.env.DOWNLOAD_DEST + movie.torrents[0].fileName).size == movie.torrents[0].size_bytes) {
					movie.downlaoded = true;
					ready = true;
					try {
						await movie.save();
					} catch (err) {
						console.log("There was an error : ", err);
					}
				}
				if (ready) {
					sendVideoStream(req.headers.range, movie, res);
				}
			});
			engine.on('download', () => {
				if (fs.existsSync(process.env.DOWNLOAD_DEST + movie.torrents[0].fileName) && !ready) {
					ready = true;
					sendVideoStream(req.headers.range, movie, res);
				}
			})
		} else {
			console.log("sending video")
			sendVideoStream(req.headers.range, movie, res);
		}
	}
})

function sendVideoStream(range, movie, res) {
	var filename = process.env.DOWNLOAD_DEST + movie.torrents[0].fileName;
	var fileSize = fs.statSync(filename).size;
	const parts = range.replace(/bytes=/, "").split("-");
	const start = parseInt(parts[0], 10);
	const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

	console.log(start, range)

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

movieRouter.get('/:id/subtitles', async (req, res) => {
	console.log("Je suis la")
	movie = await Movie.findOne({ movieID: req.params.id });
	await downloadSubtitles(movie);
	// await checkAndConvertSubtitle(movie);
	if (req.query.lang) {
		// do stuff
	} else {
		movie2 = await Movie.findOne({ movieID: req.params.id });
		res.sendFile(__dirname + '/subtitles/' + movie2.torrents[0].subtitles[movie2.torrents[0].subtitles.length - 2].vttPath);
	}
})

module.exports = movieRouter;