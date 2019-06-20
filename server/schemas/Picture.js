const mongoose = require('mongoose');

const PictureSchema = mongoose.Schema({
	picture: {
		type: String,
		required: true,
    }
});

module.exports = mongoose.model('Picture', PictureSchema);