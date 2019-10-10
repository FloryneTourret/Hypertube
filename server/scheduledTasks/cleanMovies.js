const Movie = require('../schemas/Movie');
const fs = require('fs')

const cleanMovies = function () {
	console.log("------------------------");
	console.log("Cleaning old movies...");
	console.log("------------------------");
	let days = 30;
	let cutOff = new Date();
	cutOff.setDate(cutOff.getDate() - days);
	console.log("Searching movies not played since " + cutOff + " (" + days + " days) or more...");
	Movie.find({
		lastPlayed: {
			$lt: cutOff
		}
	}, (err, docs) => {
			if (err) console.log(err);
			if (docs.length > 0) {
				console.log(docs.length + " movie(s) found :");
				docs.forEach((movie) => {
					console.log(movie.title + " last played : " + movie.lastPlayed);
					deleteFile(process.env.DOWNLOAD_DEST + movie.torrents[0].fileName, movie);
				})
			} else {
				console.log("No movies older than " + days + " days.");
			}
	})
}

function deleteFile(path, movie) {
	console.log("Deleting file... : " + movie.filename)
	fs.unlink(path, (err) => {
		if (err) {
			console.error(err)
			return
		}
		Movie.deleteOne({ _id: movie._id }, (err) => {
			if (err) console.log(err);
			console.log("Removed successfully.")
		})
	})
}

module.exports = cleanMovies;
