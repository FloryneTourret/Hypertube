const express = require('express');
const axios = require('axios');

const filmRouter = express.Router({
    mergeParams: true
});

require('dotenv').config();

filmRouter.get('/:query/:page/:min_rate/:max_rate/:min_year/:max_year', async (req, res) => {
        var response = []
        var result = [];
        var result2 = [];
        page = req.params.page

        axios
        .get('https://ytss.unblocked.is/api/v2/list_movies.json?' + req.params.query + '&' + page)
        .then(async response => {
            result = response.data.data.movies
            if(req.params.min_rate != 'null' && req.params.max_rate != 'null')
            {
                result2 = [];
                for(var i = 0; i < 20; i++)
                {
                    console.log('Min rate Max rate '+page + ' '  +result[i].rating)
                    if(result[i].rating >= req.params.min_rate && result[i].rating <= req.params.max_rate)
                    {
                        result2.push(result[i])
                    }
                }
                result = result2
            }
            else if(req.params.min_rate != 'null')
            {
                result2 = [];
                for(var i = 0; i < 20; i++)
                {
                    console.log('Min rate '+page + ' '  +result[i].rating)
                    if(result[i].rating >= req.params.min_rate)
                    {
                        result2.push(result[i])
                    }
                }
                result = result2
            }
            else if(req.params.max_rate != 'null')
            {
                result2 = [];
                for(var i = 0; i < 20; i++)
                {
                    console.log('Max rate '+page + ' '  +result[i].rating)
                    if(result[i].rating <= req.params.max_rate)
                    {
                        result2.push(result[i])
                    }
                }
                result = result2
            }

            if(req.params.min_year != 'null' && req.params.max_year != 'null')
            {
                result2 = [];
                for(var i = 0; i < 20; i++)
                {

                    console.log('Min year Max year '+page + ' '  +result[i].year)
                    if(result[i].year >= req.params.min_year && result[i].year <= req.params.max_year)
                    {
                        result2.push(result[i])
                    }
                }
                result = result2
            }
            else if(req.params.min_year != 'null')
            {
                result2 = [];
                for(var i = 0; i < 20; i++)
                {
                    console.log('Min year '+req.params.min_year+' '+page + ' '  +result[i].year)
                    if(result[i].year >= req.params.min_year)
                    {
                        result2.push(result[i])
                    }
                }
                result = result2
            }
            else if(req.params.max_year != 'null')
            {
                result2 = [];
                for(var i = 0; i < 20; i++)
                {
                    console.log('Max year '+req.params.max_year+' '+page + ' '  +result[i].year)
                    if(result[i].year <= req.params.max_year)
                    {
                        result2.push(result[i])
                    }
                }
                result = result2
            }

            result2 = result

            
            if(req.params.query.includes('&query_term='))
            {
                var result3
                for(var i = 0; i < result2.length; i++)
                {
                    console.log(result2[i].imdb_code, result2[i].title_english)
                    result3 = await axios
                        .get('https://api.themoviedb.org/3/find/' + result2[i].imdb_code + '?api_key=59ee6bcf4defabdab144ef39b952da57&language=en-US&external_source=imdb_id')
                    result[i].title_english = result3.data.movie_results[0].title
                }
            }
            else{
                console.log('Pas de recherche')
            }
            

            res.json(result);
        })
        .catch(error => {
            res.json({
                message: error
            })
        })
});

filmRouter.get('/preview/:id', async (req, res) => {
    // console.log(req.params.params);
    axios
    .get('https://ytss.unblocked.is/api/v2/movie_details.json?movie_id=' + req.params.id)
    .then(response => {
        res.json(response.data);
    })
    .catch(error => {
        res.json({
            message: error
        })
    })
})

module.exports = filmRouter;