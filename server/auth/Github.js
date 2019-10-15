const express = require("express");
const Github = express.Router();
const User = require("../schemas/User");
const axios = require("axios");
const jwt = require('jsonwebtoken');

Github.get("/", (req, res) => {
	res.send("No strategy chosen");
});


Github.post("/token", async (req, res) => {
	axios
		.post("https://github.com/login/oauth/access_token", {
			client_id: "801c25f9bef7da39dd86",
			client_secret: "a7ad2d92028a78f4e90c36546d19e8131b983ec8",
			code: req.body.code,
			state: req.body.state
		})
		.then(response => {
			params = JSON.parse(
				'{"' +
				decodeURI(response.data)
				.replace(/"/g, '\\"')
				.replace(/&/g, '","')
				.replace(/=/g, '":"') +
				'"}'
			);
			console.log(params);
			res.json(params);
		})
		.catch(error => {
			console.log(error);
			res.json({
				message: error
			});
		});
})

Github.post("/register", async (req, res) => {
	axios
		.get("https://api.github.com/user", {
			headers: {
				Authorization: "token " + req.body.access_token
			}
		})
		.then(response => {
			if (response.data) {
				user = new User({
					firstName: response.data.name,
					lastName: response.data.name,
					username: response.data.login,
					email: response.data.email,
					authProvider: "github"
				});
				user
					.save()
					.then(data => {
						res.status(200).json(data);
					})
					.catch(err => {
						res.status(200).json({
							message: err
						});
					});
			}
		})
		.catch(error => {
			res.json({
				message: error
			});
		});
})

Github.post("/login", async (req, res) => {
	axios
		.get("https://api.github.com/user", {
			headers: {
				Authorization: "token " + req.body.access_token
			}
		})
		.then(async response => {
			if (response.data) {
				let user = await User.findOne({
					email: response.data.email,
					authProvider: "github"
				});
				if (!user) {
					res.json({
						message: "No Github account registered. You need to register first."
					});
				} else {
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
					res.status(200).json(user);
				}
			}
		})
		.catch(error => {
			res.json({
				message: error
			});
		});
});

module.exports = Github;