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

router.route('/fbbot/webhook/')
    .get((req, res) => {       
       
        let VERIFY_TOKEN = process.env.TOKEN;

        // Parse the query params
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        // Checks if a token and mode is in the query string of the request
        if (mode && token) {

            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {

                // Responds with the challenge token from the request
                console.log('WEBHOOK_VERIFIED');
                res.status(200).send(challenge);

            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        }
    })
    .post((req, res) => {
        var messaging_events = req.body.entry[0].messaging;
        for (var i = 0; i < messaging_events.length; i++) {
            var event = req.body.entry[0].messaging[i];
            var sender = event.sender.id;
            if (event.message && event.message.text) {
                var text = event.message.text;
                sendTextMessage(sender, text + "!");
            }
        }
        res.sendStatus(200);
    });

function sendTextMessage(sender, text) {
    var messageData = {
        text: text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error:', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

router.route('/fbbot')
    .get((req, res) => {
        if (req.query['hub.verify_token'] === token) {
            res.send(req.query['hub.challenge']);
        }
        res.send('Wrong token!');
    })
    .post((req, res) => {
        if (!validateRequest(req.body)) {
            console.log('wrong request');
        }

        res.json({
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

    var bind = typeof port === "string" ?
        "Pipe " + port :
        "Port " + port;

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