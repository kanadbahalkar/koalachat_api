var User = require('../models/user');

module.exports = {
  // Create the widget embed code
  createEmbedCode: function(req, res, next) {
    res.status(200).send({
      //Create embed code specific for the user
      //TODO:
      //1. Create jquery reference from with this served script
      //2. Create socket.io js reference from with this served script
      //3. Handle CSS for the widget so it doesn't overlap with the host page CSS
      code: '<script id="koala-index" u="' + req.body.userID + '" src="assets/js/index.js"></script>'
    });
  },

  // Verify if widget code is embedded on owner's website
  verifyEmbedCode: function(req, res, next) {
      //TODO
      //Write method to Verify if the script is live on req.body.website
      res.status(200).send({
        verified: true
        //Replace true with whatever the result of the verfication method is
      });
  }
}
