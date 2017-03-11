var config = require('../config/main');
var apiai = require('apiai');
var apiaiClient = apiai(config.api_ai_client_access_token);
var request = require('request');

module.exports = {

    //Add to Entities array after an owner signs up
    addOwnerIDEntrytoEntity: function(req, res, next) {

        var options = { 
            method: 'POST',
            url: 'https://api.api.ai/v1/entities/ownerID/entries',
            headers: 
            { 
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                authorization: 'Bearer ca74b5dba5f442cab9dcc1d09c653783' //This is the developer access token
            },
            body: 
            [{ value: req.body.ownerID, synonyms: [] }],
            json: true 
        };

        request(options, function (error, response, body) {
            if (error){ 
                res.status(200).send({
                    error: error,
                    status: "Error"
                });
            }
            res.status(200).send({
                result: response.body.result.status.code,
                status: "Success"
            });
        });
    },

    //Create Welcome message in api.ai
    setWelcomeIntent: function(req, res, next){
        
        var ownerID = req.body.ownerID;
        var welcomeMessage = req.body.welcomeMessage;

        var options = { 
            method: 'POST',
            url: 'https://api.api.ai/v1/intents',
            qs: { v: '20150910' },
            headers: 
            {
                'cache-control': 'no-cache',
                'content-type': 'application/json; charset=utf-8',
                authorization: 'Bearer ca74b5dba5f442cab9dcc1d09c653783' 
            },
            body: { 
                "templates": [],
                "userSays": [],
                "name": ownerID + ' Welcome Message', 
                "auto": true, 
                "contexts": [
                    ownerID
                ], 
                "userSays": [], 
                "responses": [{
                    "resetContexts": false,
                    "action": "input.welcome",
                    "affectedContexts": [],
                    "parameters": [],
                    "messages": [{
                        "type": 0,
                        "speech": [
                            welcomeMessage
                        ]
                    }]
                }],
                "priority": 500000,
                "webhookUsed": false,
                "webhookForSlotFilling": false,
                "fallbackIntent": false,
                "events": [
                    {
                        "name": ownerID + "WELCOME"
                    }
                ]
            },
            json: true 
        };

        request(options, function (error, response, body) {
            if (error){ 
                res.status(200).send({
                    error: error,
                    status: "Error"
                });
            }
            res.status(200).send({
                result: body,
                status: "Success"
            });
        });
    },

    //Create Intents after crawling FAQs 
    createIntent: function(req, res, next){
        
        var ownerID = req.body.ownerID;
        var intentQuestion = req.body.intentQuestion;
        var intentAnswer = req.body.intentAnswer;

        var options = { 
            method: 'POST',
            url: 'https://api.api.ai/v1/intents',
            qs: { v: '20150910' },
            headers: 
            {
                'cache-control': 'no-cache',
                'content-type': 'application/json; charset=utf-8',
                authorization: 'Bearer ca74b5dba5f442cab9dcc1d09c653783' 
            },
            body: { 
                "name": ownerID + ' ' + intentQuestion, 
                "auto": true, 
                "contexts": [
                    ownerID
                ], 
                "userSays": [{ 
                    "data": [
                        { 
                            "text": intentQuestion 
                        }
                    ], 
                    "isTemplate": false, 
                    "count": 0 
                }], 
                "responses": [{
                    "resetContexts": false,
                    "affectedContexts": [
                        {
                            "name": ownerID,
                            "lifespan": 5
                        }
                    ],
                    "parameters": [],
                    "messages": [
                        {
                            "type": 0,
                            "speech": intentAnswer
                        }
                    ]
                }], 
                "priority": 500000
            },
            json: true 
        };

        request(options, function (error, response, body) {
            console.log(response);
            if (error){ 
                res.status(200).send({
                    error: error,
                    status: "Error"
                });
            }
            res.status(200).send({
                result: body,
                status: "Success"
            });
        });
    },

    //Send message to Api.ai
    sendMessagetoApiAI: function(req, res, next) {
        var options = {
            sessionId: req.body.sessionId,
            contexts: [
                {
                    name: req.body.ownerID
                }
            ]
        };


        var request = apiaiClient.textRequest(req.body.question, options);

        request.on('response', function(response) {
            res.status(200).send({
                reply: response.result.fulfillment.speech,
                status: "Success"
            });
        });

        request.on('error', function(error) {
           res.status(200).send({
                reply: error,
                status: "Error"
            });
        });

        request.end();
    }
};