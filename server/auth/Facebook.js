const express = require("express");
const Facebook = express.Router();
const User = require("../schemas/User");
const jwt = require('jsonwebtoken');

Facebook.get("/", (req, res) => {
	res.send("You need to chose a strategy : login or register");
});


Facebook.post("/register", async (req, res) => {
	users = await User.find({email: req.body.data.email});
	if (users.length > 0) {
		res.json({message: "User exists with this email"});
		return;
	}
	var username =
		req.body.firstName +
		req.body.lastName + Math.floor(Math.random() * 1000) +
		1;
	console.log("username = " + username);
	user = new User({
		firstName: req.body.firstName,
		picture: "img/default.png",
		lastName: req.body.lastName,
		username: username,
		facebookID: req.body.facebookID,
		authProvider: "facebook"
	});
	user
		.save()
		.then(data => {
			console.log(data);
			res.status(200).json(data);
		})
		.catch(err => {
			console.log(err);
			res.status(200).json({
				message: err
			});
		});
});

Facebook.get("/login", async (req, res) => {
	let user = await User.findOne({
		facebookID: req.query.id,
		authProvider: req.query.provider
	});
	if (user != null) {
			const payload = {
				check: true,
				userid: user._id
			}

			var token = jwt.sign(payload, process.env.SECRET, {
				expiresIn: "2 days"
			});

			res.status(200).send({
				user: user,
				token: token
			});
	} else {
		res.json({
			message: "No Facebook account registered. You need to register first."
		});
	}
});

module.exports = Facebook;