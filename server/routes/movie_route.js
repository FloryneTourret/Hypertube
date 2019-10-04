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
const request = require('request');

require("dotenv").config();

var download = function (url, dest, callback) {

	request.get(url)
		.on('error', function (err) {
			console.log(err)
		})
		.pipe(fs.createWriteStream(dest))
		.on('close', callback);
};

async function downloadSubtitles(movie) {
	if (movie.torrents[0].subtitles.length < 2) {
		console.log("downloading subtitles")

		const OpenSubtitles = new OS(
			'TemporaryUserAgent'
		);
		let subtitles = await OpenSubtitles.search({
			imdbid: movie.imdbCode,
			path: process.env.DOWNLOAD_DEST + movie.torrents[0].fileName,
			filesize: movie.torrents[0].size_bytes,
			extensions: ['srt', 'vtt']
		});
		console.log("----------------------------");

		var path = __dirname + '/subtitles/' + movie.torrents[0].fileName.split('/')[0];
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
		let urlList = [];
		for (i in subtitles) {
			if (["en", "fr"].includes(subtitles[i].langcode)) {
				urlList.push({
					url: subtitles[i].vtt,
					dest: path + '/' + movie.torrents[0].fileName.split('/')[0] + subtitles[i].langcode + '.vtt',
					lang: subtitles[i].lang
				});
			}
		}
		urlList.forEach(track => {
			console.log('Downloading ' + track.dest);
			download(track.url, track.dest, async () => {

				console.log('Finished Downloading' + track.dest)
				movie.torrents[0].subtitles.push({
					language: track.lang,
					vttPath: track.dest
				})
				try {
					await movie.save();
				} catch (err) { }
				console.log("New subtitle entry added");
			});
		});
	} else {
		console.log("Subtitles already in movie");
	}
}

movieRouter.get('/stream', async (req, res) => {
	console.log('id movie  == ', req.query.id)
	if (req.query.id) {
		let sent = false;
		movie = await Movie.findOne({
			movieID: req.query.id
		});
		console.log("movie  = " + movie)

		if (movie.downloaded == false) {
			if (fs.existsSync(process.env.DOWNLOAD_DEST + movie.torrents[0].fileName)) {
				sent = true;
				console.log("file already ready so sending now")
				sendVideoStream(req.headers.range, movie, res);
			}

			const engine = torrentStream(
				"magnet:?xt=urn:btih:" +
				movie.torrents[0].hash +
				"&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80", {
				path: process.env.DOWNLOAD_DEST
			}
			);

			let fileName = "";
			let found = false;
			let saved = false;

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
				try {
					await movie.save();
				} catch (err) {
					console.log("There was an error saving movie :");
				}
			});
			engine.on('idle', async () => {
				if (movie.downloaded == false && !saved) {
					saved = true;
					console.log("finished download");
					movie.downloaded = true;
					try {
						await movie.save();
					} catch (err) { }
				}
				if (!sent) {
					sent = true;
					sendVideoStream(req.headers.range, movie, res);
				}
			});
			engine.on('download', () => {
				if (sent === false) {
					console.log("file not sent yet");
				} else {
					console.log("File sent, but still downloading" + movie.title);
				}
				if (fs.existsSync(process.env.DOWNLOAD_DEST + movie.torrents[0].fileName) && !sent) {
					console.log(movie.title + " can be send");
					sent = true;
					sendVideoStream(req.headers.range, movie, res);
				}
			})
		} else {
			console.log("Movie is ready");
			sendVideoStream(req.headers.range, movie, res);
		}
	}
})

function sendVideoStream(range, movie, res) {
	console.log("Sending video stream");
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
		console.log("file sent to front")
	}
	if (!movie.torrents[0].subtitles.length > 0) {
		console.log("No subtitles...");
		downloadSubtitles(movie);
	}
}

movieRouter.get("/:id/:username", async (req, res) => {
	movie = await Movie.findOne({
		movieID: req.params.id
	});
	res.json(movie);
	User.findOne({
		username: req.params.username
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
});

movieRouter.get('/:id/subtitles', async (req, res) => {
	movie = await Movie.findOne({
		movieID: req.params.id
	});
	console.log("download check fini");
	let subtitles;
	if (req.query.lang) {
		movie.torrents[0].subtitles.forEach(track => {
			if (track.language == req.query.lang)
				subtitles = track.vttPath;
		})
	} else {
		movie.torrents[0].subtitles.forEach(track => {
			if (track.language == "English")
				subtitles = track.vttPath;
		})
	}
	res.sendFile(subtitles);
})

module.exports = movieRouter;