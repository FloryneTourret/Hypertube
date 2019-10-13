const {body} = require('express-validator/check');
const {validationResult } = require('express-validator/check');
const User = require('../schemas/User');
const bcrypt = require('bcrypt');

exports.validate = (method) => {
	switch (method) {
		case 'createUser': {
			return [
				body('username', "username doesn't exists").exists(),
				body('email', "Invalid email").exists().isEmail(),
				body('firstName', 'First name not provided').exists(),
				body('lastName', 'Last name not provided').exists(),
				body('password', 'Password not provided').exists(),
			]
		}
	}
}

exports.createUser = async (req, res, next) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.status(200).json({
				errors: errors.array()
			});
			return;
		}

		let {
			username,
			email,
			firstName,
			lastName,
			password
		} = req.body;

		user = new User({
			email: email.toLowerCase(),
			picture: "img/default.png",
			lang: "en",
			username: username,
			firstName: firstName.charAt(0).toUpperCase() + firstName.toLowerCase().slice(1),
			lastName: lastName.toUpperCase(),
			password: bcrypt.hashSync(password, 10),
			authProvider: "local"
		});

		user.save()
			.then((doc) => {
				console.log("New user created.");
				res.json(doc);
			})
			.catch((err) => {
				res.json({
					message: err
				});
			})
	} catch (err) {
		return next(err);
	}
}