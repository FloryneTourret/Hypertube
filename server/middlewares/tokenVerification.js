const jwt = require('jsonwebtoken');

const tokenVerification = (req, res, next) => {
	var token = req.headers['access_token'];

	if (token) {
		jwt.verify(token, process.env.SECRET, (err, decoded) => {
			if (err) {
				console.log("Request attempted with invalid token.");
				return res.json({ message: 'invalid token' });
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		res.send({
			message: 'No token provided.'
		})
	}
};

module.exports = tokenVerification;