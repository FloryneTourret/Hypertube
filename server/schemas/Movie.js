const mongoose = require('mongoose');

const MovieSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: String,
	genres: [{
		type: String
	}],
	year: Number,
	rating: Number,
	backgroundImage: {
		type: String
	},
	movieID: {
		type: String,
		required: true
	},
	imdbCode: Number,
	runtime: Number,
	director: String,
	actors: String,
	writer: String,
	torrents: [{
		url: String,
		hash: String,
		size_bytes: Number,
		fileName: String
	}],
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
	}],
	path: String,
	downloaded: Boolean,
	lastPlayed: {
		type: Date,
		default: Date.now
	},
	creation_date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Movie', MovieSchema);