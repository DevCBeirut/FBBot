const _ = require('lodash');
const express = require('express');
const app = express();
const path = require('path');
var bodyParser = require('body-parser');

require('./config/config.js');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());



var port = process.env.PORT || global.gConfig.node_port;
var router = express.Router();

router.use(function (req, res, next) {
    console.log('API is called.');
    next();
});


router.get('/', function (req, res) {
    res.json({
        message: 'Welcome to Bot API'
    });
});

router.route('/fbbot')
    .get((req, resp) => {
        resp.json({
            message: 'BOTT'
        });
    })
    .post((req, resp) => {
        if (!validateRequest(req.body)) {
            console.log('wrong request');
        }

        resp.json({
            message: 'BOTT'
        });
    });


app.use('/', express.static(path.join(__dirname, 'FBBot')));    
app.use('/', router);
app.on('error', onError);
app.listen(port);
console.log('new server created on port ' + port);

function onError(error) {
    if (error.syscall !== "listen") {
      throw error;
    }
  
    var bind = typeof port === "string"
      ? "Pipe " + port
      : "Port " + port;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
function validateRequest(body) {

}