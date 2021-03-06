var User = require('../models/user');
var SiteData = require('../models/sitedata');

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var htmlToText = require('html-to-text');
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Koala');
var origin = require('original');

function sanitizeUrl(host, link) {
    return url.resolve(host, link);
}

function generateQuestionID() {
  var qid = Math.random().toString(36).substring(3,16)+ +new Date;
  return qid;
}

function extractQnAs (sentences){
  var extractedQnAs = [];
  var question = '';
  var answer = '';
  sentences.forEach(function(sentence) {
    qid = generateQuestionID();

    if(question == '' && sentence.slice(-1) == '?'){
      question = sentence;
    }

    if(question != '' && sentence.slice(-1) == '?'){
      question = sentence;
      extractedQnAs.push({
        questionID: qid,
        question: question,
        answer: answer
      });
      answer = '';
    }

    if(question != '' && sentence.slice(-1) != '?'){
      answer += sentence;
    }
  });

  return extractedQnAs;
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
                    status: "Success"
                });
            });
          }
        });
    });
  },

  verifyEmbedCode : function(req, res, next){
    var website = req.body.website;
    var ownerid = req.body.ownerID;

    
    request(website, function(err, resp, body) {
      if (err) throw err;
      
      $ = cheerio.load(body);
      $("script").each(function(index, script){
        
        if(script.attribs.id && 
          script.attribs.id.indexOf('koala-index') != -1 && 
          script.attribs.u == ownerid && 
          script.attribs.src == 'https://s3.amazonaws.com/koalachat/index.js'){

          User.find(
            { 'userID': ownerid  }, 
            function(err, owner) {
              if (err) return next(err);
              
              if(!owner.websiteVerified || owner.websiteVerified != true){
                //Update the user data
                User.findOneAndUpdate(
                  { 'userID': ownerid  },
                  { 'websiteVerified': true  }, 
                  function(err, doc){
                      if (err) console.log(err);
                  }
                );

                res.status(200).send({
                  websiteVerified: true,
                  message: "KoalaChat is Correctly Installed on Your Site!",
                  status: "Success"
                });
              }
              else if(owner.websiteVerified == true){
                res.status(400).send({
                  websiteVerified: true,
                  message: 'Hmmm Chief Koala says your website is already verified! Are you trying to install KoalaChat on your website more than once? Unfortunately Chief Koala says you wont be able to do that! If your website is already verified, you should also have a valid account. Why dont you try logging in that account... :)',
                  status: "Error"
                });
              }
            });
          }
          else if(script.attribs.id && 
            script.attribs.id.indexOf('koala-index') != -1 && 
            script.attribs.u != ownerid && 
            script.attribs.src == 'https://s3.amazonaws.com/koalachat/index.js'){
            
            res.status(400).send({
              websiteVerified: false,
              message: 'Hmmm Chief Koala says the script tag on your website does not match his records! Try copy pasting the exact same script tag we provided inside the "head" tag of your home page. To complete the setup on your site, we need to verify this Embed Code. After you’re done pasting it, press the “Verify” button...',
              status: "Error"
            });
          }
        });
    });
  },

  findFAQs : function(req, res, next){
    
    var faqurl = sanitizeUrl('http://', req.body.faqurl);
    var owner = req.body.userID;
    var website = req.body.website;

    // if (origin.same(faqurl, website)) {

      request(faqurl, function(err, resp, body) {
        if (err) {
          res.status(400).send({
            err: err,
            message: 'Oh shoot! Looks like your FAQs link is not correct. Make sure you are using a valid FAQ link and that your site is live and running... :)',
            status: "Error"
          });
        }

        if(body){
          var text = htmlToText.fromString( body, {
            wordwrap: 130,
            ignoreImage: true,
            uppercaseHeadings: false
          });
          
          tokenizer.setEntry(text);
          var extractedQnAs = extractQnAs(tokenizer.getSentences());
        
          SiteData.findOneAndUpdate(
            { 'owner': owner  },
            { 
              'website': website,
              'faqUrl': faqurl,
              'qnaList': extractedQnAs
            },
            { upsert: true },
            function(err, sitedata) {
              if (err) return next(err);
              
              if(!sitedata){
                //Update the sitedata with FAQs
                var newSiteData = new SiteData({ 
                  'owner': owner,
                  'website': website,
                  'faqUrl': faqurl,
                  'qnaList': extractedQnAs 
                });

                res.status(200).send({
                  sitedata: newSiteData,
                  status: "Success"
                });
              }
              else if(sitedata){
                res.status(200).send({
                  sitedata: sitedata,
                  status: "Success"
                });
              }
            });
          }
      });
    // } else {
    //   console.log('Derp! ' + faqurl + ' and ' + website + ' are not the same origin');
    // }
  },

  //Get individual question
  findOneFAQ : function(req, res, next){
    
    var ownerID = req.body.ownerID;
    var questionID = req.body.questionID;
    
    SiteData.find(
      { 'qnaList.questionID': questionID }, { 'qnaList': { $elemMatch: { questionID: questionID } } },
      function(err, sitedata) {
        if (err) return next(err);
        
        res.status(200).send({
          sitedata: sitedata,
          status: "Success"
        });
      });
  },

  //Get FAQs from the database
  retrieveFAQs : function(req, res, next){
    
    var ownerID = req.body.ownerID;
    
    SiteData.find(
      { 'owner': ownerID },
      function(err, sitedata) {
        if (err) return next(err);
        res.status(200).send({
          sitedata: sitedata,
          status: "Success"
        });
      });
  },

  //Get FAQs count
  getFAQsCount : function(req, res, next){
    
    SiteData.find(
      { 'owner': req.body.ownerID },
      function(err, sitedata) {
        if (err) return next(err);
        if(sitedata[0]){
          res.status(200).send({
            faqsCount: sitedata[0].qnaList.length,
            status: "Success"
          });
        } 
        else {
          res.status(200).send({
            status: "Error: Sitedata is Null"
          });
        }
      });
  },
  
  //Add new question
  addNewFAQ : function(req, res, next){
    
    var ownerID = req.body.ownerID;
    var questionID = generateQuestionID();
    var question = req.body.question;
    var answer = req.body.answer;
    
    SiteData.findOneAndUpdate(
      { 'owner': ownerID, 'qnaList': { $exists: true } }, 
      { '$push': { 'qnaList' : { 'questionID': questionID, 'question': question, 'answer': answer } } },
      function(err, sitedata) {
        if (err) return next(err);
        res.status(200).send({
          sitedata: sitedata,
          status: "Success"
        });
      });
  },

  //Get FAQs from the database
  deleteFAQ : function(req, res, next){
    SiteData.update(
      { 'owner': req.body.ownerID },
      { $pull: { 'qnaList': { questionID: req.body.questionID } } },
      function(err, sitedata) {
        if (err) return next(err);
        res.status(200).send({
          sitedata: sitedata,
          status: "Success"
        });
      });
  },

  //Update a Question
  updateFAQ : function(req, res, next){
    
    var questionID = req.body.questionID;
    var question = req.body.question;
    var answer = req.body.answer;
    var ownerID = req.body.ownerID;
    
    SiteData.findOneAndUpdate(
      { 'qnaList.questionID': questionID }, 
      { '$set': { 'qnaList.$.question': question, 'qnaList.$.answer': answer } },
      function(err, sitedata) {
        if (err) return next(err);

        res.status(200).send({
          sitedata: sitedata,
          status: "Success"
        });
      });
  },

  //Update entire FAQ list
  updateAllFAQs : function(req, res, next){
    
    var ownerID = req.body.ownerID;
    var qnaList = req.body;
    
    SiteData.findOneAndUpdate(
      { 'owner': ownerID }, 
      { 'qnaList': qnaList }, 
      function(err, sitedata){
        if (err) return res.send(500, { error: err });
        
        res.status(200).send({
          sitedata: sitedata,
          status: "Success"
        });
      });
  }  
}
