// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var cookieParser = require("cookie-parser");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8080;

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({}));
app.set("view engine", "handlebars");

// Requiring our models for syncing
var db = require("./models");
var jwt = require('jsonwebtoken');
var jwtExp = require('express-jwt');

var gtGroupSecret = require('./config/secrets');
// I don't care about your HTTP Method
app.use(cookieParser(gtGroupSecret));

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Routes =============================================================

// 0 - AUTH MIDDLEWARE
app.use('/auth', require("./routes/auth-routes.js"));

// 1 - API MIDDLEWARE
app.use('/api', jwtExp({ secret: gtGroupSecret }));
app.use('/api', require("./routes/api-routes.js"));

// 2 - HOME PAGE MIDDLEWARE
// verify authorization via cookie using express-jwt
app.get('/', jwtExp({
  secret: gtGroupSecret,
  getToken: function fromCookie(req) {
    if (req.signedCookies) {
      return req.signedCookies.jwtAuthToken;
    }
    return null;
  },
  credentialsRequired: false
}), function (req, res, next) {
  // if user is signed-in, next()
  if (req.user) {
    next();
  } else {
    res.redirect('/auth/sign-in');
  }
});
app.use('/', require("./routes/user-routes.js"));

// Static directory
app.use(express.static("./public"));

// Syncing our sequelize models and then starting our express app
db.sequelize.sync({ force: true }).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});
