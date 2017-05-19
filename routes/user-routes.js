// *********************************************************************************
// user-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");

var express = require('express');
var userRouter = express.Router();

userRouter.get('/', function (req, res) {
  res.render('profile', { user: req.user })
});

// Routes
// =============================================================
module.exports = userRouter;
