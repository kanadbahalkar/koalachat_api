var User = require('../models/user');

module.exports = {
  // Create the widget embed code
  createEmbedCode: function(req, res, next) {
    res.status(200).send({
      //Create embed code specific for the user
      code: '<script id="koala-index" u="' + req.body.userID + '" src="https://s3.amazonaws.com/koalachat/index.js"></script>'
    });
  }
}
