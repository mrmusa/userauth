// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
var express = require("express");
var bodyParser = require("body-parser");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8080;

// Requiring our models for syncing
var db = require("./models");

var jwt = require('jsonwebtoken');

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Static directory
app.use(express.static("./public"));

// Routes =============================================================

require("./routes/html-routes.js")(app);
var api = require("./routes/api-routes.js");

app.use('/api', api);
app.use('/api/secure', function (req, res, next) {
  // check authorization
  // if authorized next()
  if (!req.header('Authorization')) {
    res.status(401).json({ 'status': 'Not Authorized'});
  } else {
    jwt.verify(req.header('Authorization'), 'randomsecretforsigningjwt', function(err, decoded) {
      if (err) {
        console.log('err', err)
        res.status(401).json({ 'status': 'Not Authorized'});
      } else {
        console.log(decoded.data) // bar
        // query db for privileges for user
        // add to req.privs
        next();
      }
    });
  }
  // else res.status(401).json({})
});
app.use('/api/secure', api);

// Syncing our sequelize models and then starting our express app
db.sequelize.sync({ }).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});
