var path = require('path');
var express = require('express');

var paths = require('./../config/paths.js');

var app = express();

var PORT = 3000;

app.get('/bundle*', (req, res, next) => {
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'text/javascript');
  next();
})

app.use(express.static(paths.outPath));

app.listen(PORT, () => { console.log('Alpha dapp running at http://localhost:' + PORT) });
