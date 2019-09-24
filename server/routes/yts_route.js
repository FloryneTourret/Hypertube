const express = require('express');
const axios = require('axios');
const Movie = require("../schemas/Movie");

const ytsRouter = express.Router({
	mergeParams: true
});

require('dotenv').config();

ytsRouter.get('/:query/:page/:min_rate/:max_rate/:min_year/:max_year', async (req, res) => {
	var result = [];
	var result2 = [];
	page = req.params.page

	axios
		.get('https://yts.unblocked.tw/api/v2/list_movies.json?' + req.params.query + '&' + page)
		.then(async response => {
			result = response.data.data.movies
			if (req.params.min_rate != 'null' && req.params.max_rate != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].rating >= req.params.min_rate && result[i].rating <= req.params.max_rate) {
						result2.push(result[i])
					}
				}
				result = result2
			} else if (req.params.min_rate != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].rating >= req.params.min_rate) {
						result2.push(result[i])
					}
				}
				result = result2
			} else if (req.params.max_rate != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].rating <= req.params.max_rate) {
						result2.push(result[i])
					}
				}
				result = result2
			}

			if (req.params.min_year != 'null' && req.params.max_year != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].year >= req.params.min_year && result[i].year <= req.params.max_year) {
						result2.push(result[i])
					}
				}
				result = result2
			} else if (req.params.min_year != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].year >= req.params.min_year) {
						result2.push(result[i])
					}
				}
				result = result2
			} else if (req.params.max_year != 'null') {
				result2 = [];
				for (var i = 0; i < 20; i++) {
					if (result[i].year <= req.params.max_year) {
						result2.push(result[i])
					}
				}
				result = result2
			}
			result2 = result
			if (req.params.query.includes('&query_term=')) {
				var result3;
				for (var i = 0; i < result2.length; i++) {
					console.log(result2[i].imdb_code, result2[i].title_english)
					result3 = await axios
						.get('http://www.omdbapi.com/?i=' + result2[i].imdb_code + '&apikey=9ddabdb9')
					result[i].director = result3.data.Director
					result[i].actors= result3.data.Actors
				}
			}
			res.json(result);
		})
		.catch(error => {
			res.json({
				message: error
			})
		})
});

ytsRouter.get('/preview/:id', async (req, res) => {
	movie = await Movie.findOne({
		movieID: req.params.id
	});
	if (movie != null) {
		res.json(movie);
	} else {
		console.log("No movie entry so creating one...")
		axios
			.get('https://yts.unblocked.tw/api/v2/movie_details.json?movie_id=' + req.params.id)
			.then(async (response) => {
				movieData = response.data.data.movie;
				console.log(movieData)
				result = await axios
					.get('http://www.omdbapi.com/?i=' + movieData.imdb_code + '&apikey=9ddabdb9')
				console.log(result.data)

				movie = new Movie({
					title: movieData.title,
					description: movieData.description_intro,
					genres: movieData.genres,
					year: movieData.year,
					rating: movieData.rating,
					backgroundImage: movieData.medium_cover_image,
					movieID: movieData.id,
					downloaded: false,
					imdbCode: movieData.imdb_code,
					runtime: result.data.Runtime,
					director: result.data.Director,
					writer: result.data.Writer,
					actors: result.data.Actors,

				});
				movie.torrents.push({
					url: movieData.torrents[0].url,
					hash: movieData.torrents[0].hash,
					size_bytes: movieData.torrents[0].size_bytes
				});
				console.log(movie)
				movie
					.save((err, docs) => {
						if (err)
							res.json({
								message: err
							});
						res.json(docs);
					})
			})
			.catch(error => {
				console.log(error);
				res.json({
					message: error
				})
			})
	}
})

module.exports = ytsRouter;