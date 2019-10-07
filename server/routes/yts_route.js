const express = require('express');
const axios = require('axios');
const Movie = require("../schemas/Movie");
const torrentStream = require("torrent-stream");
const ytsRouter = express.Router({
	mergeParams: true
});
const request = require('request');
var srt2vtt = require('srt-to-vtt');
const Path = require('path');
const OS = require('opensubtitles-api');
const fs = require('fs');

require('dotenv').config();

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

async function downloadSubtitles(movie, langcode) {
	console.log("downloading subtitles")

	const OpenSubtitles = new OS({
		useragent: 'hypertube1',
		ssl: true
	}
	);
	let subtitles = await OpenSubtitles.search({
		imdbid: movie.imdbCode,
		filesize: movie.torrents[0].size_bytes,
		extensions: ['srt', 'vtt']
	});
	console.log("----------------------------");

	var path = __dirname + '/subtitles/';
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
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

ytsRouter.get('/:query/:page/:min_rate/:max_rate/:min_year/:max_year', async (req, res) => {
	var result = [];
	var result2 = [];
	page = req.params.page

	axios
		.get('https://yts.unblocked.tw/api/v2/list_movies.json?' + req.params.query + '&' + page)
		.then(async response => {
			result = response.data.data.movies
			if (req.params.min_rate != 'null' && req.params.max_rate != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].rating >= req.params.min_rate && result[i].rating <= req.params.max_rate) {
						result2.push(result[i])
					}
				}
				result = result2
			} else if (req.params.min_rate != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].rating >= req.params.min_rate) {
						result2.push(result[i])
					}
				}
				result = result2
			} else if (req.params.max_rate != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].rating <= req.params.max_rate) {
						result2.push(result[i])
					}
				}
				result = result2
			}

			if (req.params.min_year != 'null' && req.params.max_year != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].year >= req.params.min_year && result[i].year <= req.params.max_year) {
						result2.push(result[i])
					}
				}
				result = result2
			} else if (req.params.min_year != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].year >= req.params.min_year) {
						result2.push(result[i])
					}
				}
				result = result2
			} else if (req.params.max_year != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].year <= req.params.max_year) {
						result2.push(result[i])
					}
				}
				result = result2
			}
			result2 = result
			if (req.params.query.includes('&query_term=')) {
				var result3;
				for (var i = 0; i < result2.length; i++) {
					result3 = await axios
						.get('http://www.omdbapi.com/?i=' + result2[i].imdb_code + '&apikey=9ddabdb9')
					result[i].director = result3.data.Director
					result[i].actors = result3.data.Actors
				}
			}
			res.json(result);
		})
		.catch(error => {
			res.json({
				message: error
			})
		})
});

ytsRouter.get('/preview/:id', async (req, res) => {
	movie = await Movie.findOne({
		movieID: req.params.id
	});
	if (movie != null) {
		res.json(movie);
	} else {
		console.log("New movie entry...")
		axios
			.get('https://yts.unblocked.tw/api/v2/movie_details.json?movie_id=' + req.params.id)
			.then(async (response) => {
				movieData = response.data.data.movie;
				// console.log(movieData)
				axios
					.get('http://www.omdbapi.com/?i=' + movieData.imdb_code + '&apikey=9ddabdb9')
					.then(async result => {
						movie = new Movie({
							title: movieData.title,
							description: movieData.description_intro,
							genres: movieData.genres,
							year: movieData.year,
							rating: movieData.rating,
							backgroundImage: movieData.medium_cover_image,
							movieID: movieData.id,
							downloaded: false,
							imdbCode: movieData.imdb_code,
							runtime: result.data.Runtime,
							director: result.data.Director,
							writer: result.data.Writer,
							actors: result.data.Actors,
						});
						for (i in movieData.torrents) {
							movie.torrents.push({
								url: movieData.torrents[i].url,
								hash: movieData.torrents[i].hash,
								size_bytes: movieData.torrents[i].size_bytes,
								fileName: movieData.torrents[i].file
							});
						} try {
							await movie.save();
						} catch (err) {
							console.log("There was an error saving movie :");
						}
						movie
							.save((err, docs) => {
								if (err)
									res.json({
										message: err
									});

							})

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
							await downloadSubtitles(movie, "en")
							await downloadSubtitles(movie, "fr")
							res.json(movie);
						});
					})
					.catch(error => {
						console.log(error);
					})
			})
			.catch(error => {
				console.log(error);
				res.json({
					message: error
				})
			})
	}
})

module.exports = ytsRouter;