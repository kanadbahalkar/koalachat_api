var SiteData = require('../models/sitedata');
var User = require('../models/user');
var Crawler = require("crawler");
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');

function sanitizeUrl(host, link) {
    return url.resolve(host, link);
}

module.exports = {
  findFAQsURL: function(req, res, next) {

    var website = req.body.website;
    var userid = req.body.userID;

    // c.queue(req.body.website);

    request(website, function(err, resp, body) {
        if (err)
            throw err;
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
              
              if(!owner || owner == undefined || owner == null) {
                res.status(422).send({"message": "Owner with given id not found", "status": "failure"});
              }
              
              owner.save();

              res.status(200).send({
                  message: "FAQs Found!",
                  status: "success"
              });
          });
        }
      });
    });
  }
}
