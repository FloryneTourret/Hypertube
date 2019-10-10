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
const OS = require('opensubtitles-api');
const request = require('request');
var srt2vtt = require('srt-to-vtt');
const Path = require('path');

require("dotenv").config();


async function download(url, dest, cb) {
	const path = Path.resolve(dest);
	const writer = fs.createWriteStream(path);

	console.log("DESTINATION FILE IS ", dest)
	const sendReq = request.get(url);

	sendReq.on('response', (response) => {
		if (response.statusCode !== 200) {
			return cb('Response status was ' + response.statusCode + ' for url : ' + url);
		}
	});

	sendReq.on('error', (err) => {
		fs.unlink(dest);
		cb(err.message);
	});

	sendReq.pipe(writer);

	writer.on('finish', () => {
		writer.close(cb);
	});

	writer.on('error', (err) => {
		fs.unlink(dest);
		cb(err.message);
	})
};

function makeid(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

async function downloadSubtitles(movie, langcode, fileName) {
	console.log("downloading subtitles")

	const OpenSubtitles = new OS({
		useragent: 'hypertube1',
		ssl: true
	}
	);
	let subtitles = await OpenSubtitles.search({
		imdbid: movie.imdbCode,
		filesize: movie.torrents[0].size_bytes,
		filename: fileName.split('/')[1],
		extensions: ['srt', 'vtt']
	});
	console.log("----------------------------");

	var path = __dirname + '/subtitles/';
	fs.access(path, fs.constants.F_OK, (err) => {
		if (err) {
			fs.mkdirSync(path);
		}
	});
	let track = {};
	console.log("----------------------------");
	for (i in subtitles) {
		if (subtitles[i].langcode == langcode && subtitles[i].vtt) {
			console.log("Found track in vtt for " + langcode)
			track = {
				url: subtitles[i].vtt,
				dest: path + '/' + makeid(10) + '.vtt',
				lang: subtitles[i].lang,
				vtt: true
			};
		} else if (subtitles[i].langcode == langcode && subtitles[i].srt) {
			console.log("Found track in srt for " + langcode)
			track = {
				url: subtitles[i].srt,
				dest: path + '/' + makeid(10) + '.srt',
				lang: subtitles[i].lang,
				srt: true
			};
		}
	}
	if (track.url) {
		download(track.url, track.dest, (err) => {
			if (err) {
				console.log(err);
				return;
			}

			console.log('Finished Downloading' + track.dest);
			if (track.vtt) {
				movie.torrents[0].subtitles.push({
					language: track.lang,
					vttPath: track.dest
				})
				movie.save((err) => {
					if (err)
						console.log(err);
					return (track.dest);
				});
			} else if (track.srt) {
				console.log("must convert");
				convertVtt(track, movie).then(() => {
					console.log("Successfully converted to vtt")
				}).catch(error => {
					console.log("error converting vtt : " + error)
				})
			}
			console.log("New subtitle entry added");
		})
	}
}

async function convertVtt(track, movie) {
	console.log("converting to vtt");
	console.log("Destination = ", track.dest.split('.').slice(0, -1).join('.') + '.vtt');
	vttFileName = track.dest.split('.').slice(0, -1).join('.') + '.vtt';
	fs.createReadStream(track.dest)
		.pipe(srt2vtt())
		.pipe(fs.createWriteStream(track.dest.split('.').slice(0, -1).join('.') + '.vtt')).on("close", () => {
			console.log("Finished");
		});
	movie.torrents[0].subtitles.push({
		language: track.lang,
		vttPath: vttFileName
	});
	movie.save(error => {
		if (error) {
			console.log(error)
		}
	})
}

movieRouter.get('/stream', async (req, res) => {
	console.log("DOWNLOAD DEST : " + process.env.DOWNLOAD_DEST);
	console.log('id movie  == ', req.query.id)
	if (req.query.id) {
		let sent = false;
		movie = await Movie.findOne({
			movieID: req.query.id
		});
		movie.lastPlayed = Date.now();
		try {
			await movie.save();
		} catch (err) {
			console.log(err)
		}
		console.log("movie  = " + movie)

		if (movie.downloaded == false) {
			fs.access(process.env.DOWNLOAD_DEST + movie.torrents[0].fileName, fs.constants.F_OK, (err) => {
				if (!err) {
					sent = true;
					console.log("file ready so sending now")
					sendVideoStream(req.headers.range, movie, res);
				}
			});

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
					console.log("There was an error saving movie :" + err);
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
				if (movie) {
					if (!sent) {
						fs.stat(process.env.DOWNLOAD_DEST + movie.torrents[0].fileName, (err, stats) => {
							if (err) {
								console.log("File doesn't exists yet ")
							} else {
								console.log(movie.title + " can be send");
								sent = true;
								sendVideoStream(req.headers.range, movie, res);
							}
						});
					}

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
	}
}

movieRouter.get("/:id", async (req, res) => {
	movie = await Movie.findOne({
		movieID: req.params.id
	});
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
				fileName = file.path;
				found = true;
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
		movie = await Movie.findOne({
			movieID: req.params.id
		});
		res.json(movie);
	});
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
					res.sendFile(movie.torrents[0].subtitles[i].vttPath);
					break;
				}
			}
		}
		if (!trackExists) {
			var langcode = req.query.lang == "English" ? "en" : "fr";
			downloadSubtitles(movie, langcode).then(response => {
				console.log('callback response is ' + response);

			}).catch(error => {
				console.log("Maybe it fails for a subtitle track");
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