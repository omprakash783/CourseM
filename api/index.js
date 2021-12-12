const express = require('express');
var config = require('../config.js');

module.exports = (app) => {
    // Initialize the ExpressJS router
    var router = express.Router();
    let version = config.api.version;

    // Inclue the routes
    require(`./${version}/routes`)(router);

    // Prefix the routes with /api/v1
    app.use(`/api/${version}`, router);
};