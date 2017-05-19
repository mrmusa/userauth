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

// REQUEST GET /auth/sign-in
// Static directory
app.use(express.static("./public"));

// Routes =============================================================

// 0 - AUTH MIDDLEWARE
var auth = require("./routes/auth-routes.js");
app.use('/auth', auth);

// 1 - API MIDDLEWARE
var api = require("./routes/api-routes.js");
app.use(jwtExp({ secret: gtGroupSecret }));
app.use('/api', api);

// 2 - HOME PAGE MIDDLEWARE
app.use(jwtExp({
  secret: gtGroupSecret,
  getToken: function fromCookie(req) {
    if (req.signedCookies) {
      return req.signedCookies.jwtAuthToken;
    }
    return null;
  },
  credentialsRequired: false
}));
app.get('/', function (req, res, next) {
  // if user is signed-in, next()
  if (req.user) {
    next();
  } else {
    res.redirect('/auth/sign-in');
  }
});

// 3 - USER PAGES MIDDLEWARES
var userPages = require("./routes/user-routes.js");
// verify authorization via cookie using express-jwt
app.use('/', jwtExp({
  secret: gtGroupSecret,
  getToken: function fromCookie(req) {
    if (req.signedCookies) {
      return req.signedCookies.jwtAuthToken;
    }
    return null;
  }
}));
app.use('/', userPages);
app.use('/', function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.redirect('/auth/sign-in');
  }
});


// Syncing our sequelize models and then starting our express app
db.sequelize.sync({ }).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});
