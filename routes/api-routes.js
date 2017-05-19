// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");
var express = require('express');
var apiRouter = express.Router();

apiRouter.get('/user/:userId', function (req, res, next) {
  // find user in database
  db.User.findOne({
    id: req.params.userId
  }).then(function (user) {
    // respond
    res.status(200).json(user);
  }).catch(next);
});

// Routes
// =============================================================
module.exports = apiRouter;
