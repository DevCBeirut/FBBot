const
    _ = require('lodash'),
    express = require('express'),
    app = express(),
    path = require('path'),
    fbbot = require('./fbbot');

var bodyParser = require('body-parser');

require('./config/config.js');

var port = process.env.PORT || global.gConfig.node_port;
var router = express.Router();
app.use('/', express.static(path.join(__dirname, 'FBBot')));
app.use('/', router);
app.on('error', onError);
app.listen(port);
console.log('new server created on port ' + port);


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());



router.use(function (req, res, next) {
    console.log('API is called.');
    next();
});


router.get('/', function (req, res) {
    res.json({
        message: 'Welcome to Bot API'
    });
});
router.get('/authorize',
    function (req, res) {
        var accountLinkingToken = req.query.account_linking_token;
        var redirectURI = req.query.redirect_uri;

        // Authorization Code should be generated per user by the developer. This will
        // be passed to the Account Linking callback.
        var authCode = "1234567890";

        // Redirect users to this URI on successful login
        var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

        res.render('authorize', {
            accountLinkingToken: accountLinkingToken,
            redirectURI: redirectURI,
            redirectURISuccess: redirectURISuccess
        });
    });
router.route('/fbbot/webhook/')
    .get((req, res) => {
        if (req.query['hub.mode'] === 'subscribe' &&
            req.query['hub.verify_token'] === VALIDATION_TOKEN) {
            console.log("Validating webhook");
            res.status(200).send(req.query['hub.challenge']);
        } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            res.sendStatus(403);
        }
    })
    .post((req, res) => {
        var data = req.body;

        // Make sure this is a page subscription
        if (data.object == 'page') {
            // Iterate over each entry
            // There may be multiple if batched
            data.entry.forEach(function (pageEntry) {
                var pageID = pageEntry.id;
                var timeOfEvent = pageEntry.time;

                // Iterate over each messaging event
                pageEntry.messaging.forEach(function (messagingEvent) {
                    if (messagingEvent.optin) {
                        receivedAuthentication(messagingEvent);
                    } else if (messagingEvent.message) {
                        receivedMessage(messagingEvent);
                    } else if (messagingEvent.delivery) {
                        receivedDeliveryConfirmation(messagingEvent);
                    } else if (messagingEvent.postback) {
                        receivedPostback(messagingEvent);
                    } else if (messagingEvent.read) {
                        receivedMessageRead(messagingEvent);
                    } else if (messagingEvent.account_linking) {
                        receivedAccountLink(messagingEvent);
                    } else {
                        console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                    }
                });
            });

            // Assume all went well.
            //
            // You must send back a 200, within 20 seconds, to let us know you've
            // successfully received the callback. Otherwise, the request will time out.
            res.sendStatus(200);
        }
    });

function sendTextMessage(sender, text, token) {
    const FBMessenger = require('fb-messenger')
    const messenger = new FBMessenger({
        token: token
    })
    try {
        console.info("Sending message...");
        console.info("Sender: " + sender);
        console.info("Message: " + text);
        messenger.sendTextMessage(sender, text);
    } catch (e) {
        console.error(e)
    }
}

router.route('/fbbot')
    .get((req, res) => {
        if (req.query['hub.verify_token'] === process.env.TOKEN) {
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

module.exports = app;