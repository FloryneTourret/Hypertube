const OS = require('opensubtitles-api');
const request = require('request');
var srt2vtt = require('srt-to-vtt');
const Path = require('path');
const fs = require('fs');

async function download(url, dest, cb) {
	const path = Path.resolve(dest);
	const writer = fs.createWriteStream(path);

	const sendReq = request.get(url);

	sendReq.on('response', (response) => {
		if (response.statusCode !== 200) {
			return cb("Track is not valid.");
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

const downloadSubtitles = async function (movie, langcode, fileName) {
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

	var path = Path.resolve(__dirname + '/../subtitles');
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
		download(track.url, track.dest, async (err) => {
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
				try {
					await movie.save();
					return (track.dest);
				} catch (err) { }
			} else if (track.srt) {
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

module.exports = downloadSubtitles;
