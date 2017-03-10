var config = require('../config/main');
var apiai = require('apiai');
var apiaiClient = apiai(config.api_ai_client_access_token);
var request = require('request');

module.exports = {

    //Add to Entities array after an owner signs up
    addOwnerIDEntrytoEntity: function(req, res, next) {

        var options = { method: 'POST',
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

    //Create Intents after crawling FAQs 

    //Send message to Api.ai
    sendMessagetoApiAI: function(req, res, next) {
        var request = apiaiClient.textRequest(req.body.message, {
            sessionId: req.body.sessionId //Send ownerID or visitorID from here
        });

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