const express = require("express");
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const https = require("https");
const PORT = 5001;
const routes = require("./routes/index");
const auth = require("./auth/index");
const schedule = require('node-schedule');

const cleanMovies = require('./middlewares/cleanMovies');

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(
	express.urlencoded({
		extended: true
	})
);

app.use(cors());
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: true
		}
	})
);

app.set('Secret', process.env.SECRET);
mongoose.connect(
	process.env.DB_CONNECTION, {
		useNewUrlParser: true
	},
	() => {
		console.log("Connected to db!");
	}
);
mongoose.set('useCreateIndex', true);
app.use(function (req, res, next) {
	var err = null;
	try {
		decodeURIComponent(req.path)
	} catch (e) {
		err = e;
	}
	if (err) {
		console.log(err, req.url);
		return res.redirect(['https://', req.get('Host'), '/404'].join(''));
	}
	next();
});


app.use("/api/v1/", routes);
app.use("/auth/", auth);

server = https.createServer({
		key: fs.readFileSync("server.key"),
		cert: fs.readFileSync("server.cert")
	},
	app
);

server.listen(PORT, function () {
	console.log("Listening on port 5001! Go to https://localhost:5001/");
});

var rule = new schedule.RecurrenceRule();
rule.minute = 42;

var j = schedule.scheduleJob(rule, function (fireDate) {
	console.log("This should run at " + fireDate + " and it ran at " + new Date().toISOString());
	cleanMovies();
});