const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const usersRouter = express.Router({
	mergeParams: true
});
const User = require('../schemas/User');

usersRouter.get('/', (req, res) => {
	User.find({}, (err, docs) => {
		res.json(docs);
	})
});
usersRouter.get('/:userId', async (req, res) => {
	User.findById(req.params.userId, (err, doc) => {
		if (err)
			console.log(err);
		else
			res.json(doc);
	})
})

usersRouter.post('/', async (req, res) => {
	user = new User({
		email: req.body.email.toLowerCase(),
		username: req.body.username,
		firstName: req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1),
		lastName: req.body.lastName.toUpperCase(),
		password: bcrypt.hashSync(req.body.password, 10)
	});
	user.save()
		.then((data) => {
			res.json(data);
		})
		.catch((err) => {
			res.json({
				message: err
			});
		})
});

usersRouter.post('/login', async (req, res) => {
	var user = await User.findOne({
		username: {
			$regex: new RegExp(req.body.username, "i")
		}
	});
	if (user) {
		if (bcrypt.compareSync(req.body.password, user.password)) {
			req.session.id = user._id;
			req.session.username = user.username;
			res.status(200).send(user);
		} else {
			res.status(401).send("KO");
		}
	} else {
		res.status(404).send("Not found");
	}
})

usersRouter.post('/resetpassword', async (req, res) => {
	if (req.body.email) {
		User.findOne({
			email: req.body.email
		}, (err, user) => {
			if (!user) {
				res.status(404).send("User not found.");
			} else {
				var token = crypto.randomBytes(64).toString('hex');
				var expiration = Date.now() + 3600000;
				user.resetPasswordToken = token;
				user.resetPasswordExpires = expiration;

				user.save((err) => {
					if (err)
						res.send(err);
					else {

						console.log(user.email);

						var transporter = nodemailer.createTransport({
							service: 'gmail',
							auth: {
								user: 'mexicainssouspayes@gmail.com',
								pass: '@X4rqRGkf'
							}
						});

						var mailOptions = {
							from: 'hypertube@le-101.fr',
							to: user.email,
							subject: 'Reset password request',
							text: 'You just requested a password reset.Go to : http://localhost:8080/resetpasswordreq?token=' + token
						};

						transporter.sendMail(mailOptions, function (error, info) {
							if (error) {
								console.log(error);
							} else {
								console.log('Email sent: ' + info.response);
							}
						});
						res.status(200).send(token);
					}

				})
			}
		});
	}
});



module.exports = usersRouter;