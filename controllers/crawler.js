var User = require('../models/user');
var SiteData = require('../models/sitedata');

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var htmlToText = require('html-to-text');
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Koala');

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
  },

  findFAQs : function(req, res, next){
    
    var faqurl = req.body.faqurl;
    var owner = req.body.ownerID;

    request(faqurl, function(err, resp, body) {
        
      if (err) throw err;
      
      var text = htmlToText.fromString( body, {
        wordwrap: 130,
        ignoreImage: true,
        uppercaseHeadings: false
      });
      
      tokenizer.setEntry(text);
      var extractedQnAs = extractQnAs(tokenizer.getSentences());
      
      var sitedata = new SiteData({ 
        faqUrl: faqurl,
        qnaList: extractedQnAs,
        owner: owner,
        faqUrl: faqurl
      });
      
      sitedata.save(function(err) {
        if (err) throw err
        else {
          res.status(200).send({
            sitedata: sitedata,
            status: "Success!"
          });
        }
      });
    });
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
          status: "Success!"
        });
      });
  },
  
  //Add new question
  addNewFAQ : function(req, res, next){
    
    var ownerID = req.body.ownerID;
    var questionID = generateQuestionID();
    var question = req.body.question;
    var answer = req.body.answer;
    
    SiteData.findOneAndUpdate(
      { '_id': ownerID, 'qnaList': { $exists: true } }, 
      { '$push': { 'qnaList' : { 'questionID': questionID, 'question': question, 'answer': answer } } },
      { 'new': true }, 
      function(err, sitedata) {
        if (err) return next(err);
        
        res.status(200).send({
          sitedata: sitedata,
          status: "Success!"
        });
      });
  },

  //Update a Question
  updateFAQ : function(req, res, next){
    
    var ownerID = req.body.ownerID;
    var questionID = req.body.questionID;
    var question = req.body.question;
    var answer = req.body.answer;
    
    SiteData.findOneAndUpdate(
      { '_id': ownerID, 'qnaList.questionID': questionID }, 
      { '$set': { 'qnaList.$.question': question, 'qnaList.$.answer': answer } },
      { 'new': true }, 
      function(err, sitedata) {
        if (err) return next(err);
        
        res.status(200).send({
          sitedata: sitedata,
          status: "Success!"
        });
      });
  }  
}
