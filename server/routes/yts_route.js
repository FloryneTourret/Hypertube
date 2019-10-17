const express = require('express');
const axios = require('axios');
const Movie = require("../schemas/Movie");
const ytsRouter = express.Router({
	mergeParams: true
});
const http = require('http');

require('dotenv').config();
function cleanNumber(str) {
	if (str) {
	  let s2 = "";
	  let alphanum = new RegExp("^[0-9_]*$");
	  for (var i = 0; i < str.length; i++) {
		if (alphanum.test(str[i])) s2 += str[i];
	  }
	  return s2;
	}
  }

ytsRouter.get('/:query/:page/:min_rate/:max_rate/:min_year/:max_year', async (req, res) => {
	var result = [];
	var result2 = [];
	page = req.params.page
	if(req.params.min_rate != 'null')
		req.params.min_rate = cleanNumber(req.params.min_rate)
	if(req.params.max_rate !== 'null')
		req.params.max_rate = cleanNumber(req.params.max_rate)
	if(req.params.min_year !== 'null')
		req.params.min_year = cleanNumber(req.params.min_year)
	if(req.params.max_year !== 'null')
		req.params.max_year = cleanNumber(req.params.max_year)
	if(req.params.min_rate == 'undefined')
		req.params.min_rate = 'null'
	if(req.params.max_rate == 'undefined')
		req.params.max_rate = 'null'
	if(req.params.min_year == 'undefined')
		req.params.min_year = 'null'
	if(req.params.max_year == 'undefined')
		req.params.max_year = 'null'

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
					result3 = await axios
						.get('http://www.omdbapi.com/?i=' + result2[i].imdb_code + '&apikey=9ddabdb9')
					result[i].director = result3.data.Director
					result[i].actors = result3.data.Actors
				}
			}
			for (var i = 0; i < result.length; i++) {
				if (result[i].torrents.length == 0) {
					result.splice(i, 1);
					continue;
				}
				img = await axios.get(result[i].medium_cover_image);
				if (!['image/jpeg', 'image/png'].includes(img.headers['content-type'])) {
					console.log(result[i].title + " has not valid image");
					result.splice(i, 1);
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
		console.log("New movie entry...")
		axios
			.get('https://yts.unblocked.tw/api/v2/movie_details.json?movie_id=' + req.params.id)
			.then(async (response) => {
				movieData = response.data.data.movie;
				// console.log(movieData)
				axios
					.get('http://www.omdbapi.com/?i=' + movieData.imdb_code + '&apikey=9ddabdb9')
					.then(async result => {
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
						for (torrent of movieData.torrents) {
							if (["1080p", "720p"].includes(torrent.quality) && torrent.seeds > 0 && torrent.seeds > torrent.peers) {
								movie.torrents.push({
									url: torrent.url,
									hash: torrent.hash,
									size_bytes: torrent.size_bytes,
									fileName: torrent.file,
									quality: torrent.quality
								});
							}
						}
						movie
							.save((err, docs) => {
								if (err)
									res.json({
										message: err
									});
								res.json(movie);
							})
					})
					.catch(error => {
						console.log(error);
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