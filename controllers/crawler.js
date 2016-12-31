var User = require('../models/user');
var SiteData = require('../models/sitedata');

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Koala');

function sanitizeUrl(host, link) {
    return url.resolve(host, link);
}

module.exports = {
  findFAQsURL: function(req, res, next) {

    var website = req.body.website;
    var userid = req.body.userID;

    request(website, function(err, resp, body) {
        
        if (err) throw err;
        
        $ = cheerio.load(body);
        $("a").each(function(index, a){
          if(a.attribs.href && 
            ((a.attribs.href.indexOf('faq') > -1) || 
              a.attribs.href.indexOf('frequently-asked-questions') > -1 || 
              a.attribs.href.indexOf('commonly-asked-questions') > -1 || 
              a.attribs.href.indexOf('frequent-questions') > -1 )){

            var faqurl = sanitizeUrl(website, a.attribs.href);
            
            //Find user and update FAQ url
            User.findOneAndUpdate(
              { 'userID': userid  }, 
              { 'faqurl': faqurl  },
              function(err, owner) {
                if (err) return next(err);
                res.status(200).send({
                    message: "FAQs Found!",
                    status: "success"
                });
            });
          }
        });
    });
  },

  verifyEmbedCode : function(req, res, next){
    
    var website = req.body.website;
    var userid = req.body.userID;

    request(website, function(err, resp, body) {
        
      if (err) throw err;
      
      $ = cheerio.load(body);
      $("script").each(function(index, script){
        if(script.attribs.id && 
          script.attribs.id.indexOf('koala-index') > -1 && 
          script.attribs.u === req.body.userID && 
          script.attribs.src === 'https://s3.amazonaws.com/koalachat/index.js'){

          User.findOneAndUpdate(
            { 'userID': userid  }, 
            { 'websiteVerified': true  },
            function(err, owner) {
              if (err) return next(err);
              
              res.status(200).send({
                message: "Site Has KoalaChat Correctly Installed!",
                status: "success"
              });
            });
          }
        });
    });
  }
}
