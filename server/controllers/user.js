const {
	validationResult,
	body
} = require('express-validator');

const User = require('../schemas/User');
const bcrypt = require('bcrypt');

function inRange(len, start, end) {
	return len >= start && len <= end;
}

function hasSpecial(str) {
	let specialChars = ["\\", "@", "%"];
	return specialChars.includes(str.split(''));
}

function stringEscape(s) {
	return s ? s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/[\x00-\x1F\x80-\x9F]/g, hex) : s;

	function hex(c) {
		var v = '0' + c.charCodeAt(0).toString(16);
		return '\\x' + v.substr(v.length - 2);
	}
}

function control(infos) {
	var strongRegex = new RegExp(
		"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
	);

	if (!inRange(infos.username.length, 2, 42) && hasSpecial(infos.username)) {
		console.log("user name")
		return false;
	}
	if (!inRange(infos.firstName.length, 2, 42)) {
		console.log("first name")
		return false;
	}
	if (!inRange(infos.lastName.length, 2, 42) && namesRegex.test(infos.lastName) == false) {
		console.log("last name")
		return false;
	}
	if (!inRange(infos.password.length, 8, 2000) && strongRegex.test(infos.password) === false) {
		console.log("password not strong enough")
		return false;
	}
	return true;
}

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

		let checkMailUsername = await User.find().or([{
			email: email
		}, {
			username: username
		}]);
		if (checkMailUsername.length > 0) {
			res.json({
				message: "Email or username already taken"
			});
		} else {
			if (control({
					username: username,
					email: email,
					firstName: firstName,
					lastName: lastName,
					password: password
				})) {
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
			} else {
				res.json({
					message: "Some fields do not meet requirements."
				})
			}
		}

	} catch (err) {
		return next(err);
	}
}