const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Express working.");
})

router.use('/users', require('./user_route'));

module.exports = router;