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
        // console.log(req.params.page)
        page = Number(req.params.page - 1) 

       
        // // console.log(result)
        // while (result.length < 20)
        // { 
        //     // console.log(result)
        //     page = page + 1
        //     // console.log('next ', page)
        //     response = await axios
        //         .get('https://ytss.unblocked.is/api/v2/list_movies.json?' + req.params.query + '&' + page)

        //     result = response.data.data.movies
        //     if(req.params.min_rate != 'null')
        //     {
        //         result2 = [];
        //         for(var i = 0; i < 20; i++)
        //         {
        //             if(result[i].rating >= req.params.min_rate)
        //             {
        //                 result2.push(result[i])
        //             }
        //         }
        //         result = result2
        //     }
        //     if(req.params.max_rate != 'null')
        //     {
        //         result2 = [];
        //         for(var i = 0; i < 20; i++)
        //         {
        //             if(result[i].rating <= req.params.max_rate)
        //             {
        //                 result2.push(result[i])
        //             }
        //         }
        //         result = result2
        //     }
        //     // console.log(result)
        // }
        // console.log(result)
        // res.json(result);


        axios
        .get('https://ytss.unblocked.is/api/v2/list_movies.json?' + req.params.query + '&' + page)
        .then(response => {
            result = response.data.data.movies
            if(req.params.min_rate != 'null')
            {
                result2 = [];
                for(var i = 0; i < 20; i++)
                {
                    if(result[i].rating >= req.params.min_rate)
                    {
                        result2.push(result[i])
                    }
                }
                result = result2
            }
            if(req.params.max_rate != 'null')
            {
                result2 = [];
                for(var i = 0; i < 20; i++)
                {
                    if(result[i].rating <= req.params.max_rate)
                    {
                        result2.push(result[i])
                    }
                }
                result = result2
            }
            // console.log(result)

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