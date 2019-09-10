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
	torrents: [{
		url: String,
		hash: String,
		size_bytes: Number,
		fileName: String
	}],
	path: String,
	downloaded: Boolean,
	creation_date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Movie', MovieSchema);